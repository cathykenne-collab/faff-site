const express = require("express");
const router = express.Router();
const db = require("../db");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configuration multer pour les pièces jointes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../../public/uploads/temp");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } }); // Max 10MB

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// POST - Envoyer une newsletter à tous les abonnés (avec pièces jointes)
router.post("/", upload.array("attachments", 5), async (req, res) => {
  try {
    const { sujet, message } = req.body;
    const attachments = req.files || [];

    if (!sujet || !message) {
      // Nettoyer les fichiers temporaires
      attachments.forEach((file) => {
        try {
          fs.unlinkSync(file.path);
        } catch (e) {}
      });
      return res.status(400).json({
        success: false,
        error: "Le sujet et le message sont obligatoires",
      });
    }

    // Récupérer tous les abonnés
    const subscribers = db
      .prepare("SELECT nom, email FROM newsletter WHERE is_active = 1 ORDER BY created_at DESC")
      .all();

    if (subscribers.length === 0) {
      attachments.forEach((file) => {
        try {
          fs.unlinkSync(file.path);
        } catch (e) {}
      });
      return res.status(400).json({
        success: false,
        error: "Aucun abonné à l'infolettre",
      });
    }

    // Extraire les emails
    const bccEmails = subscribers.map((s) => s.email);

    // Préparer les pièces jointes
    const attachmentsList = attachments.map((file) => ({
      filename: file.originalname,
      path: file.path,
      cid: Date.now() + "-" + file.originalname, // Pour les images inline
    }));

    // Convertir le message avec support des images inline
    let htmlMessage = message.replace(/\n/g, "<br>");

    // Si des images sont jointes, on peut les référencer dans le HTML
    // L'utilisateur devra utiliser la syntaxe {{nom_fichier}} dans son message

    // HTML du message
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0a3528; color: white; padding: 30px 20px; text-align: center; border-radius: 20px 20px 0 0; }
          .header h2 { margin: 0; font-size: 1.8rem; }
          .header p { margin: 10px 0 0; opacity: 0.9; }
          .content { padding: 30px 20px; background: #ffffff; border: 1px solid #e9ecef; border-top: none; }
          .message { font-size: 1rem; line-height: 1.6; color: #2c3e2f; }
          .message img { max-width: 100%; height: auto; border-radius: 12px; margin: 15px 0; }
          .attachments { background: #f8f9fa; padding: 15px; border-radius: 12px; margin: 20px 0; }
          .attachments h4 { margin: 0 0 10px 0; color: #0a3528; }
          .attachments ul { margin: 0; padding-left: 20px; }
          .attachments li { margin: 5px 0; }
          .attachments a { color: #e76f51; text-decoration: none; }
          .attachments a:hover { text-decoration: underline; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 20px 20px; border: 1px solid #e9ecef; border-top: none; }
          .btn { display: inline-block; background: #e76f51; color: white; padding: 12px 24px; text-decoration: none; border-radius: 40px; margin-top: 20px; }
          .separator { border-top: 1px solid #e9ecef; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📧 FAFF - Familles Afro Francofun</h2>
            <p>Ensemble, construisons un avenir meilleur</p>
          </div>
          <div class="content">
            <div class="message">
              <p><strong>Bonjour à toutes et à tous,</strong></p>
              ${htmlMessage}
              <p style="margin-top: 25px;">
                Cordialement,<br>
                <strong>L'équipe FAFF</strong>
              </p>
            </div>
            ${attachmentsList.length > 0 ? `
            <div class="separator"></div>
            <div class="attachments">
              <h4>📎 Documents joints à ce message :</h4>
              <ul>
                ${attachmentsList.map(a => `<li>📄 ${a.filename}</li>`).join('')}
              </ul>
              <p><small>Ces documents sont également disponibles sur simple demande.</small></p>
            </div>
            ` : ''}
          </div>
          <div class="footer">
            <p>© 2025 FAFF - Tous droits réservés.</p>
            <p><small>Pour vous désinscrire, contactez-nous à <a href="mailto:contact@faff.ca" style="color:#e76f51;">contact@faff.ca</a></small></p>
            <p><small>Suivez-nous sur nos réseaux sociaux pour ne rien manquer !</small></p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Texte brut
    let textMessage = message;
    if (attachmentsList.length > 0) {
      textMessage +=
        "\n\n---\nDocuments joints :\n" +
        attachmentsList.map((a) => `- ${a.filename}`).join("\n");
    }

    const textContent = `
FAFF - Newsletter

${sujet}

Bonjour,

${textMessage}

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
      attachments: attachmentsList,
    });

    // Enregistrer l'envoi dans les logs
    const stmt = db.prepare(`
      INSERT INTO newsletter_logs (sujet, message, destinataires_count, pieces_jointes, envoye_le) 
      VALUES (?, ?, ?, ?, datetime('now'))
    `);
    stmt.run(
      sujet,
      message.substring(0, 500),
      subscribers.length,
      attachmentsList.map((a) => a.filename).join(", ")
    );

    // Nettoyer les fichiers temporaires après envoi
    attachments.forEach((file) => {
      try {
        fs.unlinkSync(file.path);
      } catch (e) {}
    });

    res.json({
      success: true,
      message: `Newsletter envoyée à ${subscribers.length} abonnés`,
      recipients: subscribers.length,
      attachments: attachmentsList.length,
    });
  } catch (error) {
    console.error("Erreur envoi:", error);
    // Nettoyer les fichiers temporaires en cas d'erreur
    if (req.files) {
      req.files.forEach((file) => {
        try {
          fs.unlinkSync(file.path);
        } catch (e) {}
      });
    }
    res.status(500).json({
      success: false,
      error: "Erreur lors de l'envoi: " + error.message,
    });
  }
});

// GET - Récupérer les logs d'envoi (optionnel)
router.get("/logs", (req, res) => {
  try {
    const tableExists = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='newsletter_logs'"
      )
      .get();
    if (!tableExists) {
      return res.json([]);
    }
    const logs = db
      .prepare("SELECT * FROM newsletter_logs ORDER BY envoye_le DESC LIMIT 20")
      .all();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/[&<>]/g, function (m) {
      if (m === "&") return "&amp;";
      if (m === "<") return "&lt;";
      if (m === ">") return "&gt;";
      return m;
    })
    .replace(/\n/g, "<br>");
}

module.exports = router;