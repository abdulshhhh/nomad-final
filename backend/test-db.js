require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB successfully!');
    
    // Try to create a test document
    const TestSchema = new mongoose.Schema({
      name: String,
      date: { type: Date, default: Date.now }
    });
    
    const Test = mongoose.model('Test', TestSchema);
    
    const testDoc = new Test({ name: 'Test Document' });
    await testDoc.save();
    console.log('Test document created with ID:', testDoc._id);
    
    // Clean up
    await Test.deleteOne({ _id: testDoc._id });
    console.log('Test document deleted');
    
    // Close connection
    await mongoose.connection.close();
    console.log('Connection closed');
  } catch (err) {
    console.error('MongoDB test failed:', err);
  }
}

testConnection();