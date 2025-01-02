// utils/splitRecipients.js

/**
 * Splits an array into smaller chunks of specified size.
 * @param {Array} array - The array to split.
 * @param {number} chunkSize - The maximum size of each chunk.
 * @returns {Array[]} - An array of chunks.
 */
const splitArray = (array, chunkSize) => {
  const results = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    results.push(array.slice(i, i + chunkSize));
  }
  return results;
};

module.exports = splitArray;
