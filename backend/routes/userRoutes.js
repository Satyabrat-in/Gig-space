const express = require("express");
const router = express.Router();
const {
  getMyProfile,
  getUserById,
  updateProfile,
  changePassword,
  getAllFreelancers,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.get("/freelancers", getAllFreelancers);

// Protected routes (login required)
router.get("/me", protect, getMyProfile);
router.put("/update", protect, updateProfile);
router.put("/change-password", protect, changePassword);

// Route with dynamic parameter (must be placed last)
router.get("/:id", getUserById);

module.exports = router;