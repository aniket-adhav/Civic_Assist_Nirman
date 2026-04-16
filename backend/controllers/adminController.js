import Issue from '../models/Issue.js';
import Officer from '../models/Officer.js';
import { runAIAnalysis } from '../services/aiRunner.js';

const MUMBAI_ZONES = [
  { name: 'Andheri', lat: 19.1364, lng: 72.8296 },
  { name: 'Bandra', lat: 19.0607, lng: 72.8362 },
  { name: 'Dadar', lat: 19.0270, lng: 72.8381 },
  { name: 'Goregaon', lat: 19.1666, lng: 72.8506 },
  { name: 'Powai', lat: 19.1187, lng: 72.9053 },
  { name: 'Chembur', lat: 19.0600, lng: 72.8970 },
  { name: 'Juhu', lat: 19.1075, lng: 72.8263 },
  { name: 'Kurla', lat: 19.0726, lng: 72.8845 },
  { name: 'Borivali', lat: 19.2290, lng: 72.8560 },
  { name: 'Vashi', lat: 19.0696, lng: 72.9987 },
];

const OFFICER_COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#0891b2', '#ef4444'];

function timeAgo(date) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function haversineKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function bestZoneForIssue(issue) {
  const lat = Number(issue?.coordinates?.lat);
  const lng = Number(issue?.coordinates?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  let best = null;
  for (const z of MUMBAI_ZONES) {
    const d = haversineKm({ lat, lng }, z);
    if (!best || d < best.distanceKm) best = { ...z, distanceKm: d };
  }
  if (!best || best.distanceKm > 25) return null;
  return best.name;
}

function getPriority(likes) {
  if (likes >= 50) return 'High';
  if (likes >= 20) return 'Medium';
  return 'Low';
}

function adminStatusLabel(status) {
  const map = { pending: 'Pending', inprogress: 'In Progress', resolved: 'Resolved' };
  return map[status] || 'Pending';
}

function formatAdminIssue(issue) {
  const likesCount = issue.supporters?.length || 0;
  const authenticity = issue.aiAnalysis?.authenticity || 'unknown';
  const aiBadge = authenticity === 'fake' ? 'Fake (Spam)' : authenticity === 'real' ? 'Real' : authenticity === 'scanning' ? 'Scanning...' : 'Unknown';
  return {
    id: issue.complaintId || `#${issue._id.toString().slice(-4).toUpperCase()}`,
    _id: issue._id.toString(),
    title: issue.title,
    category: issue.category,
    status: adminStatusLabel(issue.status),
    date: timeAgo(issue.createdAt),
    submittedAt: new Date(issue.createdAt).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    }),
    priority: getPriority(likesCount),
    reporter: issue.reporter?.name || 'Anonymous',
    phone: issue.reporter?.phone || 'N/A',
    location: issue.location,
    image: issue.imageUrl || '',
    description: issue.description,
    assignedTo: issue.assignedTo || null,
    timeline: issue.timeline || [],
    likes: likesCount,
    aiAnalysis: {
      textScore: issue.aiAnalysis?.textScore ?? null,
      imageScore: issue.aiAnalysis?.imageScore ?? null,
      finalScore: issue.aiAnalysis?.finalScore ?? null,
      authenticity,
      isSpam: !!issue.aiAnalysis?.isSpam,
      badge: aiBadge,
    },
  };
}

export async function getAdminIssues(req, res) {
  const issues = await Issue.find().sort({ createdAt: -1 });
  res.json(issues.map(formatAdminIssue));
}

