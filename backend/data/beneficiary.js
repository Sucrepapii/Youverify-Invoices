const fs = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = path.join(__dirname, 'beneficiaries.json');

async function getBeneficiaries() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveBeneficiaries(beneficiaries) {
  await fs.writeFile(DATA_FILE, JSON.stringify(beneficiaries, null, 2));
}

async function getAll(userId) {
  const beneficiaries = await getBeneficiaries();
  return beneficiaries.filter(b => b.userId === userId);
}

async function create(userId, data) {
  const beneficiaries = await getBeneficiaries();
  const newBeneficiary = {
    id: uuidv4(),
    userId,
    ...data,
    createdAt: new Date().toISOString()
  };
  beneficiaries.push(newBeneficiary);
  await saveBeneficiaries(beneficiaries);
  return newBeneficiary;
}

async function remove(userId, id) {
  const beneficiaries = await getBeneficiaries();
  const filtered = beneficiaries.filter(b => b.id !== id || b.userId !== userId);
  await saveBeneficiaries(filtered);
}

module.exports = { getAll, create, remove };
