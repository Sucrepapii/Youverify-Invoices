const express = require('express');
const { getAll, create, remove } = require('../data/account');
const { checkAuth } = require('../util/auth');

const router = express.Router();

router.use(checkAuth);

router.get('/', async (req, res) => {
  try {
    const accounts = await getAll(req.auth.id);
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch accounts' });
  }
});

router.post('/', async (req, res) => {
  try {
    const newAccount = await create(req.auth.id, req.body);
    res.status(201).json(newAccount);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create account' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await remove(req.auth.id, req.params.id);
    res.json({ message: 'Account deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete account' });
  }
});

module.exports = router;
