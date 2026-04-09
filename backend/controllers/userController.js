const User = require("../models/User");

// ─── GET MY PROFILE ───────────────────────────────────────────────────────────
// GET /api/user/me
const getMyProfile = async (req, res) => {
  try {
    // req.user is set by authMiddleware
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── GET USER BY ID (Public) ──────────────────────────────────────────────────
// GET /api/user/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -isActive");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────
// PUT /api/user/update
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      bio,
      skills,
      portfolioLink,
      experience,
      companyName,
      companyWebsite,
      profilePicture,
      qualification,
      documentLink,
    } = req.body;

    // Build update object dynamically
    const updateFields = {};
    if (name)           updateFields.name = name;
    if (phone)          updateFields.phone = phone;
    if (bio)            updateFields.bio = bio;
    if (skills)         updateFields.skills = skills;         // array
    if (portfolioLink)  updateFields.portfolioLink = portfolioLink;
    if (experience)     updateFields.experience = experience;
    if (companyName)    updateFields.companyName = companyName;
    if (companyWebsite) updateFields.companyWebsite = companyWebsite;
    if (profilePicture) updateFields.profilePicture = profilePicture;
    if (qualification !== undefined) updateFields.qualification = qualification;
    if (documentLink !== undefined)  updateFields.documentLink = documentLink;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────
// PUT /api/user/change-password
const bcrypt = require("bcryptjs");

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Both passwords are required" });
    }

    const user = await User.findById(req.user.id);

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── GET ALL FREELANCERS (Public) ─────────────────────────────────────────────
// GET /api/user/freelancers
const getAllFreelancers = async (req, res) => {
  try {
    const freelancers = await User.find({ role: "freelancer", isActive: true })
      .select("-password")
      .sort({ averageRating: -1 }); // highest rated first

    res.status(200).json({
      count: freelancers.length,
      freelancers,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getMyProfile,
  getUserById,
  updateProfile,
  changePassword,
  getAllFreelancers,
};