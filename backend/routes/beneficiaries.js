const express = require('express');
const router = express.Router();
const beneficiaryData = require('../data/beneficiary');
const { checkAuth } = require('../util/auth');

router.use(checkAuth);

// Get all beneficiaries for the user
router.get('/', async (req, res) => {
  try {
    const beneficiaries = await beneficiaryData.getAll(req.token.email);
    res.json(beneficiaries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching beneficiaries' });
  }
});

// Create a new beneficiary
router.post('/', async (req, res) => {
  try {
    const newBeneficiary = await beneficiaryData.create(req.token.email, req.body);
    res.status(201).json(newBeneficiary);
  } catch (error) {
    res.status(500).json({ message: 'Error creating beneficiary' });
  }
});

// Delete a beneficiary
router.delete('/:id', async (req, res) => {
  try {
    await beneficiaryData.remove(req.token.email, req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting beneficiary' });
  }
});

module.exports = router;
