const express = require("express");
const router = express.Router();
const {
  fundEscrow,
  releasePayment,
  refundEscrow,
  raiseDispute,
  resolveDispute,
  getEscrowByProject,
  getMyEscrows,
} = require("../controllers/escrowController");

const { protect } = require("../middleware/authMiddleware");
const { roleCheck } = require("../middleware/roleMiddleware");

// ── Employer Only ─────────────────────────────────────────────────
router.post(
  "/fund",
  protect,
  roleCheck("employer"),          // only employer funds escrow
  fundEscrow
);

router.put(
  "/release/:projectId",
  protect,
  roleCheck("employer"),          // only employer releases payment
  releasePayment
);

router.put(
  "/refund/:projectId",
  protect,
  roleCheck("employer"),          // only employer requests refund
  refundEscrow
);

// ── Admin Only ────────────────────────────────────────────────────
router.put(
  "/resolve/:projectId",
  protect,
  roleCheck("admin"),             // only admin resolves dispute
  resolveDispute
);

// ── Both Employer & Freelancer ────────────────────────────────────
router.put(
  "/dispute/:projectId",
  protect,
  roleCheck("employer", "freelancer"),  // both can raise dispute
  raiseDispute
);

router.get(
  "/my-escrows",
  protect,
  roleCheck("employer", "freelancer"),  // both can see their escrows
  getMyEscrows
);

router.get(
  "/:projectId",
  protect,
  roleCheck("employer", "freelancer", "admin"),
  getEscrowByProject
);

module.exports = router;