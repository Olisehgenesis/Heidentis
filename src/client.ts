import { Client } from "@hashgraph/sdk";



function operatorClient() {
    // check for env variables
    if (!import.meta.env.VITE_MY_ACCOUNT_ID || !import.meta.env.VITE_MY_PRIVATE_KEY) {
      throw new Error('Missing environment variables. Check your .env file.');
    }
    try {
      const client = Client.forTestnet();
      client.setOperator(
        import.meta.env.VITE_MY_ACCOUNT_ID,
        import.meta.env.VITE_MY_PRIVATE_KEY
      );
        return client;
    } catch (err) {
      console.error(err);
    }

}

export default operatorClient;
    