const { PhoneNumberUtil, PhoneNumberFormat } = require('google-libphonenumber');
const phoneUtil = PhoneNumberUtil.getInstance();

// Regions to try after heuristics
const DEFAULT_REGIONS = ['IL', 'FR', 'US', 'GB', 'CA'];

// Israeli mobile pattern: 05 + [0,1,2,4,8] + 7 digits = 10 total
const ISRAELI_MOBILE_REGEX = /^05[01248]\d{7}$/;

function normalizePhoneNumber(rawNumber) {
  if (!rawNumber || typeof rawNumber !== 'string') return [null, null];

  let cleaned = rawNumber.replace(/[^0-9+]/g, '');

  // Convert leading "00" to "+"
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.slice(2);
  }

  let parsedNumber = null;

  // If the number already starts with '+', try parsing
  if (cleaned.startsWith('+')) {
    try {
      parsedNumber = phoneUtil.parse(cleaned);
      if (phoneUtil.isValidNumber(parsedNumber)) {
        return [
          phoneUtil.format(parsedNumber, PhoneNumberFormat.E164),
          phoneUtil.getRegionCodeForNumber(parsedNumber),
        ];
      }
    } catch (e) {
      // fallback to the default regions
    }
  }

  // Check Israeli pattern
  if (ISRAELI_MOBILE_REGEX.test(cleaned)) {
    try {
      const ilNumber = phoneUtil.parse(cleaned, 'IL');
      if (phoneUtil.isValidNumber(ilNumber)) {
        return [
          phoneUtil.format(ilNumber, PhoneNumberFormat.E164),
          'IL',
        ];
      }
    } catch (e) {
      // Continue to next checks
    }
  }

  // Check French mobile pattern
  if (cleaned.length === 10 && (cleaned.startsWith('06') || cleaned.startsWith('07'))) {
    try {
      const frNumber = phoneUtil.parse(cleaned, 'FR');
      if (phoneUtil.isValidNumber(frNumber)) {
        return [
          phoneUtil.format(frNumber, PhoneNumberFormat.E164),
          'FR',
        ];
      }
    } catch (e) {
      // Continue to default regions
    }
  }

  // Try default regions
  for (let region of DEFAULT_REGIONS) {
    try {
      const number = phoneUtil.parse(cleaned, region);
      if (phoneUtil.isValidNumber(number)) {
        return [
          phoneUtil.format(number, PhoneNumberFormat.E164),
          phoneUtil.getRegionCodeForNumber(number),
        ];
      }
    } catch (e) {
      // Try next region
    }
  }

  // Return cleaned number with null country if no valid match
  return [cleaned, null];
}

module.exports = normalizePhoneNumber;
