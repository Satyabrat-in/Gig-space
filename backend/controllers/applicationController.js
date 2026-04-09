const Application = require("../models/Application");
const Project = require("../models/Project");
const User = require("../models/User");

// ─── APPLY TO PROJECT (Freelancer only) ───────────────────────────────────────
// POST /api/applications/apply
const applyToProject = async (req, res) => {
  try {
    const { projectId, coverLetter, bidAmount, estimatedDays } = req.body;

    // 1. Validate fields
    if (!projectId || !coverLetter || !bidAmount || !estimatedDays) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2. Check if project exists and is open
    const project = await Project.findById(projectId);
    if (!project || !project.isActive) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (project.status !== "open") {
      return res.status(400).json({
        message: `Cannot apply — project is already ${project.status}`,
      });
    }

    // 3. Employer cannot apply to their own project
    if (project.employer.toString() === req.user.id.toString()) {
      return res.status(403).json({
        message: "Employers cannot apply to their own projects",
      });
    }

    // 4. Check if freelancer already applied
    const existingApplication = await Application.findOne({
      project: projectId,
      freelancer: req.user.id,
    });
    if (existingApplication) {
      return res.status(400).json({
        message: "You have already applied to this project",
      });
    }

    // 5. Create application
    const application = await Application.create({
      project: projectId,
      freelancer: req.user.id,   // from authMiddleware
      coverLetter,
      bidAmount,
      estimatedDays,
    });

    // 6. Increment totalApplications count on the project
    await Project.findByIdAndUpdate(projectId, {
      $inc: { totalApplications: 1 },
    });

    // 7. Populate response
    await application.populate("project", "title budget deadline status");
    await application.populate("freelancer", "name email skills averageRating profilePicture");

    res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    // Handle duplicate key error (already applied)
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You have already applied to this project",
      });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── GET ALL APPLICATIONS FOR A PROJECT (Employer only) ──────────────────────
// GET /api/applications/project/:projectId
const getApplicationsByProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project || !project.isActive) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Only the employer who owns the project can see applications
    if (project.employer.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "Not authorized to view these applications",
      });
    }

    const applications = await Application.find({
      project: req.params.projectId,
    })
      .populate(
        "freelancer",
        "name email skills bio averageRating totalReviews portfolioLink profilePicture experience"
      )
      .populate("project", "title budget deadline")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: applications.length,
      applications,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── GET MY APPLICATIONS (Freelancer only) ────────────────────────────────────
// GET /api/applications/my-applications
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      freelancer: req.user.id,   // only this freelancer's applications
    })
      .populate(
        "project",
        "title description budget deadline status category employer"
      )
      .populate({
        path: "project",
        populate: {
          path: "employer",
          select: "name companyName profilePicture",  // nested populate
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: applications.length,
      applications,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── GET SINGLE APPLICATION ───────────────────────────────────────────────────
// GET /api/applications/:id
const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate("freelancer", "name email skills bio averageRating portfolioLink profilePicture")
      .populate("project", "title budget deadline status employer");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Only the freelancer who applied OR the employer of the project can view
    const isFreelancer = application.freelancer._id.toString() === req.user.id.toString();
    const isEmployer = application.project.employer.toString() === req.user.id.toString();

    if (!isFreelancer && !isEmployer) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json({ application });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── ACCEPT APPLICATION (Employer only) ───────────────────────────────────────
// PUT /api/applications/accept/:id
const acceptApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate("project");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Only project owner (employer) can accept
    if (application.project.employer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Cannot accept if project is not open
    if (application.project.status !== "open") {
      return res.status(400).json({
        message: `Project is already ${application.project.status}`,
      });
    }

    // Cannot accept if application is not pending
    if (application.status !== "pending") {
      return res.status(400).json({
        message: `Application is already ${application.status}`,
      });
    }

    // 1. Accept this application
    application.status = "accepted";
    await application.save();

    // 2. Assign freelancer to the project
    await Project.findByIdAndUpdate(application.project._id, {
      assignedFreelancer: application.freelancer,   // ref to User
      status: "in-progress",                         // project is now in progress
    });

    // 3. Reject all other pending applications for same project
    await Application.updateMany(
      {
        project: application.project._id,
        _id: { $ne: application._id },    // all except this one
        status: "pending",
      },
      {
        status: "rejected",
        rejectionNote: "Another freelancer was selected for this project",
      }
    );

    await application.populate("freelancer", "name email skills profilePicture");

    res.status(200).json({
      message: "Application accepted — project is now in progress",
      application,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── REJECT APPLICATION (Employer only) ───────────────────────────────────────
// PUT /api/applications/reject/:id
const rejectApplication = async (req, res) => {
  try {
    const { rejectionNote } = req.body;

    const application = await Application.findById(req.params.id)
      .populate("project", "employer status");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Only project employer can reject
    if (application.project.employer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (application.status !== "pending") {
      return res.status(400).json({
        message: `Application is already ${application.status}`,
      });
    }

    application.status = "rejected";
    application.rejectionNote = rejectionNote || "Not selected";
    await application.save();

    // Decrement totalApplications count on project
    await Project.findByIdAndUpdate(application.project._id, {
      $inc: { totalApplications: -1 },
    });

    res.status(200).json({
      message: "Application rejected",
      application,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── WITHDRAW APPLICATION (Freelancer only) ───────────────────────────────────
// PUT /api/applications/withdraw/:id
const withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate("project", "status employer");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Only the freelancer who applied can withdraw
    if (application.freelancer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Can only withdraw pending applications
    if (application.status !== "pending") {
      return res.status(400).json({
        message: `Cannot withdraw — application is already ${application.status}`,
      });
    }

    application.status = "withdrawn";
    await application.save();

    // Decrement totalApplications count on project
    await Project.findByIdAndUpdate(application.project._id, {
      $inc: { totalApplications: -1 },
    });

    res.status(200).json({
      message: "Application withdrawn successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  applyToProject,
  getApplicationsByProject,
  getMyApplications,
  getApplicationById,
  acceptApplication,
  rejectApplication,
  withdrawApplication,
};