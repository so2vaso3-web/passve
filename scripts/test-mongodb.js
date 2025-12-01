// Test MongoDB connection
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI không tìm thấy trong .env.local');
  process.exit(1);
}

console.log('🔍 Đang kiểm tra kết nối MongoDB...');
console.log('📍 URI:', MONGODB_URI.replace(/:[^:@]+@/, ':****@')); // Ẩn password

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
})
.then(() => {
  console.log('✅ Kết nối MongoDB thành công!');
  console.log('📊 Database:', mongoose.connection.db.databaseName);
  console.log('🌐 Host:', mongoose.connection.host);
  
  // Test query
  return mongoose.connection.db.admin().ping();
})
.then(() => {
  console.log('✅ Ping thành công - MongoDB hoạt động bình thường!');
  process.exit(0);
})
.catch((error) => {
  console.error('❌ Lỗi kết nối MongoDB:');
  console.error(error.message);
  
  if (error.message?.includes('authentication failed') || error.message?.includes('bad auth')) {
    console.error('\n💡 Gợi ý: Kiểm tra lại username và password trong MongoDB Atlas');
  } else if (error.message?.includes('timeout')) {
    console.error('\n💡 Gợi ý: Kiểm tra IP whitelist trong MongoDB Atlas (thêm 0.0.0.0/0)');
  } else if (error.message?.includes('ENOTFOUND')) {
    console.error('\n💡 Gợi ý: Kiểm tra lại connection string trong .env.local');
  }
  
  process.exit(1);
});

