const mongoose = require("mongoose");

const escrowSchema = new mongoose.Schema(
  {
    // ── References to existing modules ────────────────────────────
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",         // links to Project model
      required: true,
      unique: true,           // one escrow per project only
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",            // who deposited the money
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",            // who will receive the money
      required: true,
    },

    // ── Payment Details ───────────────────────────────────────────
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: 1,
    },
    currency: {
      type: String,
      default: "INR",         // Indian Rupees (college project in India)
    },

    // ── Status Flow ───────────────────────────────────────────────
    // funded → work starts
    // released → freelancer gets paid
    // refunded → employer gets money back
    // disputed → conflict raised
    status: {
      type: String,
      enum: [
        "funded",     // employer deposited money, work can start
        "released",   // employer released payment to freelancer
        "refunded",   // money returned to employer (cancelled)
        "disputed",   // conflict between employer and freelancer
      ],
      default: "funded",
    },

    // ── Transaction History (every action logged) ─────────────────
    transactions: [
      {
        action: {
          type: String,
          enum: ["funded", "released", "refunded", "disputed", "resolved"],
        },
        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        note: {
          type: String,
          default: "",
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ── Dispute Details ───────────────────────────────────────────
    disputeReason: {
      type: String,
      default: "",
    },
    disputeRaisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ── Release Details ───────────────────────────────────────────
    releasedAt: {
      type: Date,
      default: null,
    },
    refundedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Escrow", escrowSchema);