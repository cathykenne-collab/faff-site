// generate-images.js
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Couleurs FAFF
const colors = {
  primary: '#0f5c3e',
  secondary: '#e76f51',
  dark: '#0a3528',
  light: '#fef9e6',
  white: '#ffffff',
  text: '#2d4a3b'
};

// Fonction pour créer une image avec texte
function generateImage(filename, width, height, bgColor, text, textColor = '#ffffff') {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Fond
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);
  
  // Dégradé subtil
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, bgColor);
  gradient.addColorStop(1, bgColor === colors.primary ? colors.dark : colors.secondary);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Texte
  ctx.fillStyle = textColor;
  ctx.font = `bold ${Math.floor(width / 15)}px "Segoe UI", Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Ajouter un ombrage au texte
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 10;
  ctx.fillText(text, width / 2, height / 2);
  
  // Ajouter un petit logo FAFF en bas à droite
  ctx.font = `bold ${Math.floor(width / 25)}px "Segoe UI", Arial`;
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillText('FAFF', width - 40, height - 30);
  
  // Sauvegarder
  const buffer = canvas.toBuffer('image/png');
  const outputPath = path.join(__dirname, 'public/images', filename);
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Généré: ${filename}`);
}

// Vérifier que le dossier public/images existe
const imagesDir = path.join(__dirname, 'public/images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

console.log('🎨 Génération des images FAFF...\n');

// ========== BANNIÈRES (1920x400) ==========
const bannerWidth = 1920;
const bannerHeight = 400;

generateImage('about-banner.png', bannerWidth, bannerHeight, colors.primary, 'À propos de FAFF');
generateImage('programs-banner.png', bannerWidth, bannerHeight, colors.secondary, 'Nos Programmes');
generateImage('impact-banner.png', bannerWidth, bannerHeight, colors.primary, 'Impact & Résultats');
generateImage('soutenir-banner.png', bannerWidth, bannerHeight, colors.secondary, 'Soutenir FAFF');
generateImage('infolettre-banner.png', bannerWidth, bannerHeight, colors.primary, 'Infolettre');
generateImage('contact-banner.png', bannerWidth, bannerHeight, colors.secondary, 'Contactez-nous');
generateImage('inscription-banner.png', bannerWidth, bannerHeight, colors.primary, 'Inscription');
generateImage('evenements-banner.png', bannerWidth, bannerHeight, colors.secondary, 'Événements');

// ========== IMAGES DE CONTENU (600x400) ==========
const contentWidth = 600;
const contentHeight = 400;

generateImage('family.png', contentWidth, contentHeight, colors.primary, '👨‍👩‍👧‍👦\nFamille', colors.white);
generateImage('fathers.png', contentWidth, contentHeight, colors.secondary, '👨‍👦\nPères', colors.white);
generateImage('mothers.png', contentWidth, contentHeight, colors.primary, '👩‍👧‍👦\nMamans', colors.white);
generateImage('school.png', contentWidth, contentHeight, colors.secondary, '🏫\nMédiation scolaire', colors.white);

console.log('\n✅ Toutes les images ont été générées avec succès !');
console.log('📁 Emplacement: public/images/');
console.log('💡 Tu peux maintenant les remplacer manuellement par tes propres images.');