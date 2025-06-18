import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

class AptosService {
  constructor() {
    // Initialize Aptos client for testnet
    const aptosConfig = new AptosConfig({ 
      network: Network.TESTNET 
    });
    this.aptos = new Aptos(aptosConfig);
    
    // Contract details (to be updated after deployment)
    this.contractAddress = null; // Will be set after deployment
    this.moduleName = "health_tracker";
  }

  /**
   * Set the contract address after deployment
   */
  setContractAddress(address) {
    this.contractAddress = address;
  }

  /**
   * Initialize health data for a user
   */
  async initializeHealthData(account) {
    if (!this.contractAddress) {
      throw new Error("Contract address not set");
    }

    const transaction = await this.aptos.transaction.build.simple({
      sender: account.address,
      data: {
        function: `${this.contractAddress}::${this.moduleName}::initialize`,
        functionArguments: []
      }
    });

    const response = await this.aptos.signAndSubmitTransaction({
      signer: account,
      transaction
    });

    await this.aptos.waitForTransaction({ transactionHash: response.hash });
    return response;
  }

  /**
   * Add a weight entry
   * @param {Object} account - User account
   * @param {number} weightKg - Weight in kilograms (will be converted to precise format)
   */
  async addWeight(account, weightKg) {
    if (!this.contractAddress) {
      throw new Error("Contract address not set");
    }

    // Convert kg to precise format (multiply by 1000)
    const weightPrecise = Math.round(weightKg * 1000);

    const transaction = await this.aptos.transaction.build.simple({
      sender: account.address,
      data: {
        function: `${this.contractAddress}::${this.moduleName}::add_weight`,
        functionArguments: [weightPrecise]
      }
    });

    const response = await this.aptos.signAndSubmitTransaction({
      signer: account,
      transaction
    });

    await this.aptos.waitForTransaction({ transactionHash: response.hash });
    return response;
  }

  /**
   * Remove a weight entry by index
   */
  async removeWeight(account, index) {
    if (!this.contractAddress) {
      throw new Error("Contract address not set");
    }

    const transaction = await this.aptos.transaction.build.simple({
      sender: account.address,
      data: {
        function: `${this.contractAddress}::${this.moduleName}::remove_weight`,
        functionArguments: [index]
      }
    });

    const response = await this.aptos.signAndSubmitTransaction({
      signer: account,
      transaction
    });

    await this.aptos.waitForTransaction({ transactionHash: response.hash });
    return response;
  }

  /**
   * Remove the latest weight entry
   */
  async removeLatestWeight(account) {
    if (!this.contractAddress) {
      throw new Error("Contract address not set");
    }

    const transaction = await this.aptos.transaction.build.simple({
      sender: account.address,
      data: {
        function: `${this.contractAddress}::${this.moduleName}::remove_latest_weight`,
        functionArguments: []
      }
    });

    const response = await this.aptos.signAndSubmitTransaction({
      signer: account,
      transaction
    });

    await this.aptos.waitForTransaction({ transactionHash: response.hash });
    return response;
  }

  /**
   * Get all weight entries for a user (view function)
   */
  async getWeightEntries(userAddress) {
    if (!this.contractAddress) {
      throw new Error("Contract address not set");
    }

    try {
      const response = await this.aptos.view({
        payload: {
          function: `${this.contractAddress}::${this.moduleName}::get_weight_entries`,
          functionArguments: [userAddress]
        }
      });

      // Convert the response to a more usable format
      return response[0]?.map(entry => ({
        weight: parseFloat(entry.weight) / 1000, // Convert back to kg
        timestamp: parseInt(entry.timestamp) * 1000, // Convert to milliseconds
        date: new Date(parseInt(entry.timestamp) * 1000)
      })) || [];
    } catch (error) {
      console.log("No weight entries found or user not initialized:", error);
      return [];
    }
  }

  /**
   * Get the latest weight entry (view function)
   */
  async getLatestWeight(userAddress) {
    if (!this.contractAddress) {
      throw new Error("Contract address not set");
    }

    try {
      const response = await this.aptos.view({
        payload: {
          function: `${this.contractAddress}::${this.moduleName}::get_latest_weight`,
          functionArguments: [userAddress]
        }
      });

      const entry = response[0];
      return {
        weight: parseFloat(entry.weight) / 1000, // Convert back to kg
        timestamp: parseInt(entry.timestamp) * 1000, // Convert to milliseconds
        date: new Date(parseInt(entry.timestamp) * 1000)
      };
    } catch (error) {
      console.log("No latest weight found:", error);
      return null;
    }
  }

  /**
   * Get weight count (view function)
   */
  async getWeightCount(userAddress) {
    if (!this.contractAddress) {
      throw new Error("Contract address not set");
    }

    try {
      const response = await this.aptos.view({
        payload: {
          function: `${this.contractAddress}::${this.moduleName}::get_weight_count`,
          functionArguments: [userAddress]
        }
      });

      return parseInt(response[0]);
    } catch (error) {
      console.log("Error getting weight count:", error);
      return 0;
    }
  }

  /**
   * Check if user has initialized health data (view function)
   */
  async isInitialized(userAddress) {
    if (!this.contractAddress) {
      throw new Error("Contract address not set");
    }

    try {
      const response = await this.aptos.view({
        payload: {
          function: `${this.contractAddress}::${this.moduleName}::is_initialized`,
          functionArguments: [userAddress]
        }
      });

      return response[0];
    } catch (error) {
      console.log("Error checking initialization:", error);
      return false;
    }
  }

  /**
   * Convert local weight entries to blockchain format
   */
  convertToBlockchainEntries(localEntries) {
    return localEntries.map(entry => ({
      weight: entry.weight,
      timestamp: Math.floor(new Date(entry.date).getTime() / 1000),
      date: new Date(entry.date)
    }));
  }

  /**
   * Migration helper: Sync local data to blockchain
   */
  async migrateLocalDataToBlockchain(account, localEntries) {
    if (!this.contractAddress) {
      throw new Error("Contract address not set");
    }

    try {
      console.log("Starting migration of local data to blockchain...");
      
      // Check if already initialized
      const initialized = await this.isInitialized(account.address);
      
      if (!initialized) {
        console.log("Initializing health data...");
        await this.initializeHealthData(account);
      }

      // Add each entry (sorted by date)
      const sortedEntries = localEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      for (const entry of sortedEntries) {
        console.log(`Adding weight entry: ${entry.weight} kg`);
        await this.addWeight(account, entry.weight);
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log("Migration completed successfully!");
      return true;
    } catch (error) {
      console.error("Migration failed:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const aptosService = new AptosService();
export default aptosService; 