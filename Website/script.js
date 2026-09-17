(() => {
  'use strict';
  document.documentElement.classList.add('js');
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  const closeMenu = (restoreFocus = false) => {
    if (!toggle || !nav) return;
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    if (restoreFocus) toggle.focus();
  };
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = !nav.classList.contains('open');
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav.classList.contains('open')) closeMenu(true);
    });
    document.addEventListener('click', event => {
      if (!nav.contains(event.target) && !toggle.contains(event.target)) closeMenu();
    });
    window.matchMedia('(min-width: 641px)').addEventListener('change', () => closeMenu());
  }
  const demoContent = {
    compare: ['Freigegebene Dokumentstände', 'Berichte, Genehmigungen und technische Unterlagen.', 'Änderungen & offene Punkte', 'Relevante Unterschiede als Hinweise für die Prüfung aufbereiten.', 'Prüfen. Einordnen. Freigeben.', 'Ihr Team bewertet die Hinweise und entscheidet über die nächsten Schritte.'],
    create: ['Freigegebene Informationen', 'Quellen, Anforderungen und die gewünschte Dokumentstruktur.', 'Entwurf & Prüfpunkte', 'Technische Inhalte vorbereiten und auf mögliche Lücken oder Widersprüche hinweisen.', 'Fachlich prüfen & fertigstellen', 'Ihr Team ergänzt die Bewertung und gibt das Dokument abschließend frei.']
  };
  const demoSwitch = document.querySelector('.demo-switch');
  if (demoSwitch) {
    demoSwitch.hidden = false;
    const selectors = ['[data-demo-input]', '[data-demo-input-text]', '[data-demo-process]', '[data-demo-process-text]', '[data-demo-output]', '[data-demo-output-text]'];
    demoSwitch.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
      demoSwitch.querySelectorAll('button').forEach(item => {
        item.classList.toggle('active', item === button);
        item.setAttribute('aria-pressed', String(item === button));
      });
      demoContent[button.dataset.demo].forEach((value, i) => { document.querySelector(selectors[i]).textContent = value; });
    }));
  }
  // Attribution is submitted with the enquiry; no cookies, storage or analytics requests.
  const form = document.querySelector('#contact-form');
  const attributionParams = new URLSearchParams(window.location.search);
  const safeTag = value => (value || '').replace(/[^a-zA-Z0-9_ .-]/g, '').slice(0, 80);
  document.querySelectorAll('a[href]').forEach(link => {
    const raw = link.getAttribute('href');
    if (!raw || raw.startsWith('#')) return;
    const url = new URL(raw, window.location.href);
    if (url.origin !== window.location.origin || !url.pathname.endsWith('.html')) return;
    for (const key of ['utm_source', 'utm_campaign']) {
      const value = safeTag(attributionParams.get(key));
      if (value) url.searchParams.set(key, value);
    }
    if (url.search) link.href = url.href;
  });
  if (form) {
    const params = new URLSearchParams(window.location.search);
    const cleanTag = value => (value || '').replace(/[^a-zA-Z0-9_ .-]/g, '').slice(0, 80);
    form.elements.source.value = cleanTag(params.get('utm_source')) || window.location.pathname.split('/').pop() || 'Startseite';
    form.elements.campaign.value = cleanTag(params.get('utm_campaign'));
    const status = form.querySelector('.form-status');
    const submit = form.querySelector('[type="submit"]');
    const label = submit.querySelector('span');
    let busy = false;
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (busy || !form.reportValidity()) return;
      busy = true; submit.disabled = true; form.setAttribute('aria-busy', 'true');
      label.textContent = 'Wird gesendet …'; status.hidden = true; status.classList.remove('error');
      form.elements.source.value = cleanTag(params.get('utm_source')) || window.location.pathname.split('/').pop() || 'Startseite';
      form.elements.campaign.value = cleanTag(params.get('utm_campaign'));
      const data = new FormData(form);
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 20000);
      try {
        const response = await fetch(window.location.pathname || '/', {
          method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(data).toString(), signal: controller.signal
        });
        if (!response.ok) throw new Error('Submission rejected');
        form.reset();
        form.elements.source.value = cleanTag(params.get('utm_source')) || window.location.pathname.split('/').pop() || 'Startseite';
        form.elements.campaign.value = cleanTag(params.get('utm_campaign'));
        status.textContent = 'Vielen Dank! Ihre Anfrage wurde übermittelt. Ich melde mich noch heute unter Ihrer E-Mail-Adresse – auch am Wochenende.';
        status.hidden = false; label.textContent = 'Anfrage gesendet';
        status.focus({ preventScroll: true }); status.scrollIntoView({ block: 'nearest', behavior: 'auto' });
        document.dispatchEvent(new CustomEvent('agentikm:enquiry-accepted', { detail: { page: window.location.pathname } }));
      } catch (error) {
        status.classList.add('error'); status.replaceChildren();
        status.append(document.createTextNode('Die Übermittlung konnte nicht bestätigt werden. Ihre Angaben bleiben erhalten. Versuchen Sie es erneut oder schreiben Sie direkt an '));
        const link = document.createElement('a'); link.href = 'mailto:kontakt@agentikm.de'; link.textContent = 'kontakt@agentikm.de';
        status.append(link, document.createTextNode('.')); status.hidden = false;
        status.focus({ preventScroll: true }); status.scrollIntoView({ block: 'nearest', behavior: 'auto' });
        label.textContent = 'Erneut senden';
      } finally {
        window.clearTimeout(timeout); busy = false; submit.disabled = false; form.removeAttribute('aria-busy');
      }
    });
  }
})();
