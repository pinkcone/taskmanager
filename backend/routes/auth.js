const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const checkAdmin = require('../middleware/checkAdmin');
const User = require('../models/User');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post(
    '/register',
    [
        check('username', 'Username is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password } = req.body;

        try {
            let user = await User.findOne({ email });

            if (user) {
                return res.status(400).json({ msg: 'User already exists' });
            }

            user = new User({
                username,
                email,
                password
            });

            await user.save();

            const payload = {
                user: {
                    id: user.id,
                    role: user.role
                }
            };

            jwt.sign(
                payload,
                config.get('jwtSecret'),
                {
                    expiresIn: 360000
                },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
    '/login',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            const user = await User.findOne({ email });

            if (!user) {
                console.log('User not found');
                return res.status(400).json({ msg: 'Invalid credentials' });
            }

            console.log('User found:', user);

            const isMatch = await bcrypt.compare(password, user.password);

            console.log('Password match:', isMatch);

            if (!isMatch) {
                console.log('Password does not match');
                return res.status(400).json({ msg: 'Invalid credentials' });
            }

            const payload = {
                user: {
                    id: user.id,
                    role: user.role
                }
            };

            jwt.sign(
                payload,
                config.get('jwtSecret'),
                {
                    expiresIn: 360000
                },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token, username: user.username, role: user.role });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

// @route   PUT api/auth/change-password
// @desc    Change user password
// @access  Private
router.put(
    '/change-password',
    [
        auth,
        [
            check('oldPassword', 'Old password is required').exists(),
            check('newPassword', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { oldPassword, newPassword } = req.body;

        try {
            const user = await User.findById(req.user.id);

            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ msg: 'Incorrect old password' });
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);

            await user.save();

            res.json({ msg: 'Password changed successfully' });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

// @route   PUT api/auth/change-email
// @desc    Change user email
// @access  Private
router.put(
    '/change-email',
    [
        auth,
        check('newEmail', 'Please include a valid email').isEmail()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { newEmail } = req.body;

        try {
            let user = await User.findOne({ email: newEmail });
            if (user) {
                return res.status(400).json({ msg: 'Email already in use' });
            }

            user = await User.findById(req.user.id);
            user.email = newEmail;

            await user.save();

            res.json({ msg: 'Email changed successfully' });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

// @route   PUT api/auth/change-username
// @desc    Change user username
// @access  Private
router.put(
    '/change-username',
    [
        auth,
        check('newUsername', 'Username is required').not().isEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { newUsername } = req.body;

        try {
            const user = await User.findById(req.user.id);

            // Sprawdzenie, czy minął miesiąc od ostatniej zmiany nazwy użytkownika
            const oneMonth = 30 * 24 * 60 * 60 * 1000;
            const now = new Date();

            if (user.lastUsernameChange && now - user.lastUsernameChange < oneMonth) {
                return res.status(400).json({ msg: 'You can change your username only once a month' });
            }

            user.username = newUsername;
            user.lastUsernameChange = now;

            await user.save();

            res.json({ msg: 'Username changed successfully' });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

// @route   GET api/auth/users
// @desc    Get users by username or email
// @access  Private, Admin
router.get('/users', [auth, checkAdmin], async (req, res) => {
    const { query } = req.query;

    try {
        const users = await User.find({
            $or: [
                { username: new RegExp(query, 'i') },
                { email: new RegExp(query, 'i') }
            ]
        }).select('-password');

        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/auth/users/:id/role
// @desc    Update user role
// @access  Private, Admin
router.put('/users/:id/role', [auth, checkAdmin], async (req, res) => {
    const { role } = req.body;

    try {
        let user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.role = role;
        await user.save();

        res.json({ msg: 'User role updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;