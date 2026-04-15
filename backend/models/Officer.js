import mongoose from 'mongoose';

const OfficerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, default: '' },
  role: { type: String, default: 'Field Officer' },
  zone: { type: String, default: 'North Zone' },
  initials: { type: String, default: '' },
  color: { type: String, default: '#2563eb' },
  cases: { type: Number, default: 0 },
  resolved: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Officer', OfficerSchema);
