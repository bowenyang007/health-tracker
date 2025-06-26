import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);

// Replace with your actual contract address once deployed
const CONTRACT_ADDRESS = "0x1"; // Placeholder - you'll need to deploy your contract and update this

export class AptosHealthService {
  /**
   * Store health data on-chain
   */
  static async storeHealthData(signAndSubmitTransaction, account, healthData) {
    if (!account) {
      throw new Error("Wallet not connected");
    }

    try {
      const response = await signAndSubmitTransaction({
        sender: account.address.toString(),
        data: {
          function: `${CONTRACT_ADDRESS}::health_tracker::store_health_data`,
          functionArguments: [
            healthData.weight || 0,
            healthData.date || Date.now(),
            JSON.stringify(healthData) // Store full data as JSON string
          ],
        },
      });

      // Wait for transaction confirmation
      await aptos.waitForTransaction({ transactionHash: response.hash });
      
      return {
        success: true,
        hash: response.hash,
        message: "Health data stored on Aptos blockchain!"
      };
    } catch (error) {
      console.error("Error storing health data:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Load health data from chain
   */
  static async loadHealthData(account) {
    if (!account) {
      throw new Error("Wallet not connected");
    }

    try {
      // Query the contract for user's health data
      const resource = await aptos.getAccountResource({
        accountAddress: account.address.toString(),
        resourceType: `${CONTRACT_ADDRESS}::health_tracker::HealthData`
      });

      return {
        success: true,
        data: resource.data
      };
    } catch (error) {
      console.error("Error loading health data:", error);
      // Return empty data if resource doesn't exist (first time user)
      return {
        success: true,
        data: []
      };
    }
  }

  /**
   * Clear health data from chain
   */
  static async clearHealthData(signAndSubmitTransaction, account) {
    if (!account) {
      throw new Error("Wallet not connected");
    }

    try {
      const response = await signAndSubmitTransaction({
        sender: account.address.toString(),
        data: {
          function: `${CONTRACT_ADDRESS}::health_tracker::clear_health_data`,
          functionArguments: [],
        },
      });

      await aptos.waitForTransaction({ transactionHash: response.hash });
      
      return {
        success: true,
        hash: response.hash,
        message: "Health data cleared from blockchain!"
      };
    } catch (error) {
      console.error("Error clearing health data:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Load demo data to chain
   */
  static async loadDemoData(signAndSubmitTransaction, account) {
    if (!account) {
      throw new Error("Wallet not connected");
    }

    // Generate 90 days of demo weight data (195 -> 170 lbs)
    const demoData = [];
    const startWeight = 195;
    const endWeight = 170;
    const days = 90;
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      
      // Gradual weight loss with some variance
      const progress = i / days;
      const weight = startWeight - (startWeight - endWeight) * progress + (Math.random() - 0.5) * 3;
      
      demoData.push({
        weight: Math.round(weight * 10) / 10,
        date: date.toISOString().split('T')[0],
        timestamp: date.getTime()
      });
    }

    try {
      const response = await signAndSubmitTransaction({
        sender: account.address.toString(),
        data: {
          function: `${CONTRACT_ADDRESS}::health_tracker::load_demo_data`,
          functionArguments: [
            JSON.stringify(demoData)
          ],
        },
      });

      await aptos.waitForTransaction({ transactionHash: response.hash });
      
      return {
        success: true,
        hash: response.hash,
        message: "Demo data loaded to blockchain!"
      };
    } catch (error) {
      console.error("Error loading demo data:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default AptosHealthService; 