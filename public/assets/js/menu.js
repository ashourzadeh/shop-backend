document.addEventListener('DOMContentLoaded', async () => {
  const container = document.createElement('div');
  document.body.prepend(container);

  try {
    const res = await fetch('partials/menu.html');
    const html = await res.text();
    container.innerHTML = html;

    // فعال کردن لینک فعلی
    const links = container.querySelectorAll('.nav-link');
    const current = location.pathname.split('/').pop();
    links.forEach(link => {
      if (link.getAttribute('href') === current) {
        link.classList.add('active');
      }
    });
  } catch (err) {
    console.error('خطا در بارگذاری منو:', err);
  }
});
