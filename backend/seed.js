import Issue from './models/Issue.js';
import Officer from './models/Officer.js';
import { runAIAnalysis } from './services/aiRunner.js';

const SEED_ISSUES = [
  {
    complaintId: '#C001',
    title: 'Overflowing garbage bins near City Mall',
    description: 'The garbage bins near City Mall have been overflowing for the past 3 days. Strong odor is affecting nearby shops and pedestrians.',
    category: 'garbage',
    location: 'Linking Road, Bandra West, Mumbai',
    coordinates: { lat: 19.0607, lng: 72.8362 },
    imageUrl: 'https://images.pexels.com/photos/2768961/pexels-photo-2768961.jpeg?auto=compress&cs=tinysrgb&w=1200',
    reporter: { userId: 'seed_u1', name: 'Rahul Mehra', phone: '+91 98765 43210' },
    status: 'pending',
    supporters: ['seed_u2', 'seed_u3', 'seed_u4', 'seed_u5'],
    shares: 23,
    comments: [
      { userId: 'seed_u2', userName: 'Priya S.', text: 'This has been an issue for weeks!', createdAt: new Date('2026-04-11T11:00:00') },
      { userId: 'seed_u3', userName: 'Arun K.', text: 'I reported this to the municipal corporation but no action yet.', createdAt: new Date('2026-04-11T12:30:00') },
      { userId: 'seed_u4', userName: 'Sneha R.', text: 'The smell is unbearable.', createdAt: new Date('2026-04-11T14:00:00') },
    ],
    timeline: [
      { time: '10:23 AM, Apr 11', event: 'Complaint submitted by citizen', icon: 'fa-circle-plus', color: '#2563eb' },
    ],
    createdAt: new Date('2026-04-11T10:23:00'),
  },
  {
    complaintId: '#C002',
    title: 'Multiple streetlights not working on 5th Cross',
    description: 'At least 6 consecutive streetlights on 5th Cross Road have stopped working. The area is completely dark at night causing safety concerns.',
    category: 'streetlight',
    location: 'SV Road, Andheri West, Mumbai',
    coordinates: { lat: 19.1364, lng: 72.8296 },
    imageUrl: 'https://images.pexels.com/photos/306867/pexels-photo-306867.jpeg?auto=compress&cs=tinysrgb&w=1200',
    reporter: { userId: 'seed_u2', name: 'Divya Patel', phone: '+91 87654 32109' },
    status: 'inprogress',
    supporters: ['seed_u1', 'seed_u3', 'seed_u5', 'seed_u6', 'seed_u7'],
    shares: 15,
    comments: [
      { userId: 'seed_u5', userName: 'Vikram T.', text: 'I nearly had an accident here last night.', createdAt: new Date('2026-04-10T09:00:00') },
      { userId: 'seed_u6', userName: 'Meera N.', text: 'Women feel very unsafe walking here after dark.', createdAt: new Date('2026-04-10T10:30:00') },
    ],
    assignedTo: 'Streetlight & Electrical Dept',
    timeline: [
      { time: '7:45 AM, Apr 10', event: 'Complaint submitted', icon: 'fa-circle-plus', color: '#2563eb' },
      { time: '9:00 AM, Apr 10', event: 'Assigned to Streetlight & Electrical Dept', icon: 'fa-building', color: '#7c3aed' },
      { time: '10:30 AM, Apr 10', event: 'Status changed to In Progress', icon: 'fa-arrows-rotate', color: '#f59e0b' },
    ],
    createdAt: new Date('2026-04-10T07:45:00'),
  },
  {
    complaintId: '#C003',
    title: 'Water supply disrupted for 4 days in Sector 12',
    description: 'Residents of Sector 12 have not received piped water supply for 4 consecutive days. Children and elderly are the most affected.',
    category: 'water',
    location: 'Sector 12, Vashi, Navi Mumbai',
    coordinates: { lat: 19.0696, lng: 72.9987 },
    imageUrl: 'https://images.pexels.com/photos/159305/pexels-photo-159305.jpeg?auto=compress&cs=tinysrgb&w=1200',
    reporter: { userId: 'seed_u3', name: 'Suresh Gupta', phone: '+91 76543 21098' },
    status: 'pending',
    supporters: ['seed_u1', 'seed_u2', 'seed_u4', 'seed_u5', 'seed_u6', 'seed_u7', 'seed_u8'],
    shares: 67,
    comments: [
      { userId: 'seed_u4', userName: 'Kavitha B.', text: 'We have small children at home. This is a serious health concern.', createdAt: new Date('2026-04-12T08:00:00') },
      { userId: 'seed_u5', userName: 'Rajan L.', text: 'Elderly residents are having extreme difficulty.', createdAt: new Date('2026-04-12T09:30:00') },
    ],
    timeline: [
      { time: '7:00 AM, Apr 12', event: 'Complaint submitted by citizen', icon: 'fa-circle-plus', color: '#2563eb' },
    ],
    createdAt: new Date('2026-04-12T07:00:00'),
  },
  {
    complaintId: '#C004',
    title: 'Large pothole causing accidents on Highway Road',
    description: 'A massive pothole on the main Highway road near the bus stop has caused at least 3 accidents this week. Immediate repair is needed.',
    category: 'road',
    location: 'Western Express Highway, Goregaon East, Mumbai',
    coordinates: { lat: 19.1666, lng: 72.8506 },
    imageUrl: 'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=1200',
    reporter: { userId: 'seed_u4', name: 'Amit Joshi', phone: '+91 65432 10987' },
    status: 'resolved',
    supporters: ['seed_u1', 'seed_u2', 'seed_u3', 'seed_u5', 'seed_u6'],
    shares: 44,
    comments: [
      { userId: 'seed_u6', userName: 'Sanjay H.', text: 'My bike tyre burst here yesterday.', createdAt: new Date('2026-04-09T07:00:00') },
    ],
    assignedTo: 'Roads & Infrastructure Dept',
    timeline: [
      { time: '6:30 AM, Apr 9', event: 'Complaint submitted', icon: 'fa-circle-plus', color: '#2563eb' },
      { time: '8:00 AM, Apr 9', event: 'Assigned to Roads & Infrastructure Dept', icon: 'fa-building', color: '#7c3aed' },
      { time: '10:00 AM, Apr 9', event: 'Repair team dispatched', icon: 'fa-arrows-rotate', color: '#f59e0b' },
      { time: '4:00 PM, Apr 9', event: 'Pothole repaired and resolved', icon: 'fa-circle-check', color: '#059669' },
    ],
    createdAt: new Date('2026-04-09T06:30:00'),
  },
  {
    complaintId: '#C005',
    title: 'Broken swings and slides in Central Park',
    description: "The children's play area in Central Park has multiple broken swings and damaged slides. Children are at risk of injury.",
    category: 'park',
    location: 'Shivaji Park, Dadar West, Mumbai',
    coordinates: { lat: 19.0270, lng: 72.8381 },
    imageUrl: 'https://images.pexels.com/photos/1089842/pexels-photo-1089842.jpeg?auto=compress&cs=tinysrgb&w=1200',
    reporter: { userId: 'seed_u5', name: 'Neha Tiwari', phone: '+91 54321 09876' },
    status: 'pending',
    supporters: ['seed_u1', 'seed_u3'],
    shares: 8,
    comments: [],
    timeline: [
      { time: '4:45 PM, Apr 11', event: 'Complaint submitted by citizen', icon: 'fa-circle-plus', color: '#2563eb' },
    ],
    createdAt: new Date('2026-04-11T16:45:00'),
  },
  {
    complaintId: '#C006',
    title: 'Sewage overflow flooding residential street',
    description: 'Raw sewage is overflowing onto the main residential street in Ward 7. Health hazard for all residents, children cannot go to school.',
    category: 'sewage',
    location: 'Chembur Camp, Chembur, Mumbai',
    coordinates: { lat: 19.0600, lng: 72.8970 },
    imageUrl: 'https://images.pexels.com/photos/2480807/pexels-photo-2480807.jpeg?auto=compress&cs=tinysrgb&w=1200',
    reporter: { userId: 'seed_u6', name: 'Kumar Raj', phone: '+91 43210 98765' },
    status: 'inprogress',
    supporters: ['seed_u1', 'seed_u2', 'seed_u3', 'seed_u4', 'seed_u5', 'seed_u7'],
    shares: 55,
    comments: [
      { userId: 'seed_u7', userName: 'Lakshmi P.', text: 'Children cannot go to school because of this.', createdAt: new Date('2026-04-10T10:00:00') },
    ],
    assignedTo: 'Water & Sewage Board',
    timeline: [
      { time: '9:00 AM, Apr 10', event: 'Complaint submitted', icon: 'fa-circle-plus', color: '#2563eb' },
      { time: '11:00 AM, Apr 10', event: 'Assigned to Water & Sewage Board', icon: 'fa-building', color: '#7c3aed' },
      { time: '2:00 PM, Apr 10', event: 'Status changed to In Progress', icon: 'fa-arrows-rotate', color: '#f59e0b' },
    ],
    createdAt: new Date('2026-04-10T09:00:00'),
  },
  {
    complaintId: '#C007',
    title: 'Frequent power outages in residential colony',
    description: 'The colony has been experiencing 4-5 hour power cuts daily for the past week. No prior notice is given to residents.',
    category: 'electricity',
    location: 'Powai, Mumbai',
    coordinates: { lat: 19.1187, lng: 72.9053 },
    imageUrl: 'https://images.pexels.com/photos/236089/pexels-photo-236089.jpeg?auto=compress&cs=tinysrgb&w=1200',
    reporter: { userId: 'seed_u7', name: 'Venkat Rao', phone: '+91 32109 87654' },
    status: 'pending',
    supporters: ['seed_u1', 'seed_u2', 'seed_u4', 'seed_u6'],
    shares: 19,
    comments: [
      { userId: 'seed_u8', userName: 'Anita S.', text: 'This is affecting work from home employees badly.', createdAt: new Date('2026-04-13T10:00:00') },
    ],
    timeline: [
      { time: '8:30 AM, Apr 13', event: 'Complaint submitted by citizen', icon: 'fa-circle-plus', color: '#2563eb' },
    ],
    createdAt: new Date('2026-04-13T08:30:00'),
  },
  {
    complaintId: '#C008',
    title: 'Loud late-night construction noise disturbing residents',
    description: 'Construction work with heavy machinery running past midnight for 2 weeks straight, violating noise pollution norms. Hundreds of residents are affected.',
    category: 'noise',
    location: 'Juhu Tara Road, Juhu, Mumbai',
    coordinates: { lat: 19.1075, lng: 72.8263 },
    imageUrl: 'https://images.pexels.com/photos/210182/pexels-photo-210182.jpeg?auto=compress&cs=tinysrgb&w=1200',
    reporter: { userId: 'seed_u8', name: 'Vijay Kumar', phone: '+91 21098 76543' },
    status: 'resolved',
    supporters: ['seed_u1', 'seed_u3', 'seed_u5', 'seed_u6', 'seed_u7'],
    shares: 31,
    comments: [
      { userId: 'seed_u3', userName: 'Preethi M.', text: 'Finally some action! Thank you.', createdAt: new Date('2026-04-08T09:00:00') },
    ],
    assignedTo: 'Public Safety & Noise Control',
    timeline: [
      { time: '6:30 AM, Apr 7', event: 'Complaint submitted', icon: 'fa-circle-plus', color: '#2563eb' },
      { time: '8:00 AM, Apr 7', event: 'Assigned to Public Safety & Noise Control', icon: 'fa-building', color: '#7c3aed' },
      { time: '9:00 AM, Apr 7', event: 'Inspection team deployed', icon: 'fa-arrows-rotate', color: '#f59e0b' },
      { time: '11:00 AM, Apr 7', event: 'Notice issued to contractor, work stopped', icon: 'fa-circle-check', color: '#059669' },
    ],
    createdAt: new Date('2026-04-07T06:30:00'),
  },
];

