const express = require('express');
const { add, get, update } = require('../data/user');
const { createJSONToken, isValidPassword, checkAuth } = require('../util/auth');
const { isValidEmail, isValidText } = require('../util/validation');

const router = express.Router();

router.post('/signup', async (req, res, next) => {
  const data = req.body;
  let errors = {};

  if (!isValidEmail(data.email)) {
    errors.email = 'Invalid email.';
  } else {
    try {
      const existingUser = await get(data.email);
      if (existingUser) {
        errors.email = 'Email exists already.';
      }
    } catch (error) {}
  }

  if (!isValidText(data.password, 6)) {
    errors.password = 'Invalid password. Must be at least 6 characters long.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      message: 'User signup failed due to validation errors.',
      errors,
    });
  }

  try {
    const createdUser = await add(data);
    const authToken = createJSONToken(createdUser.email);
    res
      .status(201)
      .json({ message: 'User created.', user: createdUser, token: authToken });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  let user;
  try {
    user = await get(email);
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed.' });
  }

  const pwIsValid = await isValidPassword(password, user.password);
  if (!pwIsValid) {
    return res.status(422).json({
      message: 'Invalid credentials.',
      errors: { credentials: 'Invalid email or password entered.' },
    });
  }

  const token = createJSONToken(email);
  res.json({ token });
});

router.get('/me', checkAuth, async (req, res, next) => {
  try {
    const user = await get(req.token.email);
    // Don't send password
    const { password, ...userProfile } = user;
    res.json(userProfile);
  } catch (error) {
    next(error);
  }
});

router.patch('/me', checkAuth, async (req, res, next) => {
  const data = req.body;
  try {
    const updatedUser = await update(req.token.email, data);
    res.json({ message: 'Profile updated.', user: updatedUser });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
