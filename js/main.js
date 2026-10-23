// GitVerse Starter Portfolio Scripts

const CONTACT_EMAIL = 'jaganraju24@gmail.com';

document.addEventListener('DOMContentLoaded', () => {
  const toast = document.getElementById('toast');
  let toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // 1. Copy email to clipboard
  const copyBtn = document.getElementById('copy-email-btn');

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const email = copyBtn.getAttribute('data-email') || CONTACT_EMAIL;
      try {
        await navigator.clipboard.writeText(email);
        showToast(`Copied ${email}`);
      } catch (err) {
        // Clipboard can be blocked by the browser, so show the address instead
        showToast(`Couldn't copy. My email is ${email}`);
      }
    });
  }

  // 2. Dark / light theme toggle, remembered between visits
  const themeToggle = document.getElementById('theme-toggle');
  const root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeToggle) themeToggle.textContent = theme === 'light' ? '☀️' : '🌙';
  }

  let savedTheme = 'dark';
  try {
    savedTheme = localStorage.getItem('gitverse-theme') || 'dark';
  } catch (err) {
    // Storage can be unavailable (private mode), so fall back to dark
  }
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
      try {
        localStorage.setItem('gitverse-theme', next);
      } catch (err) {
        // Not critical if the preference can't be saved
      }
      showToast(`${next === 'light' ? 'Light' : 'Dark'} theme on`);
    });
  }
});