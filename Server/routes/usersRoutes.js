const express = require('express');
const router = express.Router();

const { getAllUsers, getUserById, getUserByEmail, createUser, updateUserById, deleteUserById, deleteUsers } = require('../controllers/usersControllers');

router.get('/', getAllUsers);

router.get('/me', getUserByEmail);

router.get('/:id', getUserById);

router.delete('/', deleteUsers);

router.post('/', createUser);

router.put('/:id', updateUserById);

router.delete('/:id', deleteUserById);


module.exports = router;