const express = require("express");
const router = express.Router();
const {
  searchJobs,
  searchFreelancers,
  globalSearch,
  getSkillSuggestions,
  getCategoryStats,
  getRecommendedJobs,
} = require("../controllers/searchController");

const { protect } = require("../middleware/authMiddleware");
const { roleCheck } = require("../middleware/roleMiddleware");

// ── Public Routes (no login needed) ──────────────────────────────
router.get("/jobs",         searchJobs);           // search projects
router.get("/freelancers",  searchFreelancers);    // search freelancers
router.get("/all",          globalSearch);         // search everything
router.get("/skills",       getSkillSuggestions);  // autocomplete skills
router.get("/categories",   getCategoryStats);     // category stats

// ── Freelancer Only (login required) ─────────────────────────────
router.get(
  "/recommendations",
  protect,
  roleCheck("freelancer"),    // only freelancer gets job recommendations
  getRecommendedJobs
);

module.exports = router;