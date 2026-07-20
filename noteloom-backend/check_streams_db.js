const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ Connection failed:', err);
    process.exit(1);
  }
};

const deptSchema = new mongoose.Schema({
  name: String,
  streams: [{
    name: String,
    code: String,
    isConfigured: { type: Boolean, default: false }
  }]
});
const Department = mongoose.models.Department || mongoose.model('Department', deptSchema);

async function run() {
  await connectDB();
  
  try {
    const depts = await Department.find({});
    console.log('\n--- DEPARTMENTS & STREAMS IN DB ---');
    depts.forEach(d => {
      console.log(`Department: [${d._id}] ${d.name}`);
      if (!d.streams || d.streams.length === 0) {
        console.log('   (No streams defined)');
      } else {
        d.streams.forEach(s => {
          console.log(`   -> Stream: Name: ${s.name} | Code: ${s.code} | isConfigured: ${s.isConfigured}`);
        });
      }
    });

    console.log('\nDone.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
