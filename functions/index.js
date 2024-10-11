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
const {jsPDF} = require("jspdf");

require("jspdf-autotable");
require("dotenv").config();

initializeApp();

const db = firestore();
db.settings({ignoreUndefinedProperties: true});
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
      let attachmentData = [];

      // Scenario 1: Users who have not input symptom entry for > 1 week
      if (scenario === "symptomTracker") {
        users = await getInactiveUsers();
        attachmentData = await generateSymptomEntriesPDF(users);
      }

      // Scenario 2: Users who have an upcoming event within 24 hours
      if (scenario === "upcomingEvent") {
        users = await getUsersWithUpcomingEvents();
        attachmentData = await generateEventsPDF(users);
      }

      // Scenario 3: Users with medication end date already passed
      if (scenario === "medicationEndDate") {
        users = await getUsersWithExpiredMedications();
        attachmentData = await generateMedicationsPDF(users);
      }

      if (users.length === 0) {
        return res.status(200).send("No users to send emails.");
      }

      // Send bulk email to users
      await sendBulkEmail(users, scenario, attachmentData);

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
    if (!userDoc.id) continue;
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
        userId: userDoc.id,
      });
    }
  }
  return usersToNotify;
}

/**
 * Generates a PDF document of symptom entries for each user.
 * @param {Array} users - List of users to include in the PDF.
 * @return {Array} Array of {userId, pdfBuffer} objects to attach.
 */
async function generateSymptomEntriesPDF(users) {
  const attachments = [];

  for (const user of users) {
    // eslint-disable-next-line new-cap
    const doc = new jsPDF();
    doc.text("Symptom Tracker Entries", 10, 10);

    const symptomEntriesSnapshot = await db
        .collection("symptomEntries")
        .where("userId", "==", user.userId)
        .orderBy("date", "desc")
        .get();

    const entries = symptomEntriesSnapshot.docs.map((doc) => {
      const entry = doc.data();
      const formattedDate = entry.date && entry.date.toDate ?
        entry.date.toDate().toLocaleDateString("en-GB") : "N/A";
      return {
        date: formattedDate,
        symptom: entry.symptom || "N/A",
        severity: entry.severity || "N/A",
      };
    });

    doc.autoTable({
      head: [["Date", "Symptom", "Severity"]],
      body: entries.map((entry) => [
        entry.date,
        entry.symptom,
        entry.severity,
      ]),
    });
    const pdfBuffer = doc.output("arraybuffer");
    attachments.push({userId: user.userId, pdfBuffer});
  }
  return attachments;
}

/**
 * Helper function for Scenario 2: Get users who have an event
 * scheduled within the next 24 hours.
 * @return {Array} List of users who need to be notified.
 */
