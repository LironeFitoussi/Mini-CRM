// helpers/parseDonations.js
module.exports = function parseDonations(donationsString, donatorId) {
  // Helper function to parse a single line
  function parseDonationLine(line, donatorId) {
    // Example line format:
    // "DD-MM-YYYY : 36.00€ - Pourim - Collecte - Paiement en ligne"
    const regex =
      /^(\d{2}-\d{2}-\d{4}) : ([0-9]+(?:\.[0-9]{1,2}))€ - ([^-]+) - ([^-]+) - ([^-]+)$/;
    const match = line.trim().match(regex);

    if (!match) {
      return null;
    }

    const [, dateStr, amountStr, typeStr, notesStr, methodStr] = match;

    // Convert "DD-MM-YYYY" to Date object
    const [day, month, year] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    const amount = parseFloat(amountStr);

    return {
      donator_id: donatorId,
      amount: amount,
      currency: "EUR",
      type: typeStr.trim(),
      method: methodStr.trim(),
      date: date,
      notes: notesStr.trim(),
    };
  }

  // Split the multiline string into an array of lines
  const lines = donationsString.split("\n").filter((l) => l.trim() !== "");
  const donations = lines
    .map((line) => parseDonationLine(line, donatorId))
    .filter((d) => d !== null);

  return donations;
};
