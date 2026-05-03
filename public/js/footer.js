// js/footer.js
function loadFooter() {
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (!footerPlaceholder) return;
  
  footerPlaceholder.innerHTML = `
    <footer class="site-footer">
      <div class="container footer-bottom">
        <div class="footer-links">
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