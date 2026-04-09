const express = require("express");
const router = express.Router();
const {
  applyToProject,
  getApplicationsByProject,
  getMyApplications,
  getApplicationById,
  acceptApplication,
  rejectApplication,
  withdrawApplication,
} = require("../controllers/applicationController");

const { protect } = require("../middleware/authMiddleware");
const { roleCheck } = require("../middleware/roleMiddleware");

// ── Freelancer Only ───────────────────────────────────────────────
router.post(
  "/apply",
  protect,
  roleCheck("freelancer"),        // only freelancer can apply
  applyToProject
);

router.get(
  "/my-applications",
  protect,
  roleCheck("freelancer"),        // freelancer sees their own applications
  getMyApplications
);

router.put(
  "/withdraw/:id",
  protect,
  roleCheck("freelancer"),        // only freelancer can withdraw
  withdrawApplication
);

// ── Employer Only ─────────────────────────────────────────────────
router.get(
  "/project/:projectId",
  protect,
  roleCheck("employer"),          // employer sees applications on their project
  getApplicationsByProject
);

router.put(
  "/accept/:id",
  protect,
  roleCheck("employer"),          // only employer can accept
  acceptApplication
);

router.put(
  "/reject/:id",
  protect,
  roleCheck("employer"),          // only employer can reject
  rejectApplication
);

// ── Both Freelancer & Employer ────────────────────────────────────
router.get(
  "/:id",
  protect,
  roleCheck("freelancer", "employer"),
  getApplicationById
);

module.exports = router;