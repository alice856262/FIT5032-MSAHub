/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


// const {onRequest} = require("firebase-functions/v1/https");
// const functions = require("firebase-functions");
// const sgMail = require("@sendgrid/mail");
// const cors = require("cors");

// // Set SendGrid API Key
// sgMail.setApiKey(functions.config().sendgrid.key);

// // Initialize cors with default settings
// const corsHandler = cors({origin: true});

// exports.sendEmail = onRequest((req, res) => {
//   corsHandler(req, res, () => {
//     console.log("Received request:", req.method, req.body);

//     if (req.method !== "POST") {
//       console.log("req.method:", req.method);
//       return res.status(405).send("Method Not Allowed");
//     }
//     console.log("Received request body:", req.body);
//     const {email, name, message} = req.body;

//     const msg = {
//       to: "pchu0028@student.monash.edu", // Replace with the recipient email
//       from: email, // Sender's email
//       subject: `Contact Us: Message from ${name}`,
//       text: message,
//       html: `<p>${message}</p>`,
//     };

//     console.log("Sending email with SendGrid:", msg);
//     sgMail
//         .send(msg)
//         .then(() => {
//           return res.status(200).send("Email sent successfully!");
//         })
//         .catch((error) => {
//           console.log("msg:", msg);
//           return res.status(500).send(`Error sending: ${error.toString()}`);
//         });
//   });
// });
const {onRequest} = require("firebase-functions/v2/https");
// const functions = require("firebase-functions");
const sgMail = require("@sendgrid/mail");
const cors = require("cors")({origin: true});
const {initializeApp} = require("firebase-admin/app");
require("dotenv").config();

// Initialize Firebase Admin if needed
// const admin = require("firebase-admin");
// admin.initializeApp();
initializeApp();

console.log("rprocess.env:", process.env.SENDGRID_API_KEY);

// const cloudConfig = JSON.parse(process.env.CLOUD_RUNTIME_CONFIG);
const sendGridApiKey = process.env.SENDGRID_API_KEY;

sgMail.setApiKey(sendGridApiKey);
console.log("sendGridApiKey:", sendGridApiKey);

// Define the Cloud Function using the onRequest trigger
// exports.sendEmail = onRequest((req, res) => {
//   // Use CORS middleware to handle CORS preflight requests
//   cors(req, res, async () => {
//     console.log("Received request:", req.method, req.body);

//     // Check if the request method is POST, otherwise reject it
//     if (req.method !== "POST") {
//       console.log("Invalid request method:", req.method);
//       return res.status(405).send("Method Not Allowed");
//     }

//     // Extract data from the request body
//     const {email, name, message} = req.body;

//     // Prepare the email message
//     const msg = {
//       to: "pchu0028@student.monash.edu", // Recipient's email
//       from: email, // Sender's email
//       subject: `Contact Us: Message from ${name}`,
//       text: message,
//       html: `<p>${message}</p>`,
//     };
//     console.log("Sending email with SendGrid:", msg);
//     sgMail
//         .send(msg)
//         .then(() => {
//           return res.status(200).send("Email sent successfully!");
//         })
//         .catch((error) => {
//           console.log("msg:", msg);
//           return res.status(500).send(`Error sending: ${error.toString()}`);
//         });
//   });
// });
exports.sendEmail = onRequest({
  timeoutSeconds: 300,
  memory: "512MiB",
}, async (req, res) => {
  try {
    // Use CORS middleware to handle preflight requests
    await cors(req, res, async () => {
      console.log("Received request:", req.method, req.body);

      // Check if the request method is POST, otherwise reject it
      if (req.method !== "POST") {
        console.log("Invalid request method:", req.method);
        return res.status(405).send("Method Not Allowed");
      }

      // Extract data from the request body
      const {email, name, message} = req.body;

      // Prepare the email message
      const msg = {
        to: "pchu0028@student.monash.edu", // Replace with recipient's email
        from: email, // Sender's email
        subject: `Contact Us: Message from ${name}`,
        text: message,
        html: `<p>${message}</p>`,
      };

      console.log("Sending email with SendGrid:", msg);

      // Send the email using SendGrid
      await sgMail.send(msg);

      // Send success response if email was sent successfully
      res.status(200).send("Email sent successfully!");
    });
  } catch (error) {
    // Log error if email sending failed
    console.error("Error sending email:", error.message);
    res.status(500).send(`Error sending email: ${error.message}`);
  }
});
