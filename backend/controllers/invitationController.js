const Invitation = require("../models/Invitation");
const Project = require("../models/Project");
const User = require("../models/User");

// ─── INVITE FREELANCER (Employer Only) ─────────────────────────────────────────
// POST /api/invitations/invite
const inviteFreelancer = async (req, res) => {
  try {
    const { projectId, freelancerId, message } = req.body;

    if (!projectId || !freelancerId) {
      return res.status(400).json({ message: "projectId and freelancerId are required" });
    }

    // Validate project
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Only project employer can invite
    if (project.employer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized to invite for this project" });
    }

    // Project must be active and open
    if (!project.isActive || project.status !== "open") {
      return res.status(400).json({ message: "Cannot invite to closed or inactive projects" });
    }

    // Validate freelancer
    const freelancer = await User.findById(freelancerId);
    if (!freelancer || freelancer.role !== "freelancer") {
      return res.status(404).json({ message: "Freelancer not found or invalid role" });
    }

    // Check if duplicate
    const existingInvite = await Invitation.findOne({ project: projectId, freelancer: freelancerId });
    if (existingInvite) {
      return res.status(400).json({ message: "Freelancer has already been invited to this project" });
    }

    const invitation = await Invitation.create({
      project: projectId,
      employer: req.user.id,
      freelancer: freelancerId,
      message: message || "You have been invited to apply to my project. Please check the project details and submit your application.",
    });

    await invitation.populate("freelancer", "name email");
    await invitation.populate("project", "title");

    res.status(201).json({ 
      message: "Invitation sent successfully", 
      invitation 
    });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: "Invitation already exists" });
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── GET MY INVITATIONS (Freelancer Only) ──────────────────────────────────────
// GET /api/invitations/my-invitations
const getMyInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find({ freelancer: req.user.id })
      .populate("project", "title budget deadline status")
      .populate("employer", "name companyName profilePicture")
      .sort({ createdAt: -1 });
    
    res.status(200).json({ 
      count: invitations.length, 
      invitations 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── GET PROJECT INVITATIONS (Employer Only) ───────────────────────────────────
// GET /api/invitations/project/:projectId
const getProjectInvitations = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.employer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized to view invitations for this project" });
    }

    const invitations = await Invitation.find({ project: req.params.projectId })
      .populate("freelancer", "name email profilePicture skills bio")
      .sort({ createdAt: -1 });

    res.status(200).json({ count: invitations.length, invitations });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── RESPOND TO INVITATION (Freelancer Only) ──────────────────────────────────
// PUT /api/invitations/:id/respond
const respondToInvitation = async (req, res) => {
  try {
    const { status } = req.body; // Expects "accepted" or "declined"
    
    if (!["accepted", "declined"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be accepted or declined." });
    }

    const invitation = await Invitation.findById(req.params.id);
    if (!invitation) return res.status(404).json({ message: "Invitation not found" });

    // Validate owner
    if (invitation.freelancer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized to respond to this invitation" });
    }

    invitation.status = status;
    await invitation.save();

    res.status(200).json({ 
      message: `Invitation ${status} successfully. ${status === 'accepted' ? 'You can now apply to the project.' : ''}`, 
      invitation 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  inviteFreelancer,
  getMyInvitations,
  getProjectInvitations,
  respondToInvitation,
};
