// js/footer.js
function loadFooter() {
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (!footerPlaceholder) return;
  
  footerPlaceholder.innerHTML = `
    <footer class="site-footer">
      <div class="container footer-bottom">
        <div class="footer-links">
          <!-- Liens principaux déplacés depuis le header -->
          <a href="/infolettre.html" data-i18n="nav_newsletter">Infolettre</a>
          <a href="/partenaires.html" data-i18n="nav_partners">Partenaires</a>
          <a href="/accessibilite.html" data-i18n="nav_accessibility">Accessibilité</a>
          <a href="/contact.html" data-i18n="nav_contact">Contact</a>
          <!-- Séparateur -->
          <span style="opacity:0.3">|</span>
          <!-- Liens légaux -->
          <a href="/sitemap.html" data-i18n="nav_sitemap">Plan du site</a>
          <a href="/terms.html" data-i18n="nav_terms">Conditions d'utilisation</a>
          <a href="/privacy.html" data-i18n="nav_privacy">Confidentialité</a>
        </div>
        <div>© <span id="year"></span> FAFF — <span data-i18n="footer_rights">Tous droits réservés.</span></div>
      </div>
    </footer>
  `;
  
  document.getElementById('year') && (document.getElementById('year').innerText = new Date().getFullYear());
}

document.addEventListener('DOMContentLoaded', loadFooter);