const SEED_OFFICERS = [
  { name: 'Rajan Mehta',   phone: '9876543210', role: 'Senior Officer', zone: 'North Zone',         initials: 'RM', color: '#2563eb', cases: 32, resolved: 28 },
  { name: 'Priya Sharma',  phone: '9876543211', role: 'Field Officer',  zone: 'South Zone',         initials: 'PS', color: '#7c3aed', cases: 25, resolved: 21 },
  { name: 'Arjun Das',     phone: '9876543212', role: 'Junior Officer', zone: 'East Zone',          initials: 'AD', color: '#059669', cases: 18, resolved: 14 },
  { name: 'Meena Kapoor',  phone: '9876543213', role: 'Field Officer',  zone: 'West Zone',          initials: 'MK', color: '#d97706', cases: 22, resolved: 19 },
  { name: 'Suresh Patil',  phone: '9876543214', role: 'Zonal Head',     zone: 'Central Zone',       initials: 'SP', color: '#0891b2', cases: 40, resolved: 36 },
  { name: 'Nisha Rao',     phone: '9876543215', role: 'Field Officer',  zone: 'Pimpri-Chinchwad',   initials: 'NR', color: '#ef4444', cases: 20, resolved: 17 },
];

export async function seedDB() {
  // Keep dev DB city-consistent and AI-enriched: upsert seed issues by complaintId.
  for (const seed of SEED_ISSUES) {
    const existing = await Issue.findOne({ complaintId: seed.complaintId }, { aiAnalysis: 1, assignedTo: 1 });
    let aiAnalysis = existing?.aiAnalysis || null;
    if (!aiAnalysis || aiAnalysis.finalScore === null || aiAnalysis.finalScore === undefined) {
      aiAnalysis = await runAIAnalysis({
        description: seed.description,
        category: seed.category,
        imageUrl: seed.imageUrl,
      });
    }

    const timeline = [...(seed.timeline || [])];
    const spamEventExists = timeline.some((t) => String(t.event || '').includes('AI moderation flagged'));
    if (aiAnalysis?.isSpam && !spamEventExists) {
      timeline.push({
        time: new Date().toLocaleString('en-IN', {
          hour: '2-digit', minute: '2-digit', hour12: true,
          day: '2-digit', month: 'short',
        }),
        event: 'AI moderation flagged this complaint as SPAM',
        icon: 'fa-triangle-exclamation',
        color: '#ef4444',
      });
    }

    const payload = {
      ...seed,
      timeline,
      aiAnalysis,
      assignedTo: aiAnalysis?.isSpam ? 'Spam Queue' : seed.assignedTo || null,
    };

    await Issue.findOneAndUpdate(
      { complaintId: seed.complaintId },
      payload,
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
  }
  const count = await Issue.countDocuments();
  console.log(`Seed ensured for ${SEED_ISSUES.length} issues (total now ${count})`);

  const officerCount = await Officer.countDocuments();
  if (officerCount > 0) {
    console.log(`DB already has ${officerCount} officers — skipping officer seed`);
  } else {
    await Officer.insertMany(SEED_OFFICERS);
    console.log(`Seeded ${SEED_OFFICERS.length} officers`);
  }
}
