const { v4: generateId } = require("uuid");
const { NotFoundError } = require("../util/errors");

// In-memory storage for events (invoices)
let events = [];

async function getAll() {
  return events;
}

async function get(id) {
  const event = events.find((event) => event.id === id);
  if (!event) {
    throw new NotFoundError("Could not find event for id " + id);
  }
  return event;
}

async function add(data) {
  const event = { ...data, id: generateId() };
  events.push(event);
  return event;
}

async function replace(id, data) {
  const index = events.findIndex((event) => event.id === id);
  if (index < 0) {
    throw new NotFoundError("Could not find event for id " + id);
  }
  events[index] = { ...data, id };
  return events[index];
}

async function remove(id) {
  const index = events.findIndex((event) => event.id === id);
  if (index < 0) {
    throw new NotFoundError("Could not find event for id " + id);
  }
  events.splice(index, 1);
}

exports.getAll = getAll;
exports.get = get;
exports.add = add;
exports.replace = replace;
exports.remove = remove;
