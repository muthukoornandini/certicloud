

const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    issueDate: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Valid"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Certificate = mongoose.model("Certificate", certificateSchema);

app.get("/", (req, res) => {
  res.send("CertiCloud backend is running!");
});

// Get all certificates
app.get("/api/certificates", async (req, res) => {
  try {
    const certificates = await Certificate.find().sort({ createdAt: -1 });
    res.json(certificates);
  } catch (error) {
    console.error("Load certificates error:", error);
    res.status(500).json({ message: "Could not load certificates." });
  }
});

// Add a certificate
app.post("/api/certificates", async (req, res) => {
  try {
    const { certificateId, studentName, courseName, issueDate } = req.body;

    const cleanId =
      typeof certificateId === "string" ? certificateId.trim() : "";
    const cleanName =
      typeof studentName === "string" ? studentName.trim() : "";
    const cleanCourse =
      typeof courseName === "string" ? courseName.trim() : "";
    const cleanDate = typeof issueDate === "string" ? issueDate.trim() : "";

    if (!cleanId || !cleanName || !cleanCourse || !cleanDate) {
      return res.status(400).json({
        message: "Please provide all certificate details.",
      });
    }

    // The frontend sends "Pending" or "Valid".
    // "Verified" is converted to "Valid" for database consistency.
    let status = req.body.status || "Pending";

    if (status === "Verified") {
      status = "Valid";
    }

    if (!["Pending", "Valid"].includes(status)) {
      return res.status(400).json({
        message: "Status must be Pending or Verified.",
      });
    }

    const certificate = await Certificate.create({
      certificateId: cleanId,
      studentName: cleanName,
      courseName: cleanCourse,
      issueDate: cleanDate,
      status,
    });

    res.status(201).json({
      message: "Certificate added successfully!",
      certificate,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This certificate ID already exists.",
      });
    }

    console.error("Add certificate error:", error);
    res.status(500).json({
      message: "Could not add certificate.",
    });
  }
});

// Delete a certificate using its MongoDB ID
app.delete("/api/certificates/:id", async (req, res) => {
  try {
    const id = req.params.id;

    console.log("DELETE requested ID:", id);

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid certificate record ID.",
      });
    }

    const certificate = await Certificate.findByIdAndDelete(id);

    if (!certificate) {
      return res.status(404).json({
        message: "Certificate not found.",
      });
    }

    res.json({
      message: "Certificate deleted successfully!",
    });
  } catch (error) {
    console.error("Delete certificate error:", error);
    res.status(500).json({
      message: "Could not delete certificate.",
    });
  }
});

// Verify a certificate by its certificate ID
app.post("/api/certificates/verify", async (req, res) => {
  try {
    const certificateId =
      typeof req.body.certificateId === "string"
        ? req.body.certificateId.trim()
        : "";

    if (!certificateId) {
      return res.status(400).json({
        valid: false,
        message: "Please enter a certificate ID.",
      });
    }

    const certificate = await Certificate.findOne({ certificateId });

    if (!certificate) {
      return res.status(404).json({
        valid: false,
        message: "Certificate not found.",
      });
    }

    const isValid = certificate.status === "Valid";

    res.json({
      valid: isValid,
      message: isValid
        ? "Certificate verified successfully!"
        : "This certificate is pending verification.",
      certificate,
    });
  } catch (error) {
    console.error("Verify certificate error:", error);
    res.status(500).json({
      valid: false,
      message: "Certificate verification failed.",
    });
  }
});

// Connect to MongoDB and start the server
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from the .env file.");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully!");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`CertiCloud backend running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
