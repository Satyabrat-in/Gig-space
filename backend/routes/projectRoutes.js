const express = require("express");
const router = express.Router();
const {
  createProject,
  getAllProjects,
  getProjectById,
  getMyProjects,
  updateProject,
  deleteProject,
  updateProjectStatus,
  getProjectsByCategory,
} = require("../controllers/projectController");

const { protect } = require("../middleware/authMiddleware");
const { roleCheck } = require("../middleware/roleMiddleware");

// ── Public Routes (no login needed) ──────────────────────────────
router.get("/all", getAllProjects);
router.get("/category/:category", getProjectsByCategory);
// router.get('/:id', getProjectById); moved to bottom

// ── Employer Only Routes ──────────────────────────────────────────
router.post(
  "/create",
  protect,
  roleCheck("employer"),      // only employer can post
  createProject
);

router.get(
  "/my-projects",
  protect,
  roleCheck("employer"),      // only employer sees their own projects
  getMyProjects
);

router.put(
  "/update/:id",
  protect,
  roleCheck("employer"),
  updateProject
);

router.put(
  "/status/:id",
  protect,
  roleCheck("employer"),
  updateProjectStatus
);

router.delete(
  "/delete/:id",
  protect,
  roleCheck("employer"),
  deleteProject
);

// ── Get Single Project (Must be at the bottom) ─────────────────
router.get("/:id", getProjectById);

module.exports = router;