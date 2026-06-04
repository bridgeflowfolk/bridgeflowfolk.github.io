/**
 * BFF Nav — composant universel
 * Injecte la nav principale dans n'importe quelle page.
 * Usage : <script src="nav-commun.js"></script> dans le <head>
 * La nav s'insère automatiquement en début de <body>.
 */
(function () {
  'use strict';

  /* ── Config des pages ── */
  const PAGES = {
    index:    { href:'index.html',   label:'Accueil' },
    apropos:  { href:'apropos.html', label:'Association' },
  };

  const JEUX = [
    { href:'bff-mot.html',    label:'Mots Cachés',      icon:'🔤' },
    { href:'jeu-bff.html',    label:'Fleurs en Chaîne', icon:'🌸' },
    { href:'pont-v10.html',   label:'Le Pont Vivant',   icon:'🌉' },
  ];

  /* ── Détection page courante ── */
  const path = window.location.pathname.split('/').pop() || 'index.html';

  function isActive(href) {
    return path === href || (path === '' && href === 'index.html');
  }
  function isGamePage() {
    return JEUX.some(j => j.href === path);
  }

  /* ── Construction HTML ── */
  function buildNav() {
    const jeuActif = JEUX.find(j => j.href === path);

    // Label du bouton Jeux : affiche le jeu actif si on est sur une page jeu
    const jeuxBtnLabel = jeuActif
      ? `${jeuActif.icon} ${jeuActif.label}`
      : 'Jeux';

    const desktopLinks = `
      <a href="index.html"
         class="bff-nav__link${isActive('index.html') ? ' bff-nav__link--active' : ''}">
        Accueil
      </a>

      <div class="bff-nav__group" id="bff-group">
        <button class="bff-nav__group-btn${isGamePage() ? ' bff-nav__group-btn--active' : ''}"
                aria-haspopup="true" aria-expanded="false" id="bff-group-btn">
          ${jeuxBtnLabel}
          <span class="bff-nav__chevron" aria-hidden="true"></span>
        </button>
        <div class="bff-nav__dropdown" id="bff-dropdown" role="menu">
          ${JEUX.map(j => `
            <a href="${j.href}"
               class="bff-nav__dropdown-item${isActive(j.href) ? ' bff-nav__dropdown-item--active' : ''}"
               role="menuitem">
              <span class="bff-nav__dropdown-icon">${j.icon}</span>
              ${j.label}
            </a>`).join('')}
        </div>
      </div>

      <a href="apropos.html"
         class="bff-nav__link${isActive('apropos.html') ? ' bff-nav__link--active' : ''}">
        Association
      </a>
    `;

    const mobileLinks = `
      <a href="index.html"
         class="bff-nav__mobile-link${isActive('index.html') ? ' bff-nav__mobile-link--active' : ''}">
        Accueil
      </a>

      <span class="bff-nav__mobile-section">Jeux</span>
      ${JEUX.map(j => `
        <a href="${j.href}"
           class="bff-nav__mobile-link bff-nav__mobile-link--sub${isActive(j.href) ? ' bff-nav__mobile-link--active' : ''}">
          <span>${j.icon}</span> ${j.label}
        </a>`).join('')}

      <a href="apropos.html"
         class="bff-nav__mobile-link${isActive('apropos.html') ? ' bff-nav__mobile-link--active' : ''}">
        Association
      </a>
    `;

    return `
      <a href="#main-content" class="bff-skip">Aller au contenu</a>
      <nav class="bff-nav" aria-label="Navigation principale">
        <a href="index.html" class="bff-nav__logo">
          <img src="logo-sansFond.png" alt="" class="bff-nav__logo-icon" width="32" height="32" />
          Bridge &amp; Flow Folk
        </a>

        <div class="bff-nav__links" id="bff-nav-links">
          ${desktopLinks}
        </div>

        <button class="bff-nav__burger" id="bff-burger"
                aria-label="Menu" aria-expanded="false" aria-controls="bff-mobile-menu">
          <span></span><span></span><span></span>
        </button>
      </nav>

      <div class="bff-nav__mobile" id="bff-mobile-menu" aria-hidden="true">
        ${mobileLinks}
      </div>
    `;
  }

  /* ── Injection ── */
  function inject() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = buildNav();
    const body = document.body;
    body.insertBefore(wrapper, body.firstChild);
    initEvents();
  }

  /* ── Events ── */
  function initEvents() {
    const burger    = document.getElementById('bff-burger');
    const mobileMenu= document.getElementById('bff-mobile-menu');
    const groupBtn  = document.getElementById('bff-group-btn');
    const dropdown  = document.getElementById('bff-dropdown');

    /* Burger mobile */
    if (burger && mobileMenu) {
      burger.addEventListener('click', () => {
        const open = mobileMenu.classList.toggle('bff-nav__mobile--open');
        burger.classList.toggle('bff-nav__burger--open', open);
        burger.setAttribute('aria-expanded', open);
        mobileMenu.setAttribute('aria-hidden', !open);
        document.body.style.overflow = open ? 'hidden' : '';
      });

      /* Ferme le menu mobile si clic lien */
      mobileMenu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          mobileMenu.classList.remove('bff-nav__mobile--open');
          burger.classList.remove('bff-nav__burger--open');
          burger.setAttribute('aria-expanded', 'false');
          mobileMenu.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
        });
      });
    }

    /* Dropdown desktop */
    if (groupBtn && dropdown) {
      groupBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = dropdown.classList.toggle('bff-nav__dropdown--open');
        groupBtn.setAttribute('aria-expanded', open);
      });

      /* Ferme si clic ailleurs */
      document.addEventListener('click', () => {
        dropdown.classList.remove('bff-nav__dropdown--open');
        groupBtn.setAttribute('aria-expanded', 'false');
      });

      /* Accessibilité clavier */
      groupBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          dropdown.classList.remove('bff-nav__dropdown--open');
          groupBtn.setAttribute('aria-expanded', 'false');
          groupBtn.focus();
        }
      });
    }

    /* Ferme dropdown si scroll (UX propre) */
    window.addEventListener('scroll', () => {
      if (dropdown) {
        dropdown.classList.remove('bff-nav__dropdown--open');
        if (groupBtn) groupBtn.setAttribute('aria-expanded', 'false');
      }
    }, { passive:true });
  }

  /* ── Run ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

})();