export async function getAdminIssueById(req, res) {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    res.json(formatAdminIssue(issue));
  } catch (err) {
    console.error('GET /admin/issues/:id error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function getAdminStats(req, res) {
  const [total, pending, inprogress, resolved, fake, real] = await Promise.all([
    Issue.countDocuments(),
    Issue.countDocuments({ status: 'pending' }),
    Issue.countDocuments({ status: 'inprogress' }),
    Issue.countDocuments({ status: 'resolved' }),
    Issue.countDocuments({ 'aiAnalysis.authenticity': 'fake' }),
    Issue.countDocuments({ 'aiAnalysis.authenticity': 'real' }),
  ]);
  const unknown = Math.max(0, total - fake - real);
  res.json({ total, pending, inprogress, resolved, fake, real, unknown });
}

export async function updateIssueStatus(req, res) {
  const { status } = req.body;
  const validStatuses = { Pending: 'pending', 'In Progress': 'inprogress', Resolved: 'resolved' };
  const dbStatus = validStatuses[status];
  if (!dbStatus) return res.status(400).json({ error: 'Invalid status' });

  const now = new Date().toLocaleString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
    day: '2-digit', month: 'short',
  });

  const timelineEvent = {
    time: now,
    event: `Status changed to ${status}`,
    icon: status === 'Resolved' ? 'fa-circle-check' : status === 'In Progress' ? 'fa-arrows-rotate' : 'fa-clock',
    color: status === 'Resolved' ? '#059669' : status === 'In Progress' ? '#f59e0b' : '#64748b',
  };

  const existing = await Issue.findById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Issue not found' });
  if (existing.aiAnalysis?.isSpam) {
    return res.status(400).json({ error: 'Spam complaint status cannot be changed' });
  }
  const issue = await Issue.findByIdAndUpdate(
    req.params.id,
    { status: dbStatus, $push: { timeline: timelineEvent } },
    { new: true }
  );

  if (!issue) return res.status(404).json({ error: 'Issue not found' });
  res.json(formatAdminIssue(issue));
}

export async function assignIssue(req, res) {
  const { department } = req.body;
  if (!department) return res.status(400).json({ error: 'Department required' });

  const now = new Date().toLocaleString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
    day: '2-digit', month: 'short',
  });

  const existing = await Issue.findById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Issue not found' });
  if (existing.aiAnalysis?.isSpam) {
    return res.status(400).json({ error: 'Spam complaint cannot be assigned' });
  }

  const issue = await Issue.findByIdAndUpdate(
    req.params.id,
    {
      assignedTo: department,
      status: 'inprogress',
      $push: {
        timeline: {
          time: now,
          event: `Assigned to ${department}`,
          icon: 'fa-building',
          color: '#7c3aed',
        },
      },
    },
    { new: true }
  );

  if (!issue) return res.status(404).json({ error: 'Issue not found' });
  res.json(formatAdminIssue(issue));
}

export async function reanalyzeIssue(req, res) {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    issue.aiAnalysis = {
      textScore: issue.aiAnalysis?.textScore ?? null,
      imageScore: issue.aiAnalysis?.imageScore ?? null,
      finalScore: issue.aiAnalysis?.finalScore ?? null,
      authenticity: 'scanning',
      isSpam: false,
    };
    await issue.save();

    res.json(formatAdminIssue(issue));

    const issueId = issue._id;
    const { description, category, imageUrl } = issue;

    runAIAnalysis({ description, category, imageUrl: imageUrl || null })
      .then(async (aiAnalysis) => {
        const update = { aiAnalysis };
        if (aiAnalysis.isSpam) {
          const now = new Date().toLocaleString('en-IN', {
            hour: '2-digit', minute: '2-digit', hour12: true,
            day: '2-digit', month: 'short',
          });
          update.assignedTo = 'Spam Queue';
          update.$push = {
            timeline: {
              time: now,
              event: 'AI moderation flagged this complaint as SPAM',
              icon: 'fa-triangle-exclamation',
              color: '#ef4444',
            },
          };
        }
        await Issue.findByIdAndUpdate(issueId, update);
        console.log(`Reanalysis complete for ${issueId}: score=${aiAnalysis.finalScore}, spam=${aiAnalysis.isSpam}`);
      })
      .catch((err) => {
        console.error(`Background reanalysis failed for ${issueId}:`, err.message);
        Issue.findByIdAndUpdate(issueId, {
          'aiAnalysis.authenticity': 'unknown',
        }).catch(() => {});
      });

  } catch (err) {
    console.error('POST /admin/issues/:id/reanalyze error:', err.message);
    res.status(500).json({ error: 'Failed to re-analyze complaint' });
  }
}

export async function getOfficers(req, res) {
  const officers = await Officer.find().sort({ createdAt: 1 });
  res.json(officers);
}

export async function createOfficer(req, res) {
  const { name, phone, role, zone } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
  const count = await Officer.countDocuments();
  const initials = name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const color = OFFICER_COLORS[count % OFFICER_COLORS.length];
  const officer = await Officer.create({ name: name.trim(), phone: phone || '', role: role || 'Field Officer', zone: zone || 'North Zone', initials, color });
  res.status(201).json(officer);
}

