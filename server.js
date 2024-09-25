// Import necessary modules using ES module syntax
import express from 'express';
import multer from 'multer';
import sgMail from '@sendgrid/mail';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';
import cors from 'cors';

// Load environment variables
dotenv.config();

// Print the SendGrid API Key to the console for debugging
console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY);

// Set up SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Middleware to parse JSON and multipart/form-data
app.use(express.json());
const upload = multer({ dest: 'uploads/' }); // File storage config

// Get the directory name in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Route to handle email sending
app.post('/send-email', upload.single('attachment'), (req, res) => {
  console.log('Email request received:', req.body);
  const { name, email, message } = req.body;
  // Ensure attachment is handled correctly
  const attachmentPath = req.file ? path.join(__dirname, req.file.path) : null;

  const msg = {
    to: 'pchu0028@student.monash.edu', // Replace with the actual MSA email address
    from: 'pchu0028@student.monash.edu',
    subject: `Contact Us: Message from ${name}`,
    text: message,
    html: `<p>${message}</p>`,
  };

  if (attachmentPath) {
    msg.attachments = [
      {
        content: fs.readFileSync(attachmentPath).toString('base64'),
        filename: req.file.originalname,
        type: req.file.mimetype,
        disposition: 'attachment',
      },
    ];
  }

  sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent successfully!');
    res.status(200).json({ message: 'Email sent successfully!' });
  })
  .catch((error) => {
    console.error('Error sending email:', error.response ? error.response.body : error); // Log detailed error information
    res.status(500).json({ error: error.response ? error.response.body : error.toString() });
  });
});

// Start the server
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
