import mongoose from 'mongoose'; 
import bcrypt from 'bcryptjs'; 
import dotenv from 'dotenv'; 
import Admin from './src/models/Admin.js'; 

dotenv.config(); 
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nmrl').then(async () => { 
  const passwordHash = await bcrypt.hash('StaffHydraLyx', 10); 
  await Admin.findOneAndUpdate({ username: 'HydraLyx' }, { username: 'HydraLyx', passwordHash, role: 'staff' }, { upsert: true }); 
  console.log('Staff seeded'); 
  process.exit(0); 
});
