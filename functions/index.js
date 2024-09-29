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
const sgMail = require("@sendgrid/mail");
const cors = require("cors")({origin: true});
const {initializeApp} = require("firebase-admin/app");
require("dotenv").config();

initializeApp();

const sendGridApiKey = process.env.SENDGRID_API_KEY;
sgMail.setApiKey(sendGridApiKey);
console.log("sendGridApiKey:", sendGridApiKey);

exports.sendEmail = onRequest({
  timeoutSeconds: 300,
  memory: "512MiB",
}, async (req, res) => {
  console.log("Handling request!!!!");

  // Use CORS middleware to handle preflight requests
  return cors(req, res, async () => {
    console.log("Received request:", req.method, req.body);

    // Check if the request method is POST, otherwise reject it
    if (req.method !== "POST") {
      console.log("Invalid request method:", req.method);
      return res.status(405).send("Method Not Allowed");
    }

    // Extract data from the request body
    const {email, name} = req.body;
    console.log("Extracted from req.body:", {email, name});

    // Validate the extracted values
    if (!email || !name) {
      console.log("Missing required fields: ", {email, name});
      return res.status(400).send("Bad Request: Missing required fields.");
    }

    try {
      // Prepare the email message
      const msg = {
        to: email, // user's provided email
        from: "info@em94.msahub.life", // verified domain email
        subject: `Thank you, ${name}!`,
        text: `Dear ${name},\n\nThank you for contacting us! We have
        received your message and will get back to you shortly.\n\nBest
        Regards,\nTeam`,
        html: `<p>Dear ${name},</p><p>Thank you for contacting us! We have
        received your message and will get back to you shortly.</p><p>Best
        Regards,<br/>Team</p>`,
      };

      console.log("Sending email with SendGrid:", msg);

      // Send the email using SendGrid
      await sgMail.send(msg);

      // Send success response if email was sent successfully
      // res.set('Access-Control-Allow-Origin', '*');
      res.status(200).send("Email sent successfully!");
    } catch (error) {
      // Log error if email sending failed
      console.error("Error sending email:", error.message);
      res.status(500).send(`Error sending email: ${error.message}`);
    }
  });
});

// exports.sendEmail = onRequest({
//   timeoutSeconds: 300,
//   memory: "512MiB",
// }, async (req, res) => {
//   console.log("Handling request!!!!");

//   if (req.method === "OPTIONS" || req.method == "OPTIONS") {
//     console.log("Handling OPTIONS request for CORS preflight.");
//     res.set("Access-Control-Allow-Origin", "*");
//     res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
//     res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
//     return res.status(204).send(""); // Send empty response with 204 status
//   }

//   cors(req, res, async () => { // Use CORS middleware to handle preflight
//     // Handle preflight OPTIONS request
//     if (req.method === "OPTIONS") {
//       console.log("Handling OPTIONS request for CORS preflight.");
//       res.set("Access-Control-Allow-Origin", "*");
//       res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
//       res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
//       res.set("Access-Control-Max-Age", "3600");
//       return res.status(204).send(""); // Send empty response with 204 status
//     }

//     // Handle the main POST request
//     try {
//       console.log("Received request:", req.method, req.body);

//       // Check if the request method is POST, otherwise reject it
//       if (req.method !== "POST") {
//         console.log("Invalid request method:", req.method);
//         return res.status(405).send("Method Not Allowed");
//       }

//       // Extract data from the request body
//       const {email, name} = req.body;
//       console.log("Extracted from req.body:", {email, name});

//       // Validate the extracted values
//       if (!email || !name) {
//         console.log("Missing required fields: ", {email, name});
//         return res.status(400).send("Bad Request: Missing required fields.");
//       }

//       // Prepare the email message
//       const msg = {
//         to: email, // user's provided email
//         from: "info@em94.msahub.life", // verified domain email
//         subject: `Thank you, ${name}!`,
//         text: `Dear ${name},\n\nThank you for contacting us! We have
//         received
//         your message and will get back to you shortly.\n\nBest Regards,
//         \nTeam`,
//         html: `<p>Dear ${name},</p><p>Thank you for contacting us! We have
//         received your message and will get back to you shortly.</p><p>Best
//         Regards,<br/>Team</p>`,
//       };

//       console.log("Sending email with SendGrid:", msg);

//       // Send the email using SendGrid
//       await sgMail.send(msg);

//       // Set CORS headers and send success response
//       res.set("Access-Control-Allow-Origin", "*");
//       return res.status(200).send("Email sent successfully!");
//     } catch (error) {
//       // Log error if email sending failed
//       console.error("Error sending email:", error.message);
//       return res.status(500).send(`Error sending email: ${error.message}`);
//     }
//   });
// });
