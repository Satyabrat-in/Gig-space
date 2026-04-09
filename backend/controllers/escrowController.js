const Escrow = require("../models/Escrow");
const Project = require("../models/Project");
const Application = require("../models/Application");
const User = require("../models/User");

// ─── FUND ESCROW (Employer only) ──────────────────────────────────────────────
// POST /api/escrow/fund
// Employer funds escrow after accepting a freelancer application
const fundEscrow = async (req, res) => {
  try {
    const { projectId, amount } = req.body;

    // 1. Validate fields
    if (!projectId || !amount) {
      return res.status(400).json({ message: "projectId and amount are required" });
    }

    // 2. Find project
    const project = await Project.findById(projectId);
    if (!project || !project.isActive) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 3. Only the employer of this project can fund
    if (project.employer.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "Only the project employer can fund escrow",
      });
    }

    // 4. Project must be in-progress to fund escrow
    // (means application was accepted and freelancer is assigned)
    if (project.status !== "in-progress") {
      return res.status(400).json({
        message: "Escrow can only be funded when project is in-progress",
      });
    }

    // 5. Check if freelancer is assigned
    if (!project.assignedFreelancer) {
      return res.status(400).json({
        message: "No freelancer assigned to this project yet",
      });
    }

    // 6. Check if escrow already exists for this project
    const existingEscrow = await Escrow.findOne({ project: projectId });
    if (existingEscrow) {
      return res.status(400).json({
        message: "Escrow already exists for this project",
      });
    }

    // 7. Create escrow with initial transaction log
    const escrow = await Escrow.create({
      project: projectId,
      employer: req.user.id,
      freelancer: project.assignedFreelancer,
      amount,
      status: "funded",
      transactions: [
        {
          action: "funded",
          performedBy: req.user.id,
          note: `Employer funded ₹${amount} for project`,
          date: new Date(),
        },
      ],
    });

    // 8. Populate response
    await escrow.populate("employer", "name email companyName profilePicture");
    await escrow.populate("freelancer", "name email skills profilePicture");
    await escrow.populate("project", "title budget deadline status");

    res.status(201).json({
      message: `Escrow funded with ₹${amount} successfully`,
      escrow,
    });
  } catch (error) {
    // Handle duplicate project error
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Escrow already exists for this project",
      });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── RELEASE PAYMENT (Employer only) ─────────────────────────────────────────
