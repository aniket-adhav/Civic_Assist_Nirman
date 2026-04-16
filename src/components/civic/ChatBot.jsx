import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FLOWS = {
  start: {
    message: "Hi! I'm your CivicAssist helper 👋\nWhat do you need help with today?",
    options: [
      { label: '🗺️ How do I report an issue?', next: 'report' },
      { label: '📋 How do I track my complaint?', next: 'track' },
      { label: '🔍 What types of issues can I report?', next: 'categories' },
      { label: "⚠️ My report isn't being resolved", next: 'unresolved' },
      { label: '🏆 How do points & leaderboard work?', next: 'points' },
      { label: '📱 How does CivicAssist work?', next: 'howItWorks' },
      { label: '👥 What is Community Feed?', next: 'feed' },
      { label: '📞 Emergency helplines', next: 'helplines' },
    ],
  },
  report: {
    message: "To report an issue:\n\n1️⃣ Click 'Report Issue' in the sidebar or tap the + button\n2️⃣ Choose a category (Road, Water, Electricity…)\n3️⃣ Write a clear description of the problem\n4️⃣ Add a photo — it speeds up resolution!\n5️⃣ Your location is auto-detected or you can pin it manually\n6️⃣ Hit Submit ✅\n\nAuthorities are notified instantly. You'll earn points for every valid report!",
    options: [
      { label: '📂 What categories can I choose?', next: 'categories' },
      { label: '← Back to menu', next: 'start' },
    ],
  },
  track: {
    message: "To track your complaints:\n\n📂 Go to 'My Reports' in the sidebar.\n\nEach report shows its status:\n\n🟡 Filed — received, awaiting review\n🔵 Under Review — authority is assessing\n🟠 In Progress — work has started\n🟢 Resolved — issue is fixed!\n\n🔔 You get a notification each time status changes.\n\nYou can also add comments or new photos to an existing report to provide updates.",
    options: [{ label: '← Back to menu', next: 'start' }],
  },
  categories: {
    message: "You can report issues in these categories:",
    options: [
      { label: '🚧 Road & Footpath', next: 'cat_road' },
      { label: '💡 Electricity & Street lights', next: 'cat_elec' },
      { label: '💧 Water & Drainage', next: 'cat_water' },
      { label: '🗑️ Garbage & Waste', next: 'cat_garbage' },
      { label: '🌳 Parks & Public spaces', next: 'cat_parks' },
      { label: '📢 Noise & Other', next: 'cat_other' },
      { label: '← Back to menu', next: 'start' },
    ],
  },
  cat_road: {
    message: "🚧 Road & Footpath\n\nReport: potholes, broken footpaths, road cave-ins, damaged dividers, missing manhole covers, waterlogged roads.\n\n📸 Tip: Include a photo clearly showing the damage — it greatly improves response time.\n\nSelect 'Road' when filling your report form.",
    options: [{ label: '← Back to categories', next: 'categories' }],
  },
  cat_elec: {
    message: "💡 Electricity & Street lights\n\nReport: broken/flickering street lights, exposed wires, power outages in public areas, damaged electric poles, short circuits in public spaces.\n\n📸 Tip: Photos taken at night for lighting issues are very helpful.\n\nSelect 'Electricity' when filling your report form.",
    options: [{ label: '← Back to categories', next: 'categories' }],
  },
  cat_water: {
    message: "💧 Water & Drainage\n\nReport: pipe bursts, water supply disruptions, overflowing drains, sewage leaks, waterlogging on roads, blocked storm drains.\n\n📸 Tip: Video evidence works well for water issues — upload a photo showing the extent.\n\nSelect 'Water' when filling your report form.",
    options: [{ label: '← Back to categories', next: 'categories' }],
  },
  cat_garbage: {
    message: "🗑️ Garbage & Waste\n\nReport: overflowing dustbins, illegal dumping spots, uncleared garbage piles, waste burning in public, dead animals on roads.\n\n📸 Tip: A wide-angle photo showing the scale of the problem gets faster action.\n\nSelect 'Waste' when filling your report form.",
    options: [{ label: '← Back to categories', next: 'categories' }],
  },
  cat_parks: {
    message: "🌳 Parks & Public Spaces\n\nReport: broken benches/equipment, unkept parks, encroachment on public land, damaged fountains, missing signage in public areas.\n\nSelect 'Other' when filling your report form.",
    options: [{ label: '← Back to categories', next: 'categories' }],
  },
  cat_other: {
    message: "📢 Noise & Other Issues\n\nReport: construction noise violations, public nuisance, stray animal menace, graffiti on public property, any civic issue not covered above.\n\nSelect 'Other' when filling your report form and describe clearly in the details.",
    options: [{ label: '← Back to categories', next: 'categories' }],
  },
  unresolved: {
    message: "If your report hasn't been addressed, here's what helps:\n\n1️⃣ Check 'My Reports' — status may have updated quietly\n2️⃣ Add a comment with new photos or updates to the issue\n3️⃣ Ask community members to upvote your report — higher upvotes = higher authority priority\n4️⃣ Re-submit if the problem has worsened\n5️⃣ Contact the authority directly via the Helplines section\n\n⏱️ Average resolution time is 48–72 hours for most issues.",
    options: [
      { label: '📞 View emergency helplines', next: 'helplines' },
      { label: '← Back to menu', next: 'start' },
    ],
  },
  points: {
    message: "🏆 Points & Leaderboard\n\nYou earn points by:\n\n✅ Submitting a valid report — +10 pts\n📸 Adding a photo to your report — +5 pts\n👍 Getting upvotes from community — +2 pts each\n🟢 Your report gets resolved — +15 pts\n\nPoints appear on the Leaderboard — see how you rank among citizens in your city!\n\n🥇 Top reporters get featured and earn community recognition.",
    options: [{ label: '← Back to menu', next: 'start' }],
  },
  howItWorks: {
    message: "Here's how CivicAssist works end-to-end:\n\n1️⃣ Sign in with your phone number\n2️⃣ Report an issue with details & photo\n3️⃣ Our AI checks the report for authenticity\n4️⃣ Relevant local authority is notified instantly\n5️⃣ You track status in real time\n6️⃣ Issue gets resolved & you earn points 🏆\n\nYour reports are private — only authorities and you see your personal details.",
    options: [
      { label: '🏆 Tell me about points', next: 'points' },
      { label: '← Back to menu', next: 'start' },
    ],
  },
  feed: {
    message: "👥 Community Feed\n\nThe feed shows all civic issues reported by citizens in your area.\n\n👍 You can upvote issues that affect you too — this raises priority\n💬 Leave comments with updates or additional info\n🔍 Filter by category, status, or location\n📍 View issues pinned on a live map\n\nThe more people engage with an issue, the faster it gets resolved!",
    options: [{ label: '← Back to menu', next: 'start' }],
  },
  helplines: {
    message: "📞 Emergency & Civic Helplines\n\nFor urgent issues, use the Helplines section in the sidebar to find direct contact numbers for:\n\n🚨 Police — 100\n🔥 Fire Brigade — 101\n🚑 Ambulance — 108\n💧 Water Board — local number\n💡 Electricity Board — local number\n\nFor non-emergencies, always file a report through CivicAssist so it's tracked officially.",
    options: [{ label: '← Back to menu', next: 'start' }],
  },
};

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentFlow, setCurrentFlow] = useState('start');
  const [showOptions, setShowOptions] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setTimeout(() => {
        setMessages([{ type: 'bot', text: FLOWS.start.message }]);
        setTimeout(() => setShowOptions(true), 400);
      }, 300);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showOptions]);

  const handleOption = (option) => {
    setShowOptions(false);
    setMessages(prev => [...prev, { type: 'user', text: option.label }]);
    const next = FLOWS[option.next];
    setTimeout(() => {
      setMessages(prev => [...prev, { type: 'bot', text: next.message }]);
      setCurrentFlow(option.next);
      setTimeout(() => setShowOptions(true), 400);
    }, 500);
  };

  const handleReset = () => {
    setMessages([]);
    setCurrentFlow('start');
    setShowOptions(false);
    setTimeout(() => {
      setMessages([{ type: 'bot', text: FLOWS.start.message }]);
      setTimeout(() => setShowOptions(true), 400);
    }, 200);
  };

  return (
    <>
      {/* Floating button — teal, sits at bottom */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        style={{
          position: 'fixed', bottom: '88px', right: '24px', zIndex: 1000,
          width: '52px', height: '52px', borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          boxShadow: '0 4px 20px rgba(99,102,241,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        aria-label="Open help chat"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.i key="close" className="fas fa-times"
              initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }} style={{ color: '#fff', fontSize: '1rem' }} />
          ) : (
            <motion.i key="chat" className="fas fa-comment-dots"
              initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }} style={{ color: '#fff', fontSize: '1.1rem' }} />
          )}
        </AnimatePresence>
        {!open && (
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ position: 'absolute', top: '2px', right: '2px', width: '10px', height: '10px', borderRadius: '50%', background: '#fbbf24', border: '2px solid white' }}
          />
        )}
      </motion.button>

      {/* Chat window — opens above both buttons */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            style={{
              position: 'fixed', bottom: '154px', right: '24px', zIndex: 999,
              width: '330px', maxHeight: '480px',
              borderRadius: '18px', overflow: 'hidden',
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '13px 16px',
              background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
              display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0,
            }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="fas fa-robot" style={{ color: '#fff', fontSize: '0.95rem' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', fontFamily: "'DM Sans', sans-serif" }}>CivicAssist Helper</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '1px' }}>
                  <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }}
                    style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#4ade80' }} />
                  <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.62rem', fontFamily: "'DM Sans', sans-serif" }}>Always here to help</span>
                </div>
              </div>
              <button onClick={handleReset} title="Restart conversation"
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', padding: '5px 9px', cursor: 'pointer', color: 'rgba(255,255,255,0.85)', fontSize: '0.7rem' }}>
                <i className="fas fa-rotate-right" />
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}
                    style={{ display: 'flex', justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start', gap: '7px', alignItems: 'flex-end' }}
                  >
                    {msg.type === 'bot' && (
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: '2px' }}>
                        <i className="fas fa-robot" style={{ color: '#fff', fontSize: '0.62rem' }} />
                      </div>
                    )}
                    <div style={{
                      maxWidth: '80%',
                      padding: '9px 13px',
                      borderRadius: msg.type === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: msg.type === 'user'
                        ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                        : 'hsl(var(--muted))',
                      color: msg.type === 'user' ? '#fff' : 'hsl(var(--foreground))',
                      fontSize: '0.77rem',
                      lineHeight: 1.6,
                      fontFamily: "'DM Sans', sans-serif",
                      whiteSpace: 'pre-line',
                    }}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Option buttons */}
              <AnimatePresence>
                {showOptions && FLOWS[currentFlow] && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '2px' }}
                  >
                    {FLOWS[currentFlow].options.map((opt, i) => (
                      <motion.button key={i}
                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.055 }}
                        onClick={() => handleOption(opt)}
                        style={{
                          padding: '8px 12px', borderRadius: '10px',
                          border: '1px solid hsl(var(--border))',
                          background: 'hsl(var(--background))',
                          color: 'hsl(var(--foreground))',
                          fontSize: '0.74rem',
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 500,
                          textAlign: 'left', cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'hsl(var(--background))'; e.currentTarget.style.borderColor = 'hsl(var(--border))'; e.currentTarget.style.color = 'hsl(var(--foreground))'; }}
                      >
                        {opt.label}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>

            {/* Footer hint */}
            <div style={{ padding: '8px 14px', borderTop: '1px solid hsl(var(--border))', background: 'hsl(var(--muted))', flexShrink: 0 }}>
              <p style={{ fontSize: '0.6rem', color: 'hsl(var(--muted-foreground))', fontFamily: "'DM Sans', sans-serif", textAlign: 'center', margin: 0 }}>
                Select an option above · Tap ↺ to restart
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
