const { hash } = require("bcryptjs");
const { v4: generateId } = require("uuid");
const { NotFoundError } = require("../util/errors");
const fs = require("fs");
const path = require("path");

const usersFilePath = path.join(__dirname, "users.json");

// Helper function to read users from file
function readFromFile() {
  try {
    const fileData = fs.readFileSync(usersFilePath, "utf8");
    return JSON.parse(fileData);
  } catch (error) {
    // If file doesn't exist or is empty, return empty array
    return [];
  }
}

// Helper function to write users to file
function writeToFile(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), "utf8");
}

async function add(data) {
  const users = readFromFile();
  const hashedPassword = await hash(data.password, 12);

  const user = {
    id: generateId(),
    email: data.email,
    password: hashedPassword,
  };

  users.push(user);
  writeToFile(users);
  return { id: user.id, email: user.email };
}

async function get(email) {
  const users = readFromFile();
  const user = users.find((user) => user.email === email);
  if (!user) {
    throw new NotFoundError("Could not find user for email " + email);
  }
  return user;
}

exports.add = add;
exports.get = get;
