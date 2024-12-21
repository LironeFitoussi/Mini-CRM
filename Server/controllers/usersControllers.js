const User = require("../models/User");

// Controller object
const UserController = {
  // Get all users
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find();
      res.status(200).json(users);
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occurred while retrieving users." });
    }
  },

  // Get a single user by ID
  getUserById: async (req, res) => {
    const { id } = req.params;
    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
      res.status(200).json(user);
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occurred while retrieving the user." });
    }
  },

  // Get a single user by email
  getUserByEmail: async (req, res) => {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }
    
    try {
      const user = await User
        .findOne({ email: email })
        .select("-__v -createdAt -updatedAt");
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
      res.status(200).json(user);
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occurred while retrieving the user." });
    }
  },
  
  // Create a new user
  createUser: async (req, res) => {
    const { fName, lName, email, role } = req.body;
    try {
      const newUser = new User({ fName, lName, email, role });
      await newUser.save();
      res.status(201).json(newUser);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ error: "Email already exists." });
      }
      res
        .status(500)
        .json({ error: "An error occurred while creating the user." });
    }
  },

  // Update a user by ID
  updateUserById: async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
      const updatedUser = await User.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      });
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found." });
      }
      res.status(200).json(updatedUser);
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occurred while updating the user." });
    }
  },

  // Delete a user by ID
  deleteUserById: async (req, res) => {
    const { id } = req.params;
    try {
      const deletedUser = await User.findByIdAndDelete(id);
      if (!deletedUser) {
        return res.status(404).json({ error: "User not found." });
      }
      res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occurred while deleting the user." });
    }
  },
};

module.exports = UserController;
