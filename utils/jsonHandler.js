const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data');

/**
 * Reads and parses a JSON file.
 * @param {string} fileName - The name of the JSON file in the 'data' directory.
 * @returns {object} The parsed JSON data.
 */
function readJSON(fileName) {
    const filePath = path.join(dataPath, fileName);
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * Writes data to a JSON file.
 * @param {string} fileName - The name of the JSON file in the 'data' directory.
 * @param {object} data - The data to write to the file.
 */
function writeJSON(fileName, data) {
    const filePath = path.join(dataPath, fileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
}

module.exports = {
    readJSON,
    writeJSON,
};
