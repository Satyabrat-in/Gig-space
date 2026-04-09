const express = require("express");
const router = express.Router();
const {
  addReview,
  getFreelancerReviews,
  getReviewByProject,
  updateReview,
  deleteReview,
  getMyGivenReviews,
  getMyReceivedReviews,
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");
const { roleCheck } = require("../middleware/roleMiddleware");

// ── Public Routes (no login needed) ──────────────────────────────
router.get("/freelancer/:freelancerId", getFreelancerReviews);
router.get("/project/:projectId", getReviewByProject);

// ── Employer Only ─────────────────────────────────────────────────
router.post(
  "/add",
  protect,
  roleCheck("employer"),          // only employer can add review
  addReview
);

router.put(
  "/update/:id",
  protect,
  roleCheck("employer"),          // only employer can update their review
  updateReview
);

router.delete(
  "/delete/:id",
  protect,
  roleCheck("employer"),          // only employer can delete their review
  deleteReview
);

router.get(
  "/my-reviews",
  protect,
  roleCheck("employer"),          // employer sees reviews they gave
  getMyGivenReviews
);

// ── Freelancer Only ───────────────────────────────────────────────
router.get(
  "/received",
  protect,
  roleCheck("freelancer"),        // freelancer sees reviews they received
  getMyReceivedReviews
);

module.exports = router;