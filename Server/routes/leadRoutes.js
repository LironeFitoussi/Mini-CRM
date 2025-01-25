// routes/leadRoutes.js
const express = require("express");
const {
  createLead,
  changeLeadStatus,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
  addDonator,
  updateDonatorStatus,
  removeDonator,
  setCallBackDate,
} = require("../controllers/leadController");

// Import authentication middleware if available
// const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes after this middleware
// router.use(protect);

router.route("/").post(createLead).get(getAllLeads);

router.route("/callback/:leadCardId").post(setCallBackDate);

router.route("/:id").get(getLeadById).put(updateLead).delete(deleteLead);

router.route("/:id/status").put(changeLeadStatus);

router.route("/:id/donors").post(addDonator);

router
  .route("/:id/donors/:donatorId")
  .put(updateDonatorStatus)
  .delete(removeDonator);

module.exports = router;
