import { useEffect, useState } from 'react';

export default function Notification({ message, type }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 10);
    const t = setTimeout(() => setShow(false), 3000);
    return () => clearTimeout(t);
  }, []);

  const colors = {
    success: 'bg-green-500',
    error: 'bg-destructive',
    info: 'bg-primary',
  };

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-sm font-semibold text-primary-foreground shadow-lg transition-all duration-300 flex items-center gap-2 ${
        colors[type] || colors.info
      } ${show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
    >
      <i className={`fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-circle-exclamation' : 'fa-info-circle'}`} />
      {message}
    </div>
  );
}
