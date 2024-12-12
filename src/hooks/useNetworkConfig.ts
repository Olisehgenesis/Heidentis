// Define NetworkConfig interface to match what MirrorNodeClient expects
export interface NetworkConfig {
    mirrorNodeUrl: string;
    network: string;
    jsonRpcUrl: string;
    chainId: number;
  }
  
  // Define network configuration with all required properties
  export const NetworkConfig: NetworkConfig = {
    mirrorNodeUrl: 'https://testnet.mirrornode.hedera.com',
    network: 'testnet',
    jsonRpcUrl: 'https://testnet.hashio.io/api',
    chainId: 296, // Hedera Testnet Chain ID
  };