const express = require('express');
const router = express.Router();
const {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  adminCreateUser,
  toggleUserStatus,
  deleteUser
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', authUser);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Admin User Management Routes
router.route('/users')
  .get(protect, adminOnly, getAllUsers)
  .post(protect, adminOnly, adminCreateUser);

router.route('/users/:id')
  .delete(protect, adminOnly, deleteUser);

router.route('/users/:id/status')
  .put(protect, adminOnly, toggleUserStatus);

module.exports = router;
