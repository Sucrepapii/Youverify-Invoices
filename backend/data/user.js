const { hash } = require("bcryptjs");
const { v4: generateId } = require("uuid");
const { NotFoundError } = require("../util/errors");

// In-memory storage for users
let users = [];

async function add(data) {
  const hashedPassword = await hash(data.password, 12);

  const user = {
    id: generateId(),
    email: data.email,
    password: hashedPassword,
  };

  users.push(user);
  return { id: user.id, email: user.email };
}

async function get(email) {
  const user = users.find((user) => user.email === email);
  if (!user) {
    throw new NotFoundError("Could not find user for email " + email);
  }
  return user;
}

exports.add = add;
exports.get = get;
