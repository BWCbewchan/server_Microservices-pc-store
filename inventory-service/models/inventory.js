// inventory-service/models/inventory.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const supplierSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  rating: { type: Number, min: 1, max: 5 }
});

const purchaseHistorySchema = new Schema({
  supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now },
  deliveryDate: { type: Date },
  status: { 
    type: String, 
    enum: ['pending', 'delivered', 'cancelled'],
    default: 'pending'
  }
});

const demandForecastSchema = new Schema({
  predictedDemand: { type: Number, required: true },
  confidence: { type: Number, min: 0, max: 100 },
  period: { type: Date, required: true },
  actualDemand: { type: Number },
  factors: [{
    name: { type: String },
    impact: { type: Number }
  }]
});

const inventorySchema = new Schema({
  productId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true, 
    unique: true 
  },
  quantity: { 
    type: Number, 
    required: true, 
    default: 0 
  },
  reserved: { 
    type: Number, 
    default: 0 
  },
  minStockLevel: { 
    type: Number, 
    required: true,
    default: 10
  },
  maxStockLevel: { 
    type: Number,
    required: true,
    default: 100
  },
  reorderPoint: { 
    type: Number,
    required: true,
    default: 20
  },
  suppliers: [supplierSchema],
  purchaseHistory: [purchaseHistorySchema],
  demandForecasts: [demandForecastSchema],
  lastStockCheck: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true 
});

// Middleware to check stock levels
inventorySchema.post('save', async function(doc) {
  if (doc.quantity <= doc.minStockLevel) {
    // Implement your notification logic here
    console.log(`Low stock alert for product ${doc.productId}: ${doc.quantity} items remaining`);
  }
});

// Method to calculate available stock
inventorySchema.methods.getAvailableStock = function() {
  return this.quantity - this.reserved;
};

// Method to check if reorder is needed
inventorySchema.methods.needsReorder = function() {
  return this.quantity <= this.reorderPoint;
};

// Method to calculate average demand
inventorySchema.methods.calculateAverageDemand = function(days = 30) {
  const forecasts = this.demandForecasts.filter(f => 
    f.period >= new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  );
  if (forecasts.length === 0) return 0;
  return forecasts.reduce((acc, f) => acc + (f.actualDemand || 0), 0) / forecasts.length;
};

module.exports = mongoose.model('inventories', inventorySchema);
