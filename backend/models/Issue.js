import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  userId: String,
  userName: { type: String, default: 'Anonymous' },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const timelineSchema = new mongoose.Schema({
  time: String,
  event: String,
  icon: { type: String, default: 'fa-circle-plus' },
  color: { type: String, default: '#2563eb' },
});

const issueSchema = new mongoose.Schema({
  complaintId: { type: String, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  coordinates: {
    lat: Number,
    lng: Number,
  },
  imageUrl: { type: String, default: '' },
  reporter: {
    userId: String,
    name: String,
    phone: String,
  },
  status: {
    type: String,
    enum: ['pending', 'inprogress', 'resolved'],
    default: 'pending',
  },
  supporters: [String],
  shares: { type: Number, default: 0 },
  comments: [commentSchema],
  assignedTo: { type: String, default: null },
  timeline: [timelineSchema],
  aiAnalysis: {
    textScore: { type: Number, default: null },
    imageScore: { type: Number, default: null },
    finalScore: { type: Number, default: null },
    authenticity: {
      type: String,
      enum: ['real', 'fake', 'unknown'],
      default: 'unknown',
    },
    isSpam: { type: Boolean, default: false },
  },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

issueSchema.pre('save', async function () {
  if (!this.complaintId) {
    const count = await mongoose.model('Issue').countDocuments();
    this.complaintId = `#C${String(count + 1).padStart(3, '0')}`;
  }
});

export default mongoose.model('Issue', issueSchema);
