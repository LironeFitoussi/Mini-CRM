const express = require("express");
const router = express.Router();
const { unsubscribeEmail } = require("../controllers/unsubscribeController");
router.use(express.static("public"));

router.get("/email/:email", unsubscribeEmail);

module.exports = router;