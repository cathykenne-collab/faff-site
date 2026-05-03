const express = require("express");
const router = express.Router();
const db = require("../db");
const nodemailer = require("nodemailer");

// Configuration du transporteur email
// À MODIFIER AVEC TES VRAIES IDENTIFIANTS
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // ou smtp.office365.com, smtp.mail.yahoo.com
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || "ton.email@gmail.com",
    pass: process.env.EMAIL_PASS || "tonmotdepasse",
  },
});

// POST - Envoyer une newsletter à tous les abonnés
router.post("/", async (req, res) => {
  try {
    const { sujet, message } = req.body;
    
    if (!sujet || !message) {
      return res.status(400).json({ 
        success: false, 
        error: "Le sujet et le message sont obligatoires" 
      });
    }
    
    // Récupérer tous les abonnés
    const subscribers = db.prepare("SELECT nom, email FROM newsletter ORDER BY created_at DESC").all();
    
    if (subscribers.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Aucun abonné à l'infolettre" 
      });
    }
    
    // Extraire les emails pour le CCI
    const bccEmails = subscribers.map(s => s.email);
    
    // HTML du message
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0a3528; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { font-size: 12px; color: #666; text-align: center; margin-top: 20px; }
          .btn { background: #e76f51; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>FAFF - Familles Afro Francofun</h2>
          </div>
          <div class="content">
            <h3>${escapeHtml(sujet)}</h3>
            <p>Bonjour,</p>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <p>Cordialement,<br>L'équipe FAFF</p>
          </div>
          <div class="footer">
            <p>© 2025 FAFF - Tous droits réservés.<br>
            <small>Pour vous désinscrire, contactez-nous à contact@faff.ca</small></p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Options du texte brut
    const textContent = `
FAFF - Newsletter

${sujet}

Bonjour,

${message}

Cordialement,
L'équipe FAFF

---
© 2025 FAFF - Tous droits réservés.
Pour vous désinscrire, contactez-nous à contact@faff.ca
    `;
    
    // Envoyer l'email
    const info = await transporter.sendMail({
      from: `"FAFF" <${process.env.EMAIL_USER || "contact@faff.ca"}>`,
      bcc: bccEmails,
      subject: sujet,
      text: textContent,
      html: htmlContent,
    });
    
    // Enregistrer l'envoi
    const stmt = db.prepare(`
      INSERT INTO newsletter_logs (sujet, message, destinataires_count, envoye_le) 
      VALUES (?, ?, ?, datetime('now'))
    `);
    stmt.run(sujet, message, subscribers.length);
    
    res.json({ 
      success: true, 
      message: `Newsletter envoyée à ${subscribers.length} abonnés`,
      recipients: subscribers.length
    });
    
  } catch (error) {
    console.error("Erreur envoi:", error);
    res.status(500).json({ 
      success: false, 
      error: "Erreur lors de l'envoi: " + error.message 
    });
  }
});

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

module.exports = router;