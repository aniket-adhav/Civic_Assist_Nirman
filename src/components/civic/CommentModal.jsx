import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';

export default function CommentModal({ issue, onClose }) {
  const { addComment } = useApp();
  const { t } = useLanguage();
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = () => {
    if (!text.trim()) return;
    addComment(issue.id, text.trim());
    setText('');
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-card rounded-t-2xl md:rounded-2xl border border-border max-h-[80vh] flex flex-col animate-slideUp"
        onClick={e => e.stopPropagation()}
        style={{ boxShadow: 'var(--shadow-lg)' }}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-base font-bold text-foreground">{t('comments.title')} ({issue.comments.length})</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <i className="fas fa-xmark" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {issue.comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <i className="fas fa-comments text-3xl mb-3 opacity-50" />
              <p className="text-sm">{t('comments.noCommentsYet')}</p>
            </div>
          ) : (
            issue.comments.map(comment => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0"
                  style={{ background: 'var(--gradient-primary)' }}>
                  {comment.user[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{comment.user}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{comment.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-border flex gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder={t('comments.addComment')}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            autoFocus
          />
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="px-4 py-2.5 rounded-xl text-primary-foreground text-sm font-semibold disabled:opacity-40 transition-all"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <i className="fas fa-paper-plane" />
          </button>
        </div>
      </div>
    </div>
  );
}
