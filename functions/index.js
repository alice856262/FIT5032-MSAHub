/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require("firebase-functions");
const sgMail = require("@sendgrid/mail");
const cors = require("cors");

// Set SendGrid API Key
sgMail.setApiKey(functions.config().sendgrid.key);

// Initialize cors with default settings
const corsHandler = cors({origin: true});

exports.sendEmail = functions.https.onRequest((req, res) => {
  corsHandler(req, res, () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }
    const {email, name, message} = req.body;

    const msg = {
      to: "pchu0028@student.monash.edu", // Replace with the recipient's email
      from: email, // Sender's email
      subject: `Contact Us: Message from ${name}`,
      text: message,
      html: `<p>${message}</p>`,
    };

    sgMail
        .send(msg)
        .then(() => {
          return res.status(200).send("Email sent successfully!");
        })
        .catch((error) => {
          return res.status(500).send(`Error sending: ${error.toString()}`);
        });
  });
});
