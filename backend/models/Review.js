const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    // ── References to existing modules ────────────────────────────
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",       // links to Project model
      required: true,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",          // who gave the review (employer)
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",          // who received the review (freelancer)
      required: true,
    },

    // ── Review Details ────────────────────────────────────────────
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      trim: true,
    },

    // ── Individual Rating Breakdown (optional but good for college) 
    communicationRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    qualityRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    timelinessRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── One review per project per employer ───────────────────────────
// Employer can only review once per project
reviewSchema.index(
  { project: 1, employer: 1 },
  { unique: true }
);

module.exports = mongoose.model("Review", reviewSchema);