/* KeurSuivi : comportement de la page (traduction FR/EN, 3D, tarifs, formulaire). Aucune dépendance hors Three.js. */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const clamp = (x, a, b) => Math.min(b === undefined ? 1 : b, Math.max(a === undefined ? 0 : a, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
  const easeOut = (t) => 1 - Math.pow(1 - clamp(t), 3);
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const smallScreen = window.matchMedia && window.matchMedia('(max-width: 820px)').matches;
  const lowPower = smallScreen || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

  /* Coordonnées du service : définies dans config.json, injectées à la fabrication (node build.mjs). */
  const CFG = { wa: '{{WA}}', waText: '{{WA_TEXT}}', email: '{{EMAIL}}' };

  /* ------------------------------------------------------------------ */
  /* Traductions (le français vit dans le HTML ; l'anglais est ici)      */
  /* ------------------------------------------------------------------ */
  const EN = {
    'skip': 'Skip to content',
    'nav.label': 'Main navigation', 'nav.service': 'The service', 'nav.how': 'How it works', 'nav.report': 'Sample report', 'nav.price': 'Pricing', 'nav.faq': 'FAQ', 'nav.lang': 'Language', 'nav.cta': 'Join the waitlist', 'nav.menu': 'Menu',
    'hero.eyebrow': 'Construction monitoring in Senegal',
    'hero.title': 'You build <br>in Senegal. <br>We check <br><em>on site.</em>',
    'hero.lead': 'An independent supervisor visits your site on fixed dates. You receive dated, geotagged photos, the progress observed and every expense backed up, straight on your phone.',
    'cta.wa': 'Message us on WhatsApp', 'cta.wa2': 'WhatsApp', 'cta.example': 'See a sample report',
    'hero.p1': 'Dated, geotagged photos, never retouched', 'hero.p2': 'No access to your site’s money', 'hero.p3': 'Report within 48 h of every visit',
    'hero.zones': 'At launch', 'hero.alt': '3D model of a villa under construction, with a site supervisor and a GPS marker',
    'hero.c1': 'Dated, geotagged photo', 'hero.c2': 'Report no. 4 sent', 'hero.c2b': 'Progress 58%', 'hero.c3': 'Expense documented', 'hero.c3b': 'Cement · invoice attached', 'hero.cap': 'Illustration · typical site',
    'prob.eyebrow': 'The problem', 'prob.title': 'You send the money. The site moves forward… or not.',
    'prob.lead': 'In Senegal, many owners build without being able to watch their site: they live abroad, in another city, or simply don’t have the time. They entrust the money and the work to a mason, a contractor or a relative, then lack reliable information.',
    'prob.1': 'Money sent, but a site that doesn’t move', 'prob.2': 'News that is rare, vague or impossible to check', 'prob.2b': 'An old photo, a quick phone call.', 'prob.3': 'Spending with no invoice or receipt', 'prob.4': 'Materials diverted or of lower quality than planned', 'prob.5': 'Abandoned sites, and family conflicts over money',
    'svc.eyebrow': 'KeurSuivi’s answer', 'svc.title': 'A local, independent supervisor at every visit.',
    'svc.lead': 'They visit your site at fixed intervals. At every visit, you receive dated, geotagged photos and videos, the progress observed, documented expenses and any warning signs.',
    'inc.1': 'An identified supervisor', 'inc.1b': 'They visit your site on the agreed dates.',
    'inc.2': 'Dated, geotagged photos and videos', 'inc.2b': 'Taken on site, never retouched.',
    'inc.3': 'A structured visit report', 'inc.3b': 'Progress, labour, materials, observations, expenses. The same format every visit, readable on a phone.',
    'inc.4': 'Expense tracking', 'inc.4b': 'Based on invoices and receipts, compared with your budget.',
    'inc.5': 'A fast alert when something is off', 'inc.5b': 'Site stopped, workers absent, different materials: you are told.',
    'inc.6': 'WhatsApp support', 'inc.6b': 'In French and in English.',
    'who.title': 'Who is it for?',
    'who.1': 'You live abroad', 'who.1b': 'You are building back home, thousands of kilometres away. See your site as if you were there and check the money you sent.',
    'who.2': 'You don’t have the time', 'who.2b': 'You live in Senegal, but you work or live elsewhere. A reliable outside eye, without travelling every week.',
    'who.3': 'You invest', 'who.3b': 'You build to rent or resell, sometimes several sites. Regular, documented follow-up and controlled spending.',
    'who.4': 'A relative watches for you', 'who.4b': 'A family member is on site for a parent abroad. Neutral evidence that avoids family tension.',
    'how.eyebrow': 'How it works', 'how.title': 'Your site moves forward. You see it, step by step.',
    'how.lead': 'Regular visits are the heart of the service. Everything else exists to make them possible and reliable.',
    'how.t1': 'Step 1 / 4', 'how.t2': 'Step 2 / 4', 'how.t3': 'Step 3 / 4', 'how.t4': 'Step 4 / 4',
    'how.s1': 'You write to us', 'how.s1b': 'Through the form, the waitlist or a WhatsApp message. We discuss the site address, the type of work, the company in place and your budget, then we suggest a plan.',
    'how.s1p1': 'Reply within 24 business hours', 'how.s1p2': 'Quote within 48 h',
    'how.s2': 'Site reconnaissance', 'how.s2b': 'Once the contract is signed and the payment received, the supervisor goes to the plot: GPS position, meeting the mason, photos of the initial state and a check of the documents.', 'how.s2p1': 'Within 7 days of payment',
    'how.s3': 'Regular visits', 'how.s3b': 'According to your plan, the supervisor comes back to the site. At every visit: dated, geotagged photos and videos, a structured report, documented expenses. A high-level alert goes out by message immediately, without waiting for the report.', 'how.s3p1': 'Report within 48 h', 'how.s3p2': 'Alert within 24 h',
    'how.s4': 'Closing the follow-up', 'how.s4b': 'At the end of the follow-up, you receive the complete file and the final statement.', 'how.s4p1': 'Within 7 days of the end',
    'how.alt': '3D model that builds itself as you move through the steps', 'how.hud': 'Site progress', 'how.note': 'Illustration: the progress of a typical site, from the initial state to the finishing work.',
    'rep.eyebrow': 'Sample report', 'rep.title': 'What you receive after every visit.',
    'rep.lead': 'A structured report, identical from one visit to the next, readable on a phone. You always know where the site stands and where the money went.',
    'rep.1': 'Progress', 'rep.1b': 'Where the site stands compared with the previous visit.',
    'rep.2': 'Labour', 'rep.2b': 'The workers present on the day of the visit.',
    'rep.3': 'Materials', 'rep.3b': 'What was delivered and used, compared with what was planned.',
    'rep.4': 'Observations', 'rep.4b': 'What the supervisor notes on site, strictly factual.',
    'rep.5': 'Expenses', 'rep.5b': 'Every invoice or receipt, compared with your budget.',
    'rep.ph.title': 'Visit report no. 4', 'rep.ph.site': 'R+1 villa · Rufisque', 'rep.ph.status': 'Site in progress', 'rep.ph.prog': 'Progress', 'rep.ph.delta': '+9 points since visit no. 3',
    'rep.ph.next': 'Next visit', 'rep.ph.labour': 'Labour', 'rep.ph.labourv': '7 workers present', 'rep.ph.mat': 'Materials', 'rep.ph.matv': 'Cement and rebar delivered',
    'rep.ph.sp1': 'Cement, 62 bags', 'rep.ph.sp2': 'Rebar, 40 bars', 'rep.ph.sp3': 'Labour, one week',
    'rep.ph.al': 'Materials differ from the quote', 'rep.ph.alb': 'Medium level · alert sent within 24 h', 'rep.ph.ex': 'Fictional sample',
    'rep.c1': 'GPS position verified', 'rep.c2': 'Alert sent', 'rep.c2b': 'within 24 h',
    'zones.eyebrow': 'Areas covered', 'zones.title': 'Six cities at launch.', 'zones.lead': 'KeurSuivi launches in these six cities. In each active area, a local supervisor knows the ground and the sites.',
    'zones.tag': 'Launch area', 'zones.note': 'Your site is elsewhere? Any site outside these areas is quoted with travel costs.',
    'zones.map': 'Schematic map of the six launch cities', 'zones.ocean': 'Atlantic Ocean', 'zones.schem': 'Schematic map',
    'price.eyebrow': 'Pricing', 'price.title': 'Three plans, from monthly to weekly.',
    'price.lead': 'The monthly plan has no commitment. The first visit, the site reconnaissance, is billed once when the follow-up opens.',
    'price.period': 'Billing period', 'price.month': 'Monthly', 'price.year': 'Yearly', 'price.free': '2 months free', 'price.cur': 'Currency',
    'price.v1': '1 visit per month', 'price.v2': '2 visits per month', 'price.v3': '1 visit per week',
    'price.e1': 'Geotagged photos', 'price.e2': 'Monthly report', 'price.s1': 'Photos and videos', 'price.s2': 'Expenses with invoices', 'price.s3': 'Alerts',
    'price.p1': 'Monthly video call', 'price.p2': 'Detailed expenses', 'price.p3': 'Priority support', 'price.choose': 'Choose this plan',
    'price.x1': 'Site reconnaissance', 'price.x1b': 'First visit, billed once when the follow-up opens: 50,000 FCFA.',
    'price.x2': 'No commitment', 'price.x2b': 'The monthly plan has no commitment.',
    'price.x3': 'Yearly plan', 'price.x3b': '12 months paid at once, 2 months free.',
    'price.x4': 'Outside our areas', 'price.x4b': 'Any site outside our areas is quoted with travel costs.',
    'pay.title': 'Payment methods', 'pay.sn': 'Senegal', 'pay.card': 'Visa, Mastercard card', 'pay.abroad': 'From abroad', 'pay.wire': 'Bank transfer', 'pay.wireb': 'Yearly, € or $',
    'pay.note': 'At launch, payment is manual: your plan’s button opens WhatsApp with a ready-made message. We tell you the payment method and the amount, then send you a receipt. Payment in advance, by the 5th of each month at the latest. Transfer fees are at your expense.',
    'trust.eyebrow': 'Trust', 'trust.title': 'Proof, not promises.',
    'trust.lead': 'KeurSuivi works neither for the mason nor for a supplier, and takes no commission on the work. Our only client is you.',
    'trust.1': 'Verified supervisors', 'trust.1b': 'References checked, a trial visit on a known site, training on the report template, then a probation period during which every report is reviewed.',
    'trust.2': 'Dated proof', 'trust.2b': 'Timestamped, geotagged photos taken on site, never retouched and impossible to reuse.',
    'trust.3': 'No access to the money', 'trust.3b': 'You pay your craftsmen yourself. KeurSuivi observes and reports.',
    'trust.code': 'Our supervisors’ code of conduct',
    'trust.c1': 'Never give technical instructions to workers', 'trust.c2': 'Never accept money or gifts from anyone on the site', 'trust.c3': 'Never handle a client’s money without a written order and a receipt', 'trust.c4': 'Stop the visit in case of danger or conflict, and alert the founder', 'trust.c5': 'Keep client information confidential',
    'trust.not': 'What KeurSuivi does not do',
    'trust.n1': 'Carry out the work or supply materials', 'trust.n2': 'Provide technical expertise, project management, plans or compliance checks', 'trust.n3': 'Guarantee the quality, deadlines or cost of the work', 'trust.n4': 'Manage the site’s money, except under a framework set by the contract: written order and mandatory receipt',
    'trust.f1': '· founder', 'trust.f2': 'More than 16 years of experience in port logistics, handling and construction. For the first months, every report is reviewed before it is sent.',
    'faq.eyebrow': 'Frequently asked questions', 'faq.title': 'What people ask before they start.',
    'faq.q1': 'What does a visit include?', 'faq.a1': 'Dated, geotagged photos and videos, never retouched; a structured report (progress, labour, materials, observations, expenses); expense tracking based on invoices and receipts, compared with your budget; and a fast alert when something is off.',
    'faq.q2': 'Do you handle the site’s money?', 'faq.a2': 'No. You pay your craftsmen and suppliers yourself. KeurSuivi observes and reports. The only possible exception is set by the contract: a written order and a mandatory receipt.',
    'faq.q3': 'Do you guarantee the quality of the work?', 'faq.a3': 'No. KeurSuivi observes and reports facts. We do not provide project management, plans or compliance checks, and we guarantee neither the quality, the deadlines nor the cost of the work. If you want a technical opinion, we call on a licensed engineer or architect.',
    'faq.q4': 'How do I pay from abroad?', 'faq.a4': 'By bank card (Visa, Mastercard) through a payment link, or by bank transfer for yearly plans and payments in euros or dollars. A relative in Senegal can also pay with Wave or Orange Money. Payment is made in advance, by the 5th of each month at the latest, and every payment comes with an invoice or a receipt.',
    'faq.q5': 'What are your lead times?', 'faq.a5': 'Reply within 24 business hours, then a quote within 48 h. The site reconnaissance takes place within 7 days of payment. You receive each report within 48 h, and an alert within 24 h. A high-level alert goes out by message immediately.',
    'faq.q6': 'What if a visit cannot take place?', 'faq.a6': 'In case of rain, a closed site or refused access, the visit is rescheduled within 7 days and you are told. If a report looks inaccurate to you, you can challenge it within 7 days.',
    'faq.q7': 'What if my site is outside your areas?', 'faq.a7': 'Write to us: any site outside our areas is quoted with travel costs. We cover Dakar, Rufisque, Thiès, Mbour, Saly and Saint-Louis.',
    'contact.eyebrow': 'Waitlist and quote', 'contact.title': 'Let’s talk about your site.',
    'contact.lead': 'Reply within 24 business hours, quote within 48 h. Tell us where your project stands and we will come back with a suitable plan.',
    'contact.wa': 'WhatsApp', 'contact.copy': 'Copy', 'contact.mail': 'E-mail', 'contact.lang': 'Languages',
    'form.name': 'Full name', 'form.wa': 'WhatsApp', 'form.wab': 'with country code', 'form.email': 'E-mail', 'form.opt': 'optional',
    'form.city': 'Site city', 'form.other': 'Another city', 'form.stage': 'Project stage',
    'form.s1': 'Land bought, nothing started', 'form.s2': 'Foundations under way', 'form.s3': 'Structure under way', 'form.s4': 'Finishing work', 'form.s5': 'Site stopped',
    'form.plan': 'Plan considered', 'form.p0': 'I don’t know yet', 'form.msg': 'Message', 'form.msgp': 'Type of work, company in place, budget…',
    'form.submit': 'Prepare my WhatsApp message', 'form.consent': 'Your details are used only to answer your request.',
    'form.ok': 'Your message is ready', 'form.okb': 'Open it in WhatsApp and send it: sending is what lets us reply within 24 business hours.', 'form.open': 'Open WhatsApp', 'form.copymsg': 'Copy the message',
    'foot.about': 'Remote construction monitoring in Senegal: visits, geotagged photos, reports and expense tracking. Keur means “house” in Wolof.',
    'foot.nav': 'Navigation', 'foot.contact': 'Contact', 'foot.langs': 'French · English',
    'foot.legal': 'KeurSuivi observes and reports. We do not carry out the work and do not guarantee its quality, deadlines or cost.',
  };
  const JS = {
    fr: {
      stages: ['Terrain', 'Fondations', 'Gros œuvre', 'Toiture et murs', 'Finitions'],
      perMonth: '/ mois', perYear: '/ an', was: 'au lieu de ',
      copied: 'Copié', copyFail: 'Sélectionnez puis copiez',
      errName: 'Indiquez votre nom.', errContact: 'Indiquez un numéro WhatsApp ou une adresse e-mail.', errEmail: 'Cette adresse e-mail semble incorrecte.',
      waGeneric: 'Bonjour KeurSuivi, je souhaite des informations sur le suivi de mon chantier au Sénégal.',
      waPlan: (p, price) => 'Bonjour KeurSuivi, je souhaite la formule ' + p + ' (' + price + ') pour le suivi de mon chantier. Pouvez-vous me proposer un devis ?',
      msgHead: 'Bonjour KeurSuivi,\nJe souhaite un devis pour le suivi de mon chantier.\n',
      lName: 'Nom', lCity: 'Ville du chantier', lStage: 'Stade du projet', lPlan: 'Formule envisagée', lWa: 'WhatsApp', lMail: 'E-mail', lMsg: 'Message',
      otherCity: 'Autre ville',
    },
    en: {
      stages: ['Plot', 'Foundations', 'Structure', 'Roof and walls', 'Finishing'],
      perMonth: '/ month', perYear: '/ year', was: 'instead of ',
      copied: 'Copied', copyFail: 'Select, then copy',
      errName: 'Please enter your name.', errContact: 'Please enter a WhatsApp number or an e-mail address.', errEmail: 'This e-mail address looks incorrect.',
      waGeneric: 'Hello KeurSuivi, I would like information about monitoring my construction site in Senegal.',
      waPlan: (p, price) => 'Hello KeurSuivi, I would like the ' + p + ' plan (' + price + ') to monitor my construction site. Could you send me a quote?',
      msgHead: 'Hello KeurSuivi,\nI would like a quote to monitor my construction site.\n',
      lName: 'Name', lCity: 'Site city', lStage: 'Project stage', lPlan: 'Plan considered', lWa: 'WhatsApp', lMail: 'E-mail', lMsg: 'Message',
      otherCity: 'Another city',
    },
  };
  let lang = 'fr';
  try {
    const saved = localStorage.getItem('ks-lang');
    if (saved === 'en' || saved === 'fr') lang = saved;
    else if ((navigator.language || '').toLowerCase().indexOf('en') === 0) lang = 'en';
  } catch (e) { /* stockage indisponible */ }

  // mémorise le français présent dans le HTML
  $$('[data-i18n]').forEach((el) => { el.__fr = el.innerHTML; });
  $$('[data-i18n-attr]').forEach((el) => {
    el.__frAttr = {};
    el.getAttribute('data-i18n-attr').split(';').forEach((pair) => { const n = pair.split(':')[0]; el.__frAttr[n] = el.getAttribute(n); });
  });
  function applyLang() {
    document.documentElement.lang = lang;
    $$('[data-i18n]').forEach((el) => { const k = el.getAttribute('data-i18n'); el.innerHTML = lang === 'en' && EN[k] !== undefined ? EN[k] : el.__fr; });
    $$('[data-i18n-attr]').forEach((el) => {
      el.getAttribute('data-i18n-attr').split(';').forEach((pair) => {
        const a = pair.split(':'), n = a[0], k = a[1];
        el.setAttribute(n, lang === 'en' && EN[k] !== undefined ? EN[k] : el.__frAttr[n]);
      });
    });
    $$('.lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    renderPrices(true); fillDates(); wireWhatsApp();
    if (typeof story.refreshLabel === 'function') story.refreshLabel();
  }
  $$('.lang button').forEach((b) => b.addEventListener('click', () => {
    lang = b.dataset.lang;
    try { localStorage.setItem('ks-lang', lang); } catch (e) { /* ignoré */ }
    applyLang();
  }));

  /* ------------------------------------------------------------------ */
  /* WhatsApp                                                            */
  /* ------------------------------------------------------------------ */
  const waHref = (text) => 'https://wa.me/' + CFG.wa + (text ? '?text=' + encodeURIComponent(text) : '');
  function planPrice(card) {
    // calculé depuis l'état (jamais depuis le texte affiché, qui peut être en pleine animation)
    const sym = price.cur === 'xof' ? 'FCFA' : '\u20ac', mult = price.period === 'year' ? 10 : 1;
    return fmtNum(Number(card.dataset[price.cur]) * mult) + ' ' + sym + ' ' + (price.period === 'year' ? JS[lang].perYear : JS[lang].perMonth);
  }
  function wireWhatsApp() {
    $$('a[data-wa]').forEach((a) => {
      if (a.dataset.wa === 'plan') {
        const card = a.closest('.plan');
        a.href = waHref(JS[lang].waPlan(card.querySelector('.plan-name').textContent, planPrice(card)));
      } else a.href = waHref(JS[lang].waGeneric);
    });
  }

  /* ------------------------------------------------------------------ */
  /* En-tête, menu mobile, bouton WhatsApp flottant                      */
  /* ------------------------------------------------------------------ */
  const header = $('.site-header'), nav = $('#nav'), menuBtn = $('#menuBtn'), fab = $('#waFab');
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.innerHTML = '<svg class="i" aria-hidden="true"><use href="#i-' + (open ? 'close' : 'menu') + '"/></svg>';
  }
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  $$('a', nav).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  let contactInView = false;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((en) => { contactInView = en[0].isIntersecting; updateChrome(); }).observe($('#contact'));
  }
  function updateChrome() {
    header.classList.toggle('is-stuck', window.scrollY > 8);
    fab.classList.toggle('is-on', window.scrollY > 720 && !contactInView);
  }

  /* ------------------------------------------------------------------ */
  /* Dates de l'exemple de rapport (toujours récentes)                   */
  /* ------------------------------------------------------------------ */
  function fillDates() {
    const d = new Date(); d.setDate(d.getDate() - 2);
    const long = d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '');
    const dd = String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0');
    const n = new Date(); n.setDate(n.getDate() + 12);
    const nextLong = n.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '');
    $$('[data-nextdate]').forEach((el) => { el.textContent = nextLong; });
    $$('[data-sampledate]').forEach((el) => { el.textContent = long; });
    $$('[data-sampledd]').forEach((el) => { el.textContent = dd; });
  }

  /* ------------------------------------------------------------------ */
  /* Tarifs : période et devise                                          */
  /* ------------------------------------------------------------------ */
  const price = { period: 'month', cur: 'xof' };
  const shown = new WeakMap();
  function fmtNum(n) { return new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-US').format(n); }
  function renderPrices(instant) {
    const sym = price.cur === 'xof' ? 'FCFA' : '€', mult = price.period === 'year' ? 10 : 1;
    $$('.plan').forEach((card) => {
      const base = Number(card.dataset[price.cur]), target = base * mult, numEl = $('.price-num', card), prev = shown.get(card);
      $('.price-unit', card).textContent = sym + ' ' + (price.period === 'year' ? JS[lang].perYear : JS[lang].perMonth);
      $('.price-was', card).textContent = price.period === 'year' ? JS[lang].was + fmtNum(base * 12) + ' ' + sym : '';
      if (instant || reduce || prev === undefined) { numEl.textContent = fmtNum(target); shown.set(card, target); return; }
      const from = prev, t0 = performance.now();
      shown.set(card, target);
      (function step(now) {
        const k = easeOut((now - t0) / 420);
        numEl.textContent = fmtNum(Math.round(lerp(from, target, k)));
        if (k < 1) requestAnimationFrame(step); else numEl.textContent = fmtNum(target);
      })(t0);
    });
    wireWhatsApp();
  }
  $$('#segPeriod button').forEach((b) => b.addEventListener('click', () => { price.period = b.dataset.period; $$('#segPeriod button').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); renderPrices(); }));
  $$('#segCur button').forEach((b) => b.addEventListener('click', () => { price.cur = b.dataset.cur; $$('#segCur button').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); renderPrices(); }));
  // inclinaison douce des cartes de formule au pointeur
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    $$('.plan').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(900px) rotateX(' + (-y * 5).toFixed(2) + 'deg) rotateY(' + (x * 6).toFixed(2) + 'deg) translateY(-4px)';
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Téléphone 3D (rapport) : inclinaison au pointeur                    */
  /* ------------------------------------------------------------------ */
  const phoneStage = $('#phoneStage'), phone = $('#phone');
  if (phoneStage && phone && !reduce) {
    phoneStage.addEventListener('pointermove', (e) => {
      const r = phoneStage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      phone.style.setProperty('--ry', (-17 + x * 22).toFixed(1) + 'deg');
      phone.style.setProperty('--rx', (7 - y * 16).toFixed(1) + 'deg');
    });
    phoneStage.addEventListener('pointerleave', () => { phone.style.removeProperty('--ry'); phone.style.removeProperty('--rx'); });
  }

  /* ------------------------------------------------------------------ */
  /* Copie dans le presse-papiers                                        */
  /* ------------------------------------------------------------------ */
  function selectText(el) { const r = document.createRange(); r.selectNodeContents(el); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
  function copyText(text, btn, fallbackEl) {
    const label = btn.querySelector('span'), old = label ? label.innerHTML : '';
    const done = (ok) => {
      if (label) { label.textContent = ok ? JS[lang].copied : JS[lang].copyFail; setTimeout(() => { label.innerHTML = old; }, 1800); }
      if (!ok && fallbackEl) selectText(fallbackEl);
    };
    try { navigator.clipboard.writeText(text).then(() => done(true), () => done(false)); } catch (e) { done(false); }
  }
  $$('.copy[data-copy]').forEach((b) => b.addEventListener('click', () => copyText(b.dataset.copy, b, b.previousElementSibling && b.previousElementSibling.querySelector('strong'))));

  /* ------------------------------------------------------------------ */
  /* Formulaire : prépare un message WhatsApp (aucun envoi automatique)  */
  /* ------------------------------------------------------------------ */
  const form = $('#form'), sent = $('#sent');
  function optLabel(sel) { const o = sel.options[sel.selectedIndex]; return o ? o.textContent.trim() : ''; }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#f-name').value.trim(), wa = $('#f-wa').value.trim(), mail = $('#f-email').value.trim();
    const eName = $('#e-name'), eWa = $('#e-wa'), eMail = $('#e-email');
    eName.textContent = eWa.textContent = eMail.textContent = '';
    ['#f-name', '#f-wa', '#f-email'].forEach((s) => $(s).removeAttribute('aria-invalid'));
    let ok = true;
    if (!name) { eName.textContent = JS[lang].errName; $('#f-name').setAttribute('aria-invalid', 'true'); ok = false; }
    if (!wa && !mail) { eWa.textContent = JS[lang].errContact; $('#f-wa').setAttribute('aria-invalid', 'true'); ok = false; }
    if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) { eMail.textContent = JS[lang].errEmail; $('#f-email').setAttribute('aria-invalid', 'true'); ok = false; }
    if (!ok) { const bad = $('[aria-invalid="true"]', form); if (bad) bad.focus(); return; }
    const L = JS[lang], lines = [L.msgHead];
    lines.push(L.lName + ' : ' + name);
    lines.push(L.lCity + ' : ' + optLabel($('#f-city')));
    lines.push(L.lStage + ' : ' + optLabel($('#f-stage')));
    if ($('#f-plan').value) lines.push(L.lPlan + ' : ' + $('#f-plan').value);
    if (wa) lines.push(L.lWa + ' : ' + wa);
    if (mail) lines.push(L.lMail + ' : ' + mail);
    const extra = $('#f-msg').value.trim();
    if (extra) lines.push(L.lMsg + ' : ' + extra);
    const text = lines.join('\n');
    $('#sentMsg').textContent = text;
    $('#sentWa').href = waHref(text);
    sent.classList.add('is-on');
    sent.focus({ preventScroll: true });
    sent.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
  });
  $('#sentCopy').addEventListener('click', (e) => copyText($('#sentMsg').textContent, e.currentTarget, $('#sentMsg')));

  /* ------------------------------------------------------------------ */
  /* Scènes 3D : héros interactif et étapes pilotées par le défilement   */
  /* ------------------------------------------------------------------ */
  const story = { refreshLabel: null };
  const vis = { hero: true, story: false };
  function makeScene(stage, canvas) {
    if (!window.THREE || !window.KSScene) return null;
    let sc;
    try { sc = window.KSScene.create(canvas, { lowPower: !!lowPower }); } catch (err) { return null; }
    const dpr = () => Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2);
    const fit = () => { const w = stage.clientWidth, h = stage.clientHeight; if (w > 0 && h > 0) sc.setSize(w, h, dpr()); };
    fit();
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(stage); else window.addEventListener('resize', fit);
    canvas.addEventListener('webglcontextlost', (ev) => { ev.preventDefault(); stage.classList.remove('is-live'); });
    return sc;
  }
  function watch(el, key) {
    if (!('IntersectionObserver' in window)) { vis[key] = true; return; }
    new IntersectionObserver((en) => { vis[key] = en[0].isIntersecting; }, { rootMargin: '120px' }).observe(el);
  }

  function startHero() {
    const stage = $('#heroStage'), canvas = $('#heroCanvas');
    const sc = makeScene(stage, canvas);
    if (!sc) return;
    sc.setProgress(1);
    watch(stage, 'hero');
    let userAz = 0, userEl = 0, dragging = false, lastX = 0, lastY = 0, px = 0, py = 0, cpx = 0, cpy = 0, live = false;
    const t0 = performance.now();
    canvas.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; stage.classList.add('is-drag'); try { canvas.setPointerCapture(e.pointerId); } catch (x) { /* ignoré */ } });
    canvas.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect(); px = (e.clientX - r.left) / r.width - 0.5; py = (e.clientY - r.top) / r.height - 0.5;
      if (!dragging) return;
      userAz -= (e.clientX - lastX) * 0.3; userEl = clamp(userEl + (e.clientY - lastY) * 0.12, -12, 18);
      lastX = e.clientX; lastY = e.clientY;
    });
    const end = () => { dragging = false; stage.classList.remove('is-drag'); };
    canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('pointerleave', () => { px = py = 0; });
    function frame(now) {
      requestAnimationFrame(frame);
      if (!vis.hero || document.hidden) return;
      const t = (now - t0) / 1000;
      cpx += (px - cpx) * 0.06; cpy += (py - cpy) * 0.06;
      const sway = reduce ? 0 : Math.sin(t * 0.3) * 8;
      sc.setPose({ az: 38 + sway + userAz + cpx * 8, el: 24 + userEl - cpy * 3, zoom: 1, ty: 0.2 });
      sc.render(t);
      if (!live) { live = true; stage.classList.add('is-live'); }
    }
    requestAnimationFrame(frame);
  }

  function startStory() {
    const stage = $('#storyStage'), canvas = $('#storyCanvas'), steps = $$('.step', $('#steps'));
    const bar = $('#storyBar'), pct = $('#storyPct'), nameEl = $('#storyName');
    let sc = null, live = false, target = 0, cur = 0, last = -1, ticking = false;
    const K = steps.map((s) => Number(s.dataset.p));
    function measure() {
      ticking = false;
      // ligne de lecture : au milieu de l'écran, ou sous la maquette fixée en haut sur mobile
      const stacked = window.matchMedia('(max-width: 860px)').matches, sb = stage.getBoundingClientRect().bottom;
      const mid = stacked ? sb + (window.innerHeight - sb) * 0.4 : window.innerHeight * 0.5, cs = steps.map((s) => { const r = s.getBoundingClientRect(); return r.top + r.height / 2; });
      let p;
      if (mid <= cs[0]) p = K[0];
      else if (mid >= cs[cs.length - 1]) p = K[K.length - 1];
      else { let i = 0; while (i < cs.length - 2 && mid > cs[i + 1]) i++; p = lerp(K[i], K[i + 1], smooth((mid - cs[i]) / (cs[i + 1] - cs[i]))); }
      target = p;
      let best = 0, bd = 1e9;
      cs.forEach((c, i) => { const d = Math.abs(c - mid); if (d < bd) { bd = d; best = i; } });
      steps.forEach((s, i) => s.classList.toggle('is-active', i === best));
    }
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(measure); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    function label(p) { const n = JS[lang].stages; return p < 0.08 ? n[0] : p < 0.3 ? n[1] : p < 0.6 ? n[2] : p < 0.85 ? n[3] : n[4]; }
    story.refreshLabel = () => { nameEl.textContent = label(cur); };
    function hud(p) { bar.style.width = (p * 100).toFixed(1) + '%'; pct.textContent = String(Math.round(p * 100)); nameEl.textContent = label(p); }
    hud(0); measure();
    watch(stage, 'story');
    function boot() { sc = makeScene(stage, canvas); if (sc) { sc.setProgress(0); last = -1; } }
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((en) => { if (en[0].isIntersecting) { io.disconnect(); setTimeout(boot, 30); } }, { rootMargin: '700px' });
      io.observe(stage);
    } else boot();
    function frame(now) {
      requestAnimationFrame(frame);
      if (!sc || !vis.story || document.hidden) return;
      cur = reduce ? target : cur + (target - cur) * 0.12;
      if (Math.abs(cur - target) < 0.0006) cur = target;
      hud(cur);
      if (Math.abs(cur - last) > 0.0003) { sc.setProgress(cur); last = cur; }
      sc.setPose({ az: lerp(64, 38, smooth(cur)) + Math.sin(now / 4000) * 2, el: lerp(30, 24, cur), ty: -0.9 });
      sc.render(now / 1000);
      if (!live) { live = true; stage.classList.add('is-live'); }
    }
    requestAnimationFrame(frame);
  }

  /* ------------------------------------------------------------------ */
  /* Démarrage                                                           */
  /* ------------------------------------------------------------------ */
  window.addEventListener('scroll', updateChrome, { passive: true });
  applyLang(); updateChrome();
  startStory();   // étapes, jauge et défilement : fonctionnent même sans WebGL
  // la page est affichée avant de générer les textures du héros 3D
  if (document.readyState === 'complete') setTimeout(startHero, 40); else window.addEventListener('load', () => setTimeout(startHero, 40));
})();
