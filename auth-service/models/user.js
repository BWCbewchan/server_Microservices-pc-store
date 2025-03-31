const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  fullName: { 
    type: String, 
    required: true,
    trim: true
  },
  phone: { 
    type: String,
    trim: true
  },
  role: { 
    type: String, 
    enum: ['user', 'admin', 'staff'], 
    default: 'user' 
  },
  addresses: [addressSchema],
  avatar: { type: String },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'banned'], 
    default: 'active' 
  },
  lastLogin: { type: Date },
  activityLog: [{
    action: String,
    timestamp: { type: Date, default: Date.now },
    details: Object
  }]
}, { 
  timestamps: true 
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
