const fs = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = path.join(__dirname, 'accounts.json');

async function getAccounts() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveAccounts(accounts) {
  await fs.writeFile(DATA_FILE, JSON.stringify(accounts, null, 2));
}

async function getAll(userId) {
  const accounts = await getAccounts();
  return accounts.filter(a => a.userId === userId);
}

async function create(userId, data) {
  const accounts = await getAccounts();
  const newAccount = {
    id: uuidv4(),
    userId,
    ...data,
    createdAt: new Date().toISOString()
  };
  accounts.push(newAccount);
  await saveAccounts(accounts);
  return newAccount;
}

async function remove(userId, id) {
  const accounts = await getAccounts();
  const filtered = accounts.filter(a => a.id !== id || a.userId !== userId);
  await saveAccounts(filtered);
}

module.exports = { getAll, create, remove };
