import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FLOWS = {
  start: {
    message: "Hi! I'm your CivicAssist helper 👋\nWhat do you need help with?",
    options: [
      { label: '🗺️ How do I report an issue?', next: 'report' },
      { label: '📋 How do I track my complaint?', next: 'track' },
      { label: '🔍 What can I report?', next: 'categories' },
      { label: "⚠️ My report isn't resolved", next: 'unresolved' },
      { label: '📱 How does the app work?', next: 'howItWorks' },
      { label: '📞 Need more help', next: 'moreHelp' },
    ],
  },
  report: {
    message: "To report an issue:\n\n1. Tap 'Report Issue' in the sidebar\n2. Choose a category (Road, Water, Electricity…)\n3. Describe the problem clearly\n4. Add a photo if you have one\n5. Hit Submit — authorities are notified instantly ✅",
    options: [{ label: '← Back to menu', next: 'start' }],
  },
  track: {
    message: "To track your complaints:\n\nGo to 'My Reports' in the sidebar. Each report shows its current status:\n\n• 🟡 Filed — received by authorities\n• 🔵 Under Review — being assessed\n• 🟢 Resolved — issue fixed!\n\nYou'll also get notifications on updates.",
    options: [{ label: '← Back to menu', next: 'start' }],
  },
  categories: {
    message: "You can report issues in these categories — tap one to learn more:",
    options: [
      { label: '🚧 Road & Footpath damage', next: 'cat_road' },
      { label: '💡 Electricity & Street lights', next: 'cat_elec' },
      { label: '💧 Water & Drainage problems', next: 'cat_water' },
      { label: '🗑️ Garbage & Waste', next: 'cat_garbage' },
      { label: '🌳 Parks & Public spaces', next: 'cat_parks' },
      { label: '← Back to menu', next: 'start' },
    ],
  },
  cat_road: {
    message: "🚧 Road & Footpath\n\nExamples: potholes, broken footpaths, road cave-ins, damaged dividers, missing manhole covers.\n\nSelect 'Road' as the category when filing your report.",
    options: [{ label: '← Back to categories', next: 'categories' }],
  },
  cat_elec: {
    message: "💡 Electricity & Street lights\n\nExamples: broken street lights, exposed wires, power outages in public areas, damaged electrical boxes.\n\nSelect 'Electricity' as the category when filing your report.",
    options: [{ label: '← Back to categories', next: 'categories' }],
  },
  cat_water: {
    message: "💧 Water & Drainage\n\nExamples: water supply issues, pipe bursts, overflowing drains, waterlogging on roads, sewage leaks.\n\nSelect 'Water' as the category when filing your report.",
    options: [{ label: '← Back to categories', next: 'categories' }],
  },
  cat_garbage: {
    message: "🗑️ Garbage & Waste\n\nExamples: overflowing dustbins, illegal dumping, uncleared garbage piles, waste in public spaces.\n\nSelect 'Waste' as the category when filing your report.",
    options: [{ label: '← Back to categories', next: 'categories' }],
  },
  cat_parks: {
    message: "🌳 Parks & Public spaces\n\nExamples: broken benches, damaged playground equipment, unkept parks, encroachment on public land.\n\nSelect 'Other' as the category when filing your report.",
    options: [{ label: '← Back to categories', next: 'categories' }],
  },
  unresolved: {
    message: "If your report hasn't been addressed, here's what you can do:\n\n1. Check 'My Reports' — status may have updated\n2. Community upvotes increase your report's priority\n3. Check the Helplines page for direct authority contacts\n4. Re-report with a new photo if the issue worsened",
    options: [
      { label: '📞 View Helplines', next: 'moreHelp' },
      { label: '← Back to menu', next: 'start' },
    ],
  },
  howItWorks: {
    message: "Here's how CivicAssist works:\n\n1️⃣ Sign in with your phone\n2️⃣ Report an issue with details & photo\n3️⃣ Authorities are notified automatically\n4️⃣ Track progress in real time\n5️⃣ Earn points for every valid report 🏆\n\nYour voice makes the city better!",
    options: [{ label: '← Back to menu', next: 'start' }],
  },
  moreHelp: {
    message: "For more help:\n\n• Visit the 'Helplines' section in the sidebar for direct authority contacts\n• Browse 'Community Feed' to see how others report issues\n• Earn points and climb the Leaderboard 🏅\n\nStill stuck? Reach out to your local civic body directly.",
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
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000,
          width: '52px', height: '52px', borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          boxShadow: '0 4px 20px rgba(59,130,246,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        aria-label="Open help chat"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.i key="close" className="fas fa-times" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }} style={{ color: '#fff', fontSize: '1rem' }} />
          ) : (
            <motion.i key="chat" className="fas fa-comment-dots" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }} style={{ color: '#fff', fontSize: '1.1rem' }} />
          )}
        </AnimatePresence>

        {/* Unread ping */}
        {!open && (
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ position: 'absolute', top: '2px', right: '2px', width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', border: '2px solid white' }}
          />
        )}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            style={{
              position: 'fixed', bottom: '88px', right: '24px', zIndex: 999,
              width: '320px', height: '460px',
              borderRadius: '16px', overflow: 'hidden',
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '14px 16px',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
              display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0,
            }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="fas fa-robot" style={{ color: '#fff', fontSize: '0.9rem' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', fontFamily: "'DM Sans', sans-serif" }}>CivicAssist Helper</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '1px' }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#4ade80' }} />
                  <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.65rem', fontFamily: "'DM Sans', sans-serif" }}>Always online</span>
                </div>
              </div>
              <button onClick={handleReset} title="Restart" style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '8px', padding: '5px 8px', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>
                <i className="fas fa-rotate-right" />
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ display: 'flex', justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start', gap: '7px', alignItems: 'flex-end' }}
                  >
                    {msg.type === 'bot' && (
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: '2px' }}>
                        <i className="fas fa-robot" style={{ color: '#fff', fontSize: '0.6rem' }} />
                      </div>
                    )}
                    <div style={{
                      maxWidth: '76%',
                      padding: '9px 12px',
                      borderRadius: msg.type === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      background: msg.type === 'user'
                        ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                        : 'hsl(var(--muted))',
                      color: msg.type === 'user' ? '#fff' : 'hsl(var(--foreground))',
                      fontSize: '0.78rem',
                      lineHeight: 1.55,
                      fontFamily: "'DM Sans', sans-serif",
                      whiteSpace: 'pre-line',
                    }}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Options */}
              <AnimatePresence>
                {showOptions && FLOWS[currentFlow] && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}
                  >
                    {FLOWS[currentFlow].options.map((opt, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        onClick={() => handleOption(opt)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '10px',
                          border: '1px solid hsl(var(--border))',
                          background: 'hsl(var(--background))',
                          color: 'hsl(var(--foreground))',
                          fontSize: '0.76rem',
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 500,
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'background 0.15s, border-color 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'hsl(var(--muted))'; e.currentTarget.style.borderColor = '#3b82f6'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'hsl(var(--background))'; e.currentTarget.style.borderColor = 'hsl(var(--border))'; }}
                      >
                        {opt.label}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
