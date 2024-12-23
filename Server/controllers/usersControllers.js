const User = require("../models/User");

// Controller object
const UserController = {
  // Get all users with pagination and search
  getAllUsers: async (req, res) => {
    const { page = 1, limit = 10, search = "" } = req.query;
    const query = search ? { $or: [{ fName: new RegExp(search, "i") }, { lName: new RegExp(search, "i") }, { email: new RegExp(search, "i") }] } : {};
    
    try {
      const users = await User.find(query)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
      const totalUsers = await User.countDocuments(query);
      
      res.status(200).json({
        users,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: parseInt(page),
      });
    } catch (error) {
      console.error(error);
      
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
    console.log(req.body);
    
    if (!fName || !lName || !email || !role) {
      return res
        .status(400)
        .json({ error: "First name, last name, email, and role are required." });
    }

    try {
      // Check if the email already exists
      const existingUser = await User.findOne({
        email: email,
      });
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists." });
      }
      
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

  // Delete multiple users by ID
  deleteUsers: async (req, res) => {    
    const { ids } = req.body;
    if (!ids || !ids.length) {
      return res.status(400).json({ error: "User IDs are required." });
    }
    try {
      const deletedUsers = await User.deleteMany({ _id: { $in: ids } });
      if (!deletedUsers.deletedCount) {
        return res.status(404).json({ error: "Users not found." });
      }
      res.status(200).json({ message: "Users deleted successfully." });
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occurred while deleting the users." });
    }
  },
};

module.exports = UserController;
