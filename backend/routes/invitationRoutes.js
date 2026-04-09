const express = require("express");
const router = express.Router();
const {
  inviteFreelancer,
  getMyInvitations,
  getProjectInvitations,
  respondToInvitation,
} = require("../controllers/invitationController");

const { protect } = require("../middleware/authMiddleware");
const { roleCheck } = require("../middleware/roleMiddleware");

// ── Employer Only ─────────────────────────────────────────────────
router.post(
  "/invite",
  protect,
  roleCheck("employer"),
  inviteFreelancer
);

router.get(
  "/project/:projectId",
  protect,
  roleCheck("employer"),
  getProjectInvitations
);

// ── Freelancer Only ───────────────────────────────────────────────
router.get(
  "/my-invitations",
  protect,
  roleCheck("freelancer"),
  getMyInvitations
);

router.put(
  "/:id/respond",
  protect,
  roleCheck("freelancer"),
  respondToInvitation
);

module.exports = router;
