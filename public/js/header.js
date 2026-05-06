// js/header.js
function loadHeader() {
  const headerPlaceholder = document.getElementById('header-placeholder');
  if (!headerPlaceholder) return;
  
  const timestamp = new Date().getTime();
  
  headerPlaceholder.innerHTML = `
    <header class="site-header">
      <div class="container nav-wrap">
        <a class="logo" href="/index.html">
          <img src="/images/logo.png?t=${timestamp}" alt="Logo FAFF" class="logo-img" onerror="this.onerror=null; this.src='https://placehold.co/200x200/0f5c3e/white?text=FAFF'">
          <div class="logo-block">
            <span class="logo-text">FAFF</span>
            <small class="logo-subtext" data-i18n="logo_subtext">Familles Afro Francofun</small>
          </div>
        </a>
        
        <nav class="nav">
          <a href="/index.html" data-i18n="nav_home">Accueil</a>
          <a href="/about.html" data-i18n="nav_about">À propos</a>
          <a href="/programmes.html" data-i18n="nav_programs">Programmes</a>
          <a href="/impact.html" data-i18n="nav_impact">Impact</a>
          <a href="/evenements.html" data-i18n="nav_events">Événements</a>
          
          <a href="/soutenir.html#don" class="nav-cta" data-i18n="nav_donate">Faire un don</a>
        </nav>
        
        <div class="lang-switch">
          <button class="lang-btn active" data-lang="fr">FR</button>
          <button class="lang-btn" data-lang="en">EN</button>
        </div>
      </div>
    </header>
  `;
  
  // Appliquer la langue sauvegardée
  if (typeof window.updateUILanguage === 'function') {
    const savedLang = localStorage.getItem('faff_lang') || 'fr';
    window.updateUILanguage(savedLang);
  } else {
    console.warn('updateUILanguage non disponible');
  }
  
  // Réattacher les écouteurs de langue
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.removeEventListener('click', handleLangClick);
    btn.addEventListener('click', handleLangClick);
  });
}

function handleLangClick(e) {
  const lang = e.currentTarget.getAttribute('data-lang');
  if (lang && typeof window.updateUILanguage === 'function') {
    window.updateUILanguage(lang);
    localStorage.setItem('faff_lang', lang);
  }
}

function refreshLogo() {
  const logoImg = document.querySelector('.logo-img');
  if (logoImg) {
    const timestamp = new Date().getTime();
    logoImg.src = `/images/logo.png?t=${timestamp}`;
  }
}

window.refreshLogo = refreshLogo;

// Charger le header au chargement de la page
document.addEventListener('DOMContentLoaded', loadHeader);