async function getUsersWithUpcomingEvents() {
  const now = new Date();
  const upcomingThreshold = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const eventsSnapshot = await db.collection("events")
      .where("start", ">=", now)
      .where("start", "<=", upcomingThreshold)
      .get();

  const usersToNotify = [];
  for (const eventDoc of eventsSnapshot.docs) {
    const event = eventDoc.data();
    const userDoc = await db.collection("users").doc(event.userId).get();
    if (userDoc.exists) {
      const user = userDoc.data();

      // Format the event's start time in Melbourne (Australia/Sydney) timezone
      const eventStartTime =
      new Date(event.start.toDate()).toLocaleString("en-AU", {
        timeZone: "Australia/Sydney",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      usersToNotify.push({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        eventTitle: event.title,
        eventDescription: event.description,
        eventTime: eventStartTime,
        userId: event.userId,
      });
    }
  }
  return usersToNotify;
}

/**
 * Generates a PDF document of upcoming events within the next 24 hours
 * for each user.
 * @param {Array} users - List of users to include in the PDF.
 * @return {Array} Array of {userId, pdfBuffer} objects to attach.
 */
async function generateEventsPDF(users) {
  const attachments = [];

  for (const user of users) {
    // eslint-disable-next-line new-cap
    const doc = new jsPDF();
    doc.text("Upcoming Events in the Next 24 Hours", 10, 10);

    const eventsSnapshot = await db
        .collection("events")
        .where("userId", "==", user.userId)
        .where("start", ">=", new Date())
        .where("start", "<=", new Date(Date.now() + 24 * 60 * 60 * 1000))
        .get();

    const events = eventsSnapshot.docs.map((eventDoc) => eventDoc.data());
    doc.autoTable({
      head: [["Event Title", "Description", "Date and Time"]],
      body: events.map((event) => [
        event.title,
        event.description,
        new Date(event.start.toDate()).toLocaleString("en-AU", {
          timeZone: "Australia/Sydney",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      ]),
    });
    const pdfBuffer = doc.output("arraybuffer");
    attachments.push({userId: user.userId, pdfBuffer});
  }
  return attachments;
}

/**
 * Helper function for Scenario 3: Get users whose medication end
 * date has already passed.
 * @return {Array} List of users who need to be notified.
 */
async function getUsersWithExpiredMedications() {
  const now = new Date();
  const usersSnapshot = await db.collection("users").get();
  const usersToNotify = [];

  for (const userDoc of usersSnapshot.docs) {
    const user = userDoc.data();
    if (!userDoc.id) continue;

    const medicationsSnapshot = await db.collection("medications")
        .where("userId", "==", userDoc.id)
        .where("endDate", "<=", now)
        .get();

    const medications = medicationsSnapshot.docs.map((medDoc) => {
      const medication = medDoc.data();
      return {
        name: medication.medication || "Unknown",
        dosage: medication.dosage || "N/A",
        frequency: medication.frequency || "N/A",
        startDate: medication.startDate ?
          medication.startDate.toDate().toLocaleDateString() : "N/A",
        endDate: medication.endDate ?
          medication.endDate.toDate().toLocaleDateString() : "N/A",
      };
    });

    if (medications.length > 0) {
      usersToNotify.push({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        medications,
        userId: userDoc.id,
      });
    }
  }
  return usersToNotify;
}

/**
 * Generates a PDF document of medications that have expired.
 * @param {Array} users - List of users to include in the PDF.
 * @return {Array} Array of {userId, pdfBuffer} objects to attach.
 */
async function generateMedicationsPDF(users) {
  const attachments = [];

  for (const user of users) {
    // eslint-disable-next-line new-cap
    const doc = new jsPDF();
    doc.text("Medications Past Their End Date", 10, 10);

    // Create table of medications for the specific user
    doc.autoTable({
      head: [["Medication Name", "Dosage", "Frequency", "Start Date",
        "End Date"]],
      body: user.medications.map((med) => [
        med.name,
        med.dosage,
        med.frequency,
        med.startDate instanceof Date ?
          dayjs(med.startDate).format("DD/MM/YYYY") :
          dayjs(med.startDate).format("DD/MM/YYYY"),
        med.endDate instanceof Date ?
          dayjs(med.endDate).format("DD/MM/YYYY") :
          dayjs(med.endDate).format("DD/MM/YYYY"),
      ]),
    });
    const pdfBuffer = doc.output("arraybuffer");
    attachments.push({userId: user.userId, pdfBuffer});
  }
  return attachments;
}

/**
 * Helper function: Send bulk emails to a list of users based on the
 * specified scenario.
 * @param {Array} users - List of users to send emails to.
 * @param {string} scenario - The email scenario.
 * @param {Array} attachmentData - Array of PDF buffers for attachments.
 */
async function sendBulkEmail(users, scenario, attachmentData) {
  const emails = users.map((user) => {
    let subject;
    let text;
    let html;

    // Extract name and end date from the first medication if it exists
    const firstMedication = user.medications &&
      user.medications.length > 0 ? user.medications[0] : {};
    const medicationName = firstMedication.name || "medication";
    const endDate = firstMedication.endDate ?
        dayjs(firstMedication.endDate, "MM/DD/YYYY").format("DD/MM/YYYY"):
        "an unknown date";

    // Customise message for each scenario
    if (scenario === "symptomTracker") {
      subject = `Reminder to update your Symptom Tracker`;
      text = `Dear ${user.name},\n\nIt looks like you haven't added any new
      entries in the Symptom Tracker for over a week. You can refer to the
      attached file for a record of your previous symptom entries. Please
      make sure to update it as needed.\n\nBest regards,\nMSA Hub Team`;
      html = `<p>Dear ${user.name},</p><p>It looks like you haven't added
      any new entries in the Symptom Tracker for over a week. You can refer
      to the attached file for a record of your previous symptom entries.
      Please make sure to update it as needed.</p><p>Best regards,<br/>MSA
      Hub Team</p>`;
    } else if (scenario === "upcomingEvent") {
      subject = `Upcoming Event Reminder`;
      text = `Dear ${user.name},\n\nThis is a reminder for your upcoming
      event: "${user.eventTitle}" scheduled at ${user.eventTime}. You can
      refer to the attached file for a list of events scheduled within the
      next 24 hours. Please don't forget!\n\nBest regards,\nMSA Hub Team`;
      html = `<p>Dear ${user.name},</p><p>This is a reminder for your
      upcoming event: <strong>${user.eventTitle}</strong> scheduled at
      ${user.eventTime}. You can refer to the attached file for a list of
      events scheduled within the next 24 hours. Please don't forget!</p>
      <p>Best regards,<br/>MSA Hub Team</p>`;
    } else if (scenario === "medicationEndDate") {
      subject = `Your medication period has ended`;
      text = `Dear ${user.name},\n\nThis is a reminder that your
      medication "${medicationName}" period has ended on
      ${endDate}. You can refer to the attached file for a list of
      medications with past end dates. Please consult your doctor if you
      need any further advice.\n\nBest regards,\nMSA Hub Team`;
      html = `<p>Dear ${user.name},</p><p>This is a reminder that your
      medication <strong>${medicationName}</strong> period has
      ended on ${endDate}. You can refer to the attached file for a
      list of medications with past end dates. Please consult your doctor
      if you need any further advice.</p><p>Best regards,<br/>MSA Hub Team
      </p>`;
    }

    const pdfData = attachmentData.find((data) => data.userId === user.userId);
    const pdfBuffer = pdfData ? pdfData.pdfBuffer : null;
    const attachment = pdfBuffer? {
      content: Buffer.from(pdfBuffer).toString("base64"),
      filename: `${scenario}.pdf`,
      type: "application/pdf",
      disposition: "attachment",
    }: null;

    return {
      to: user.email,
      from: "info@em94.msahub.life",
      subject,
      text,
      html,
      attachments: attachment ? [attachment] : [],
    };
  });

  // Send the emails in bulk using SendGrid
  await sgMail.send(emails);
}
