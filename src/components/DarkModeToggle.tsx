import { useEffect, useState } from 'react';

export default function DarkModeToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const pref = localStorage.getItem('theme') || 'system';
    const isDark = pref === 'dark' || (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
    setEnabled(isDark);
  }, []);

  function toggle() {
    const newVal = !enabled;
    setEnabled(newVal);
    localStorage.setItem('theme', newVal ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newVal);
  }

  return (
    <button aria-label="Toggle dark mode" className="btn btn-secondary" onClick={toggle}>
      {enabled ? 'Light' : 'Dark'}
    </button>
  );
}