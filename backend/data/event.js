const { v4: generateId } = require("uuid");
const { NotFoundError } = require("../util/errors");
const fs = require("fs");
const path = require("path");

const eventsFilePath = path.join(__dirname, "events.json");

// Helper function to read events from file
function readFromFile() {
  try {
    const fileData = fs.readFileSync(eventsFilePath, "utf8");
    return JSON.parse(fileData);
  } catch (error) {
    // If file doesn't exist or is empty, return empty array
    return [];
  }
}

// Helper function to write events to file
function writeToFile(events) {
  fs.writeFileSync(eventsFilePath, JSON.stringify(events, null, 2), "utf8");
}

async function getAll() {
  return readFromFile();
}

async function get(id) {
  const events = readFromFile();
  const event = events.find((event) => event.id === id);
  if (!event) {
    throw new NotFoundError("Could not find event for id " + id);
  }
  return event;
}

async function add(data) {
  const events = readFromFile();
  const event = { ...data, id: generateId() };
  events.push(event);
  writeToFile(events);
  return event;
}

async function replace(id, data) {
  const events = readFromFile();
  const index = events.findIndex((event) => event.id === id);
  if (index < 0) {
    throw new NotFoundError("Could not find event for id " + id);
  }
  events[index] = { ...data, id };
  writeToFile(events);
  return events[index];
}

async function remove(id) {
  const events = readFromFile();
  const index = events.findIndex((event) => event.id === id);
  if (index < 0) {
    throw new NotFoundError("Could not find event for id " + id);
  }
  events.splice(index, 1);
  writeToFile(events);
}

exports.getAll = getAll;
exports.get = get;
exports.add = add;
exports.replace = replace;
exports.remove = remove;
