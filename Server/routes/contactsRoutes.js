const express = require("express");
const Router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  bulkCreateContacts,
} = require("../controllers/contactsControllers");

Router.get("/", getAllContacts);

Router.get("/:id", getContactById);

Router.post("/", createContact);

Router.put("/:id", updateContact);

Router.delete("/:id", deleteContact);

// Router.post("/bulk-create", upload.single("file"), bulkCreateContacts);

module.exports = Router;
