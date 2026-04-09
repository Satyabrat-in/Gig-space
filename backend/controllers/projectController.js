const Project = require("../models/Project");
const User = require("../models/User");

// ─── CREATE PROJECT ───────────────────────────────────────────────────────────
// POST /api/projects/create
// Only EMPLOYER can create
const createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      budget,
      deadline,
      skillsRequired,
      category,
    } = req.body;

    // 1. Validate required fields
    if (!title || !description || !budget || !deadline) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    // 2. Create project with employer = logged in user
    const project = await Project.create({
      title,
      description,
      budget,
      deadline,
      skillsRequired: skillsRequired || [],
      category: category || "Other",
      employer: req.user.id,   // from authMiddleware (logged in employer)
    });

    // 3. Populate employer details in response
    await project.populate("employer", "name email companyName");

    res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── GET ALL PROJECTS (Public) ────────────────────────────────────────────────
// GET /api/projects/all
// Anyone can view open projects
const getAllProjects = async (req, res) => {
  try {
    // Only return active + open projects
    const projects = await Project.find({ isActive: true, status: "open" })
      .populate("employer", "name companyName profilePicture averageRating")
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json({
      count: projects.length,
      projects,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── GET SINGLE PROJECT ───────────────────────────────────────────────────────
// GET /api/projects/:id
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("employer", "name email companyName companyWebsite profilePicture")
      .populate("assignedFreelancer", "name email skills averageRating profilePicture");

    if (!project || !project.isActive) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({ project });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── GET MY POSTED PROJECTS (Employer only) ───────────────────────────────────
// GET /api/projects/my-projects
const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      employer: req.user.id,   // only this employer's projects
      isActive: true,
    })
      .populate("assignedFreelancer", "name email profilePicture averageRating")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: projects.length,
      projects,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── UPDATE PROJECT ───────────────────────────────────────────────────────────
// PUT /api/projects/update/:id
// Only the employer who created it can update
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project || !project.isActive) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check ownership — only the creator employer can update
    if (project.employer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this project" });
    }

    // Cannot update if already in-progress or completed
    if (project.status === "in-progress" || project.status === "completed") {
      return res.status(400).json({
        message: `Cannot update a project that is ${project.status}`,
      });
    }

    const {
      title,
      description,
      budget,
      deadline,
      skillsRequired,
      category,
    } = req.body;

    const updateFields = {};
    if (title)          updateFields.title = title;
    if (description)    updateFields.description = description;
    if (budget)         updateFields.budget = budget;
    if (deadline)       updateFields.deadline = deadline;
    if (skillsRequired) updateFields.skillsRequired = skillsRequired;
    if (category)       updateFields.category = category;

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate("employer", "name email companyName");

    res.status(200).json({
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── DELETE PROJECT (Soft Delete) ─────────────────────────────────────────────
// DELETE /api/projects/delete/:id
// Only the employer who created it can delete
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project || !project.isActive) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check ownership
    if (project.employer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this project" });
    }

    // Cannot delete if already in-progress
    if (project.status === "in-progress") {
      return res.status(400).json({
        message: "Cannot delete a project that is in-progress",
      });
    }

    // Soft delete — just set isActive to false
    project.isActive = false;
    project.status = "cancelled";
    await project.save();

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── UPDATE PROJECT STATUS ────────────────────────────────────────────────────
// PUT /api/projects/status/:id
// Employer can change status manually
const updateProjectStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["open", "in-progress", "completed", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const project = await Project.findById(req.params.id);

    if (!project || !project.isActive) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check ownership
    if (project.employer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    project.status = status;
    await project.save();

    res.status(200).json({
      message: `Project status updated to '${status}'`,
      project,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── GET PROJECTS BY CATEGORY (Public) ───────────────────────────────────────
// GET /api/projects/category/:category
const getProjectsByCategory = async (req, res) => {
  try {
    const projects = await Project.find({
      category: req.params.category,
      status: "open",
      isActive: true,
    })
      .populate("employer", "name companyName profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: projects.length,
      projects,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  getMyProjects,
  updateProject,
  deleteProject,
  updateProjectStatus,
  getProjectsByCategory,
};