export async function getAdminAnalysis(req, res) {
  const LEAN_PROJECTION = { category: 1, status: 1, coordinates: 1, createdAt: 1, updatedAt: 1, supporters: 1, assignedTo: 1, complaintId: 1, title: 1, location: 1 };

  const [total, pending, inprogress, resolved, categoryAgg, allIssues] = await Promise.all([
    Issue.countDocuments(),
    Issue.countDocuments({ status: 'pending' }),
    Issue.countDocuments({ status: 'inprogress' }),
    Issue.countDocuments({ status: 'resolved' }),
    Issue.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Issue.find({}, LEAN_PROJECTION).lean(),
  ]);

  const resolutionRatePct = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const resolvedIssues = allIssues.filter(i => i.status === 'resolved');
  let avgResolutionDays = 'N/A';
  if (resolvedIssues.length > 0) {
    const validDiffs = resolvedIssues
      .map(issue => new Date(issue.updatedAt).getTime() - new Date(issue.createdAt).getTime())
      .filter(ms => ms > 0);
    if (validDiffs.length > 0) {
      const avg = validDiffs.reduce((s, v) => s + v, 0) / validDiffs.length;
      avgResolutionDays = (avg / (1000 * 60 * 60 * 24)).toFixed(1);
    }
  }

  const peakCategory = categoryAgg[0]?._id || 'N/A';

  const zoneAgg = new Map(MUMBAI_ZONES.map(z => [z.name, { name: z.name, lat: z.lat, lng: z.lng, issues: 0, resolved: 0, top: 'N/A' }]));
  const zoneCatCounts = new Map(MUMBAI_ZONES.map(z => [z.name, new Map()]));

  for (const it of allIssues) {
    const zoneName = bestZoneForIssue(it);
    if (!zoneName) continue;
    const z = zoneAgg.get(zoneName);
    if (!z) continue;
    z.issues += 1;
    if (it.status === 'resolved') z.resolved += 1;
    const catMap = zoneCatCounts.get(zoneName);
    catMap.set(it.category, (catMap.get(it.category) || 0) + 1);
  }

  for (const [zoneName, catMap] of zoneCatCounts.entries()) {
    let best = null;
    for (const [cat, count] of catMap.entries()) {
      if (!best || count > best.count) best = { cat, count };
    }
    if (best) {
      const z = zoneAgg.get(zoneName);
      z.top = best.cat?.charAt(0).toUpperCase() + best.cat?.slice(1);
    }
  }

  const hotspots = [...zoneAgg.values()].sort((a, b) => b.issues - a.issues);

  const nowMs = Date.now();
  const ageDays = (d) => Math.max(0, (nowMs - new Date(d).getTime()) / (1000 * 60 * 60 * 24));
  const likesCount = (it) => it.supporters?.length || 0;
  const isOverdue = (it) => {
    const days = ageDays(it.createdAt);
    if (it.status === 'pending') return days >= 2;
    if (it.status === 'inprogress') return days >= 7;
    return false;
  };

  const quickWinCats = new Set(['streetlight', 'garbage', 'noise']);

  const actionable = allIssues
    .filter(it => it.status !== 'resolved')
    .map(it => {
      const days = ageDays(it.createdAt);
      const likes = likesCount(it);
      const unassigned = !it.assignedTo;
      const overdue = isOverdue(it);
      const quickWin = quickWinCats.has(it.category) && it.status === 'pending';

      let score = 0;
      if (unassigned) score += 50;
      if (overdue) score += 35;
      score += Math.min(likes, 150) * 0.4;
      score += Math.min(days, 14) * 1.2;
      if (quickWin) score += 12;

      const reasons = [];
      if (unassigned) reasons.push('Unassigned');
      if (overdue) reasons.push(`Overdue (${days.toFixed(1)}d)`);
      if (likes >= 20) reasons.push(`${likes} supporters`);
      if (quickWin) reasons.push('Fast win');

      return {
        _id: it._id.toString(),
        complaintId: it.complaintId || null,
        title: it.title,
        category: it.category,
        location: it.location,
        status: it.status,
        assignedTo: it.assignedTo || null,
        likes,
        ageDays: Number(days.toFixed(1)),
        score: Number(score.toFixed(1)),
        reason: reasons.join(' · ') || 'Review',
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  res.json({
    insightsVersion: 2,
    total, pending, inprogress, resolved,
    resolutionRatePct,
    avgResolutionDays,
    peakCategory,
    categoryBreakdown: categoryAgg.map(c => ({ category: c._id, count: c.count })),
    hotspots,
    actionQueue: actionable,
  });
}
