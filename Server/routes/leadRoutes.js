// routes/leadRoutes.js
const express = require('express');
const {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
  addDonator,
  updateDonatorStatus,
  removeDonator,
} = require('../controllers/leadController');

// Import authentication middleware if available
// const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes after this middleware
// router.use(protect);

router.route('/')
  .post(createLead)
  .get(getAllLeads);

router.route('/:id')
  .get(getLeadById)
  .put(updateLead)
  .delete(deleteLead);

router.route('/:id/donators')
  .post(addDonator);

router.route('/:id/donators/:donatorId')
  .put(updateDonatorStatus)
  .delete(removeDonator);

module.exports = router;
