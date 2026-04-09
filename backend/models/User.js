const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["freelancer", "employer", "admin"],
      default: "freelancer",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },

    // ---------- Freelancer Specific Fields ----------
    skills: {
      type: [String],   // e.g. ["React", "Node.js", "MongoDB"]
      default: [],
    },
    bio: {
      type: String,
      default: "",
    },
    portfolioLink: {
      type: String,
      default: "",
    },
    experience: {
      type: String,     // e.g. "2 years"
      default: "",
    },
    qualification: {
      type: String,
      default: "",
    },
    documentLink: {
      type: String,
      default: "",
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },

    // ---------- Employer Specific Fields ----------
    companyName: {
      type: String,
      default: "",
    },
    companyWebsite: {
      type: String,
      default: "",
    },

    // ---------- Common ----------
    profilePicture: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model("User", userSchema);