const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  // Fix username field configuration to avoid conflicting options
  username: {
    type: String,
    required: false,
    index: false  // Only keep index: false, remove sparse
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  avatar: {
    type: String,
    default: "https://res.cloudinary.com/da5yv576h/image/upload/v1613356035/avatar/default_avatar_pzjqmj.png"
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  phone: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create the model
const User = mongoose.model("User", userSchema);

// Update the index drop approach
(async () => {
  try {
    // This will execute after the connection is established
    mongoose.connection.on('connected', async () => {
      try {
        // Check if the collection exists before trying to drop the index
        const collections = await mongoose.connection.db.listCollections({ name: 'users' }).toArray();
        if (collections.length > 0) {
          console.log('Checking for username index to drop...');
          // Get existing indexes
          const indexes = await mongoose.connection.db.collection('users').indexes();
          const hasUsernameIndex = indexes.some(index => index.name === 'username_1');
          
          if (hasUsernameIndex) {
            await mongoose.connection.db.collection('users').dropIndex('username_1');
            console.log('✅ Dropped username index successfully');
          } else {
            console.log('No username index found to drop');
          }
        }
      } catch (error) {
        console.log('Note: Index operation attempted but not completed:', error.message);
      }
    });
  } catch (error) {
    console.log('Note: Index check setup failed:', error.message);
  }
})();

module.exports = User;
