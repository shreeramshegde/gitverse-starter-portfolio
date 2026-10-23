// GitVerse Starter Portfolio Scripts

document.addEventListener('DOMContentLoaded', () => {
  // 1. Copy Email to Clipboard with Toast Notification
  const copyBtn = document.getElementById('copy-email-btn');
  const toast = document.getElementById('toast');

  if (copyBtn && toast) {
    copyBtn.addEventListener('click', () => {
      const email = copyBtn.getAttribute('data-email') || '2025cs_sumankumari_g@nie.ac.in';
      navigator.clipboard.writeText(email).then(() => {
        showToast(`📋 Copied "${email}" to clipboard!`);
      }).catch(() => {
        showToast('❌ Failed to copy to clipboard');
      });
    });
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  // 2. Dark / Light Theme Toggle with LocalStorage Persistence
  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('gitverse-theme') || 'dark';

  if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    if (themeToggle) themeToggle.textContent = '☀️';
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (themeToggle) themeToggle.textContent = '🌙';
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';

      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('gitverse-theme', newTheme);
      themeToggle.textContent = newTheme === 'light' ? '☀️' : '🌙';
      showToast(`Switched to ${newTheme} theme`);
    });
  }
});