// PUT /api/escrow/release/:projectId
// Employer releases payment to freelancer after work is done
const releasePayment = async (req, res) => {
  try {
    const { note } = req.body;

    // 1. Find escrow by project id
    const escrow = await Escrow.findOne({
      project: req.params.projectId,
    }).populate("project", "employer status title");

    if (!escrow) {
      return res.status(404).json({ message: "Escrow not found for this project" });
    }

    // 2. Only employer can release payment
    if (escrow.employer.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "Only the employer can release payment",
      });
    }

    // 3. Escrow must be in funded state to release
    if (escrow.status !== "funded") {
      return res.status(400).json({
        message: `Cannot release — escrow is already ${escrow.status}`,
      });
    }

    // 4. Release payment — update escrow
    escrow.status = "released";
    escrow.releasedAt = new Date();
    escrow.transactions.push({
      action: "released",
      performedBy: req.user.id,
      note: note || "Payment released to freelancer",
      date: new Date(),
    });
    await escrow.save();

    // 5. Mark project as completed
    await Project.findByIdAndUpdate(req.params.projectId, {
      status: "completed",
    });

    // 6. Populate response
    await escrow.populate("employer", "name email companyName profilePicture");
    await escrow.populate("freelancer", "name email profilePicture");
    await escrow.populate("project", "title budget status");

    res.status(200).json({
      message: `Payment of ₹${escrow.amount} released to freelancer successfully`,
      escrow,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── REFUND ESCROW (Employer only) ────────────────────────────────────────────
// PUT /api/escrow/refund/:projectId
// Employer gets refund if project is cancelled
const refundEscrow = async (req, res) => {
  try {
    const { note } = req.body;

    const escrow = await Escrow.findOne({
      project: req.params.projectId,
    }).populate("project", "employer status title");

    if (!escrow) {
      return res.status(404).json({ message: "Escrow not found for this project" });
    }

    // Only employer can request refund
    if (escrow.employer.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "Only the employer can request a refund",
      });
    }

    // Can only refund funded escrow
    if (escrow.status !== "funded") {
      return res.status(400).json({
        message: `Cannot refund — escrow is already ${escrow.status}`,
      });
    }

    // Cannot refund if project is completed
    if (escrow.project.status === "completed") {
      return res.status(400).json({
        message: "Cannot refund a completed project",
      });
    }

    // Update escrow to refunded
    escrow.status = "refunded";
    escrow.refundedAt = new Date();
    escrow.transactions.push({
      action: "refunded",
      performedBy: req.user.id,
      note: note || "Escrow refunded to employer",
      date: new Date(),
    });
    await escrow.save();

    // Cancel the project
    await Project.findByIdAndUpdate(req.params.projectId, {
      status: "cancelled",
    });

    await escrow.populate("employer", "name email companyName profilePicture");
    await escrow.populate("freelancer", "name email profilePicture");
    await escrow.populate("project", "title status");

    res.status(200).json({
      message: `₹${escrow.amount} refunded to employer successfully`,
      escrow,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── RAISE DISPUTE (Both Employer & Freelancer) ───────────────────────────────
// PUT /api/escrow/dispute/:projectId
const raiseDispute = async (req, res) => {
  try {
    const { disputeReason } = req.body;

    if (!disputeReason) {
      return res.status(400).json({ message: "Dispute reason is required" });
    }

    const escrow = await Escrow.findOne({
      project: req.params.projectId,
    });

    if (!escrow) {
      return res.status(404).json({ message: "Escrow not found" });
    }

    // Only employer or freelancer of this project can raise dispute
    const isEmployer = escrow.employer.toString() === req.user.id.toString();
    const isFreelancer = escrow.freelancer.toString() === req.user.id.toString();

    if (!isEmployer && !isFreelancer) {
      return res.status(403).json({ message: "Not authorized to raise dispute" });
    }

    // Can only dispute funded escrow
    if (escrow.status !== "funded") {
      return res.status(400).json({
        message: `Cannot raise dispute — escrow is ${escrow.status}`,
      });
    }

    // Update escrow to disputed
    escrow.status = "disputed";
    escrow.disputeReason = disputeReason;
    escrow.disputeRaisedBy = req.user.id;
    escrow.transactions.push({
      action: "disputed",
      performedBy: req.user.id,
      note: disputeReason,
      date: new Date(),
    });
    await escrow.save();

    await escrow.populate("employer", "name email companyName");
    await escrow.populate("freelancer", "name email");
    await escrow.populate("project", "title status");
    await escrow.populate("disputeRaisedBy", "name role");

    res.status(200).json({
      message: "Dispute raised successfully. Admin will review.",
      escrow,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── RESOLVE DISPUTE (Admin only) ────────────────────────────────────────────
// PUT /api/escrow/resolve/:projectId
const resolveDispute = async (req, res) => {
  try {
    const { resolveIn, note } = req.body;
    // resolveIn = "employer" or "freelancer"

    if (!resolveIn || !["employer", "freelancer"].includes(resolveIn)) {
      return res.status(400).json({
        message: "resolveIn must be 'employer' or 'freelancer'",
      });
    }

    const escrow = await Escrow.findOne({
      project: req.params.projectId,
    });

    if (!escrow) {
      return res.status(404).json({ message: "Escrow not found" });
    }

    // Only admin can resolve
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can resolve disputes" });
    }

    if (escrow.status !== "disputed") {
      return res.status(400).json({
        message: "This escrow is not in disputed state",
      });
    }

    // Resolve based on admin decision
    if (resolveIn === "freelancer") {
      // Release to freelancer
      escrow.status = "released";
      escrow.releasedAt = new Date();
      await Project.findByIdAndUpdate(req.params.projectId, {
        status: "completed",
      });
    } else {
      // Refund to employer
      escrow.status = "refunded";
      escrow.refundedAt = new Date();
      await Project.findByIdAndUpdate(req.params.projectId, {
        status: "cancelled",
      });
    }

    escrow.transactions.push({
      action: "resolved",
      performedBy: req.user.id,
      note: note || `Dispute resolved in favor of ${resolveIn}`,
      date: new Date(),
    });
    await escrow.save();

    await escrow.populate("employer", "name email companyName");
    await escrow.populate("freelancer", "name email");
    await escrow.populate("project", "title status");

    res.status(200).json({
      message: `Dispute resolved in favor of ${resolveIn}`,
      escrow,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── GET ESCROW BY PROJECT (Employer & Freelancer) ────────────────────────────
// GET /api/escrow/:projectId
const getEscrowByProject = async (req, res) => {
  try {
    const escrow = await Escrow.findOne({
      project: req.params.projectId,
    })
      .populate("employer", "name email companyName profilePicture")
      .populate("freelancer", "name email skills profilePicture")
      .populate("project", "title budget deadline status category")
      .populate("transactions.performedBy", "name role")
      .populate("disputeRaisedBy", "name role");

    if (!escrow) {
      return res.status(404).json({ message: "Escrow not found for this project" });
    }

    // Only employer, freelancer, or admin can view
    const isEmployer  = escrow.employer._id.toString() === req.user.id.toString();
    const isFreelancer = escrow.freelancer._id.toString() === req.user.id.toString();
    const isAdmin     = req.user.role === "admin";

    if (!isEmployer && !isFreelancer && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to view this escrow" });
    }

    res.status(200).json({ escrow });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── GET MY ESCROWS (Employer or Freelancer) ──────────────────────────────────
// GET /api/escrow/my-escrows
const getMyEscrows = async (req, res) => {
  try {
    let query = {};

    // Filter based on role
    if (req.user.role === "employer") {
      query = { employer: req.user.id };
    } else if (req.user.role === "freelancer") {
      query = { freelancer: req.user.id };
    }

    const escrows = await Escrow.find(query)
      .populate("employer", "name companyName profilePicture")
      .populate("freelancer", "name profilePicture skills")
      .populate("project", "title budget status deadline")
      .sort({ createdAt: -1 });

    // Summary stats
    const totalFunded   = escrows.filter((e) => e.status === "funded").length;
    const totalReleased = escrows.filter((e) => e.status === "released").length;
    const totalRefunded = escrows.filter((e) => e.status === "refunded").length;
    const totalDisputed = escrows.filter((e) => e.status === "disputed").length;

    res.status(200).json({
      count: escrows.length,
      summary: { totalFunded, totalReleased, totalRefunded, totalDisputed },
      escrows,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  fundEscrow,
  releasePayment,
  refundEscrow,
  raiseDispute,
  resolveDispute,
  getEscrowByProject,
  getMyEscrows,
};