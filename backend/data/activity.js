const { v4: generateId } = require("uuid");
const fs = require("fs");
const path = require("path");

const activitiesFilePath = path.join(__dirname, "activities.json");

// Helper function to read activities from file
function readFromFile() {
  try {
    if (!fs.existsSync(activitiesFilePath)) {
      return [];
    }
    const fileData = fs.readFileSync(activitiesFilePath, "utf8");
    return JSON.parse(fileData);
  } catch (error) {
    return [];
  }
}

// Helper function to write activities to file
function writeToFile(activities) {
  fs.writeFileSync(activitiesFilePath, JSON.stringify(activities, null, 2), "utf8");
}

async function getAll() {
  return readFromFile().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

async function add(data) {
  const activities = readFromFile();
  const activity = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    ...data
  };
  activities.push(activity);
  
  // Keep only the last 50 activities
  const limitedActivities = activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 50);
  
  writeToFile(limitedActivities);
  return activity;
}

exports.getAll = getAll;
exports.add = add;
