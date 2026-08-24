document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('screening-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type=submit]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Skickar…';

    let payload;
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)),
      });
      if (!res.ok) throw new Error('Kunde inte skicka in screeningen.');
      payload = await res.json();
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Skicka in';
      Swal.fire({
        title: 'Något gick fel',
        text: err.message,
        icon: 'error',
      });
      return;
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'Skicka in';

    const now = new Date(payload.created_at || Date.now()).toLocaleString('sv-SE', {
      dateStyle: 'short',
      timeStyle: 'short',
    });

    let footer = '';
    const mail = form.email_copy.value.trim();
    if (mail) {
      footer = `<p style="margin-top:1rem;font-size:.9rem;color:#555">Resultatet skickades till <strong>${mail}</strong>.</p>`;
    }

    const iconByClass = { green: 'success', yellow: 'warning', red: 'error' };

    Swal.fire({
      title: payload.title,
      html: `
        <p style="margin:0;color:#666">${now}</p>
        <p style="margin:.5rem 0;color:${payload.color};">${payload.desc}</p>
        <p style="margin:0;color:#444;">${payload.explanation}</p>
      `,
      icon: iconByClass[payload.cls] || 'info',
      confirmButtonText: 'Visa min dashboard',
      showCancelButton: true,
      cancelButtonText: 'Stanna kvar',
      confirmButtonColor: payload.color,
      footer,
      background: '#fff',
      width: 420,
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = '/dashboard';
      }
    });
  });
});
