const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      default: "You have been invited to apply to my project.",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate invitations for the same project/freelancer pair
invitationSchema.index({ project: 1, freelancer: 1 }, { unique: true });

module.exports = mongoose.model("Invitation", invitationSchema);
