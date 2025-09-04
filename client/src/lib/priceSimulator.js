// Price simulation service for testing alerts
class PriceSimulator {
  constructor() {
    this.simulationInterval = null;
    this.isRunning = false;
    this.originalPrices = new Map();
  }

  // Start simulating price changes
  startSimulation(properties, onPriceChange) {
    if (this.isRunning) return;

    this.isRunning = true;
    
    // Store original prices
    properties.forEach(property => {
      if (!this.originalPrices.has(property.id)) {
        this.originalPrices.set(property.id, property.price);
      }
    });

    console.log('🎭 Starting price simulation for demo purposes...');

    this.simulationInterval = setInterval(() => {
      // Randomly select a property to change price
      const randomIndex = Math.floor(Math.random() * properties.length);
      const property = properties[randomIndex];
      
      if (!property) return;

      const originalPrice = this.originalPrices.get(property.id) || property.price;
      
      // Create random price changes (mostly decreases for testing alerts)
      const changeTypes = [
        { type: 'decrease', probability: 0.6, range: [0.05, 0.25] }, // 5-25% decrease
        { type: 'increase', probability: 0.25, range: [0.05, 0.15] }, // 5-15% increase
        { type: 'stay', probability: 0.15 } // No change
      ];

      const random = Math.random();
      let changeType = changeTypes.find(ct => random < ct.probability) || changeTypes[2];

      if (changeType.type === 'stay') return;

      let newPrice = originalPrice;
      
      if (changeType.type === 'decrease') {
        const decreasePercent = changeType.range[0] + Math.random() * (changeType.range[1] - changeType.range[0]);
        newPrice = Math.floor(originalPrice * (1 - decreasePercent));
      } else if (changeType.type === 'increase') {
        const increasePercent = changeType.range[0] + Math.random() * (changeType.range[1] - changeType.range[0]);
        newPrice = Math.floor(originalPrice * (1 + increasePercent));
      }

      // Only trigger if price actually changed significantly
      if (Math.abs(newPrice - property.price) > 1000) {
        console.log(`💰 Price simulation: ${property.title} - $${property.price} → $${newPrice}`);
        
        // Update the property price
        property.price = newPrice;
        
        // Notify about price change
        if (onPriceChange) {
          onPriceChange(property, originalPrice, newPrice);
        }
      }
    }, 15000); // Check every 15 seconds for demo
  }

  // Stop simulation
  stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    this.isRunning = false;
    console.log('🛑 Price simulation stopped');
  }

  // Manually trigger a price drop for testing
  triggerPriceDrop(property, targetPrice) {
    const originalPrice = property.price;
    property.price = targetPrice;
    
    console.log(`🚨 Manual price drop triggered: ${property.title} - $${originalPrice} → $${targetPrice}`);
    
    return {
      property,
      oldPrice: originalPrice,
      newPrice: targetPrice
    };
  }

  // Reset all prices to original
  resetPrices(properties) {
    properties.forEach(property => {
      const originalPrice = this.originalPrices.get(property.id);
      if (originalPrice) {
        property.price = originalPrice;
      }
    });
    
    console.log('🔄 All prices reset to original values');
  }

  // Get simulation status
  getStatus() {
    return {
      isRunning: this.isRunning,
      trackedProperties: this.originalPrices.size
    };
  }
}

// Create singleton instance
const priceSimulator = new PriceSimulator();

export default priceSimulator;