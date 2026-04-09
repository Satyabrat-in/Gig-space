const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
    },
    budget: {
      type: Number,
      required: [true, "Budget is required"],
      min: 0,
    },
    deadline: {
      type: Date,
      required: [true, "Deadline is required"],
    },
    skillsRequired: {
      type: [String],   // e.g. ["React", "Node.js"]
      default: [],
    },
    category: {
      type: String,
      enum: [
        "Web Development",
        "Mobile Development",
        "UI/UX Design",
        "Data Science",
        "Content Writing",
        "Digital Marketing",
        "Other",
      ],
      default: "Other",
    },

    // ── Reference to User (Employer) ──────────────────────────────
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",          // links to User model
      required: true,
    },

    // ── Reference to assigned Freelancer (after acceptance) ───────
    assignedFreelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",          // links to User model
      default: null,
    },

    status: {
      type: String,
      enum: [
        "open",        // just posted, accepting applications
        "in-progress", // freelancer assigned, work ongoing
        "completed",   // work done
        "cancelled",   // employer cancelled
      ],
      default: "open",
    },

    totalApplications: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Index for faster search ────────────────────────────────────────
projectSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Project", projectSchema);