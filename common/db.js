// common/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://bewchan061:GE3WoTQJHYOvW4hq@localhost:27017/laptop-pc-store', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Kết nối MongoDB thành công!');
  } catch (err) {
    console.error('Lỗi kết nối MongoDB:', err.message);
    process.exit(1);
  }
};

connectDB();
module.exports = mongoose.connection;
