const { v4: generateId } = require("uuid");
const { NotFoundError } = require("../util/errors");
const fs = require("fs");
const path = require("path");

const invoicesFilePath = path.join(__dirname, "invoices.json");

// Helper function to read invoices from file
function readFromFile() {
  try {
    if (!fs.existsSync(invoicesFilePath)) {
      return [];
    }
    const fileData = fs.readFileSync(invoicesFilePath, "utf8");
    return JSON.parse(fileData);
  } catch (error) {
    // If file doesn't exist or is empty, return empty array
    return [];
  }
}

// Helper function to write invoices to file
function writeToFile(invoices) {
  fs.writeFileSync(invoicesFilePath, JSON.stringify(invoices, null, 2), "utf8");
}

async function getAll() {
  return readFromFile();
}

async function get(id) {
  const invoices = readFromFile();
  const invoice = invoices.find((invoice) => invoice.id === id);
  if (!invoice) {
    throw new NotFoundError("Could not find invoice for id " + id);
  }
  return invoice;
}

async function add(data) {
  const invoices = readFromFile();
  // Generate a random invoice number if not provided
  const invoiceNumber = data.invoiceNumber || `INV-${Math.floor(1000 + Math.random() * 9000)}`;
  const invoice = { ...data, id: generateId(), invoiceNumber };
  invoices.push(invoice);
  writeToFile(invoices);
  return invoice;
}

async function replace(id, data) {
  const invoices = readFromFile();
  const index = invoices.findIndex((invoice) => invoice.id === id);
  if (index < 0) {
    throw new NotFoundError("Could not find invoice for id " + id);
  }
  invoices[index] = { ...data, id };
  writeToFile(invoices);
  return invoices[index];
}

async function remove(id) {
  const invoices = readFromFile();
  const index = invoices.findIndex((invoice) => invoice.id === id);
  if (index < 0) {
    throw new NotFoundError("Could not find invoice for id " + id);
  }
  invoices.splice(index, 1);
  writeToFile(invoices);
}

async function updateStatus(id, status) {
  const invoices = readFromFile();
  const index = invoices.findIndex((invoice) => invoice.id === id);
  if (index < 0) {
    throw new NotFoundError("Could not find invoice for id " + id);
  }
  invoices[index].status = status;
  writeToFile(invoices);
  return invoices[index];
}

exports.getAll = getAll;
exports.get = get;
exports.add = add;
exports.replace = replace;
exports.remove = remove;
exports.updateStatus = updateStatus;
