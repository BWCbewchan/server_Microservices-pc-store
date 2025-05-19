const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });

// Get MongoDB connection string from env file
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://ngophuc2911:phuc29112003@cluster0.zz9vo.mongodb.net/authService?retryWrites=true&w=majority";

console.log('Testing MongoDB connection...');
console.log(`Attempting to connect to: ${MONGO_URI.split('@')[1]}`);

// Add a timeout to the MongoDB connection attempt
const connectWithTimeout = async () => {
  return Promise.race([
    mongoose.connect(MONGO_URI),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
    )
  ]);
};

connectWithTimeout()
  .then(() => {
    console.log('✅ MongoDB connection successful!');
    // Check if User model can be created
    try {
      console.log('Testing user schema...');
      const userSchema = new mongoose.Schema({
        name: String,
        email: String,
        password: String
      });
      const User = mongoose.model('User', userSchema);
      console.log('✅ User model created successfully');
    } catch (err) {
      console.error('❌ Error creating User model:', err);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err);
    console.log('Please check your MongoDB connection string and network connectivity.');
    process.exit(1);
  });
