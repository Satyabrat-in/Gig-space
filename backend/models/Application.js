const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    // ── References to existing modules ────────────────────────────
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",         // links to Project model
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",            // links to User model
      required: true,
    },

    // ── Application Details ───────────────────────────────────────
    coverLetter: {
      type: String,
      required: [true, "Cover letter is required"],
      trim: true,
    },
    bidAmount: {
      type: Number,           // freelancer proposes their price
      required: [true, "Bid amount is required"],
      min: 0,
    },
    estimatedDays: {
      type: Number,           // how many days to complete
      required: [true, "Estimated days is required"],
      min: 1,
    },

    // ── Status ────────────────────────────────────────────────────
    status: {
      type: String,
      enum: [
        "pending",    // just applied, waiting for employer
        "accepted",   // employer accepted this freelancer
        "rejected",   // employer rejected
        "withdrawn",  // freelancer withdrew their application
      ],
      default: "pending",
    },

    // ── Employer's feedback on rejection (optional) ───────────────
    rejectionNote: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// ── Prevent duplicate applications ────────────────────────────────
// One freelancer can only apply once per project
applicationSchema.index(
  { project: 1, freelancer: 1 },
  { unique: true }
);

module.exports = mongoose.model("Application", applicationSchema);