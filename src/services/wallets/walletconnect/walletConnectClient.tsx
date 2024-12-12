import { WalletConnectContext } from "../../../contexts/WalletConnectContext";
import { useCallback, useContext, useEffect } from 'react';
import { WalletInterface } from "../walletInterface";
import { AccountId, ContractExecuteTransaction, ContractId, LedgerId, TokenAssociateTransaction, TokenId, Transaction, TransactionId, TransferTransaction, Client } from "@hashgraph/sdk";
import { ContractFunctionParameterBuilder } from "../contractFunctionParameterBuilder";
import { appConfig } from "../../../config";
import { SignClientTypes } from "@walletconnect/types";
import { DAppConnector, HederaJsonRpcMethod, HederaSessionEvent, HederaChainId, SignAndExecuteTransactionParams, transactionToBase64String } from "@hashgraph/hedera-wallet-connect";

class SimpleEventEmitter {
  private listeners: { [key: string]: Function[] } = {};

  addListener(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  removeListener(event: string, callback: Function) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event: string, ...args: any[]) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback(...args));
  }
}

const refreshEvent = new SimpleEventEmitter();

const walletConnectProjectId = "377d75bb6f86a2ffd427d032ff6ea7d3";
const currentNetworkConfig = appConfig.networks.testnet;
const hederaNetwork = currentNetworkConfig.network;
const hederaClient = Client.forName(hederaNetwork);

const metadata: SignClientTypes.Metadata = {
  name: "He-identis",
  description: "Verifiable Credentials on Hedera",
  url: window.location.origin,
  icons: [window.location.origin + "/logo192.png"],
}

const dappConnector = new DAppConnector(
  metadata,
  LedgerId.fromString(hederaNetwork),
  walletConnectProjectId,
  Object.values(HederaJsonRpcMethod),
  [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
  [HederaChainId.Testnet],
);

let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

const initializeWalletConnect = async () => {
  if (!initializationPromise) {
    initializationPromise = dappConnector.init().then(() => {
      isInitialized = true;
    }).catch((error) => {
      console.error("WalletConnect initialization error:", error);
      isInitialized = false;
      initializationPromise = null;
    });
  }
  return initializationPromise;
};

export const openWalletConnectModal = async () => {
  try {
    if (!isInitialized) {
      await initializeWalletConnect();
    }
    
    const modalPromise = dappConnector.openModal();
    modalPromise.then(() => {
      refreshEvent.emit("sync");
    }).catch((error) => {
      console.error("Error opening WalletConnect modal:", error);
    });

    return modalPromise;
  } catch (error) {
    console.error("Error in openWalletConnectModal:", error);
    throw error;
  }
};

class WalletConnectWallet implements WalletInterface {
  private accountId() {
    return AccountId.fromString(dappConnector.signers[0].getAccountId().toString());
  }

  private async signAndExecuteTransaction(transaction: Transaction) {
    const params: SignAndExecuteTransactionParams = {
      signerAccountId: `::${this.accountId().toString()}`,
      transactionList: transactionToBase64String(transaction)
    };
    try {
      const result = await dappConnector.signAndExecuteTransaction(params);
      return result.result;
    } catch (error) {
      console.error("Transaction error:", error);
      return null;
    }
  }

  private freezeTx(transaction: Transaction) {
    const nodeAccountIds = hederaClient._network.getNodeAccountIdsForExecute();
    return transaction
      .setTransactionId(TransactionId.generate(this.accountId()))
      .setNodeAccountIds(nodeAccountIds)
      .freeze();
  }

  async transferHBAR(toAddress: AccountId, amount: number) {
    const transferHBARTransaction = new TransferTransaction()
      .addHbarTransfer(this.accountId(), -amount)
      .addHbarTransfer(toAddress, amount);

    const frozenTx = this.freezeTx(transferHBARTransaction);
    const txResult = await this.signAndExecuteTransaction(frozenTx);
    return txResult ? txResult.transactionId : null;
  }

  async transferFungibleToken(toAddress: AccountId, tokenId: TokenId, amount: number) {
    const transferTokenTransaction = new TransferTransaction()
      .addTokenTransfer(tokenId, this.accountId(), -amount)
      .addTokenTransfer(tokenId, toAddress.toString(), amount);

    const frozenTx = this.freezeTx(transferTokenTransaction);
    const txResult = await this.signAndExecuteTransaction(frozenTx);
    return txResult ? txResult.transactionId : null;
  }

  async transferNonFungibleToken(toAddress: AccountId, tokenId: TokenId, serialNumber: number) {
    const transferTokenTransaction = new TransferTransaction()
      .addNftTransfer(tokenId, serialNumber, this.accountId(), toAddress);

    const frozenTx = this.freezeTx(transferTokenTransaction);
    const txResult = await this.signAndExecuteTransaction(frozenTx);
    return txResult ? txResult.transactionId : null;
  }

  async associateToken(tokenId: TokenId) {
    const associateTokenTransaction = new TokenAssociateTransaction()
      .setAccountId(this.accountId())
      .setTokenIds([tokenId]);

    const frozenTx = this.freezeTx(associateTokenTransaction);
    const txResult = await this.signAndExecuteTransaction(frozenTx);
    return txResult ? txResult.transactionId : null;
  }

  async executeContractFunction(contractId: ContractId, functionName: string, functionParameters: ContractFunctionParameterBuilder, gasLimit: number) {
    const tx = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(gasLimit)
      .setFunction(functionName, functionParameters.buildHAPIParams());

    const frozenTx = this.freezeTx(tx);
    const txResult = await this.signAndExecuteTransaction(frozenTx);
    return txResult ? txResult.transactionId : null;
  }

  disconnect() {
    dappConnector.disconnectAll().then(() => {
      refreshEvent.emit("sync");
      isInitialized = false;
    }).catch((error) => {
      console.error("Disconnect error:", error);
    });
  }
}

export const walletConnectWallet = new WalletConnectWallet();

export const WalletConnectClient = () => {
  const { setAccountId, setIsConnected } = useContext(WalletConnectContext);

  const syncWithWalletConnectContext = useCallback(() => {
    try {
      const accountId = dappConnector.signers[0]?.getAccountId()?.toString();
      if (accountId) {
        setAccountId(accountId);
        setIsConnected(true);
      } else {
        setAccountId('');
        setIsConnected(false);
      }
    } catch (error) {
      console.error("Sync error:", error);
      setAccountId('');
      setIsConnected(false);
    }
  }, [setAccountId, setIsConnected]);

  useEffect(() => {
    refreshEvent.addListener("sync", syncWithWalletConnectContext);

    initializeWalletConnect().then(() => {
      syncWithWalletConnectContext();
    }).catch((error) => {
      console.error("Initialization error in effect:", error);
    });

    return () => {
      refreshEvent.removeListener("sync", syncWithWalletConnectContext);
    }
  }, [syncWithWalletConnectContext]);
  
  return null;
};