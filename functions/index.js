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
const {firestore} = require("firebase-admin");
const dayjs = require("dayjs");

require("dotenv").config();

initializeApp();

const db = firestore();
const sendGridApiKey = process.env.SENDGRID_API_KEY;
sgMail.setApiKey(sendGridApiKey);
console.log("sendGridApiKey:", sendGridApiKey);

/**
 * Cloud Function to send a single email.
 */
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
        Regards,\nMSA Hub Team`,
        html: `<p>Dear ${name},</p><p>Thank you for contacting us! We have
        received your message and will get back to you shortly.</p><p>Best
        Regards,<br/>MSA Hub Team</p>`,
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

/**
 * Cloud Function to send bulk emails for specified scenarios.
 */
exports.sendBulkEmails = onRequest({
  timeoutSeconds: 300,
  memory: "512MiB",
}, async (req, res) => {
  return cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const {scenario} = req.body;
    if (!scenario) {
      return res.status(400).send("Bad Request: Missing scenario.");
    }

    try {
      let users = [];

      // Scenario 1: Users who have not input symptom entry for > 1 week
      if (scenario === "symptomTracker") {
        users = await getInactiveUsers();
      }

      // Scenario 2: Users who have an upcoming event within 24 hours
      if (scenario === "upcomingEvent") {
        users = await getUsersWithUpcomingEvents();
      }

      // Scenario 3: Users with medication end date already passed
      if (scenario === "medicationEndDate") {
        users = await getUsersWithExpiredMedications();
      }

      if (users.length === 0) {
        return res.status(200).send("No users to send emails.");
      }

      // Send bulk email to users
      await sendBulkEmail(users, scenario);

      res.status(200).send("Bulk email sent successfully!");
    } catch (error) {
      console.error("Error sending bulk email:", error.message);
      res.status(500).send(`Error sending bulk email: ${error.message}`);
    }
  });
});

/**
 * Helper function for Scenario 1: Get users who have not logged any
 * Symptom Tracker entry in over a week.
 * @return {Array} List of users who need to be notified.
 */
async function getInactiveUsers() {
  const oneWeekAgo = dayjs().subtract(7, "day").toDate();
  const usersSnapshot = await db.collection("users").get();
  const usersToNotify = [];

  for (const userDoc of usersSnapshot.docs) {
    const user = userDoc.data();
    const symptomEntriesSnapshot = await db.collection("symptomEntries")
        .where("userId", "==", userDoc.id)
        .orderBy("date", "desc")
        .limit(1)
        .get();

    const lastEntry = symptomEntriesSnapshot.docs[0];
    if (!lastEntry || lastEntry.data().date.toDate() < oneWeekAgo) {
      usersToNotify.push({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      });
    }
  }
  return usersToNotify;
}

/**
 * Helper function for Scenario 2: Get users who have an event
 * scheduled within the next 24 hours.
 * @return {Array} List of users who need to be notified.
 */
async function getUsersWithUpcomingEvents() {
  const upcomingThreshold = dayjs().add(24, "hour").toDate();
  const now = new Date();
  const eventsSnapshot = await db.collection("events")
      .where("startTime", ">=", now)
      .where("startTime", "<=", upcomingThreshold)
      .get();

  const usersToNotify = [];
  for (const eventDoc of eventsSnapshot.docs) {
    const event = eventDoc.data();
    const userDoc = await db.collection("users").doc(event.userId).get();
    if (userDoc.exists) {
      const user = userDoc.data();
      usersToNotify.push({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        eventTitle: event.title,
        eventTime: event.startTime.toDate().toLocaleString(),
      });
    }
  }
  return usersToNotify;
}

/**
 * Helper function for Scenario 3: Get users whose medication end
 * date has already passed.
 * @return {Array} List of users who need to be notified.
 */
async function getUsersWithExpiredMedications() {
  const now = new Date();
  const medicationsSnapshot = await db.collection("medications")
      .where("endDate", "<=", now)
      .get();

  const usersToNotify = [];
  for (const medDoc of medicationsSnapshot.docs) {
    const medication = medDoc.data();
    if (!medication.endDate) continue; // Skip if no endDate

    const userDoc = await db.collection("users").doc(medication.userId).get();
    if (userDoc.exists) {
      const user = userDoc.data();
      usersToNotify.push({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        medicationName: medication.name,
        endDate: medication.endDate.toDate().toLocaleDateString(),
      });
    }
  }
  return usersToNotify;
}

/**
 * Helper function: Send bulk emails to a list of users based on the
 * specified scenario.
 * @param {Array} users - List of users to send emails to.
 * @param {string} scenario - The email scenario.
 */
async function sendBulkEmail(users, scenario) {
  const emails = users.map((user) => {
    let subject;
    let text;
    let html;

    // Customize message for each scenario
    if (scenario === "symptomTracker") {
      subject = `Reminder to update your Symptom Tracker`;
      text = `Dear ${user.name},\n\nIt looks like you haven't added any
      new entries in the Symptom Tracker for over a week. Please make
      sure to update it as needed.\n\nBest regards,\nMSA Hub Team`;
      html = `<p>Dear ${user.name},</p><p>It looks like you haven't added
      any new entries in the Symptom Tracker for over a week. Please make
      sure to update it as needed.</p><p>Best regards,<br/>MSA Hub Team</p>`;
    } else if (scenario === "upcomingEvent") {
      subject = `Upcoming Event Reminder`;
      text = `Dear ${user.name},\n\nThis is a reminder for your upcoming
      event: "${user.eventTitle}" scheduled at ${user.eventTime}. Please
      don't forget!\n\nBest regards,\nMSA Hub Team`;
      html = `<p>Dear ${user.name},</p><p>This is a reminder for your
      upcoming event: <strong>${user.eventTitle}</strong> scheduled at
      ${user.eventTime}. Please don't forget!</p><p>Best regards,<br/>MSA
      Hub Team</p>`;
    } else if (scenario === "medicationEndDate") {
      subject = `Your medication period has ended`;
      text = `Dear ${user.name},\n\nThis is a reminder that your
      medication "${user.medicationName}" period has ended on
      ${user.endDate}. Please consult your doctor if you need any
      further advice.\n\nBest regards,\nMSA Hub Team`;
      html = `<p>Dear ${user.name},</p><p>This is a reminder that your
      medication <strong>${user.medicationName}</strong> period has
      ended on ${user.endDate}. Please consult your doctor if you need
      any further advice.</p><p>Best regards,<br/>MSA Hub Team</p>`;
    }

    return {
      to: user.email,
      from: "info@em94.msahub.life",
      subject,
      text,
      html,
    };
  });

  // Send the emails in bulk using SendGrid
  await sgMail.send(emails);
}
