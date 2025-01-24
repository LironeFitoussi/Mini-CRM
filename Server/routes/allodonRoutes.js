const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/unlimited", async (req, res) => {
  try {
    const response = await axios.get(
      "http://www.allodons.fr/api/data/les-enfants-de-rachi/donors?page=1&per_page=60000",
      {
        headers: {
          Authorization: `Bearer ${process.env.ALLODON_API_KEY}`,
        },
      }
    );
    res.json(response.data.donateurs.length);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
