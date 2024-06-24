
/**
 * This function converts the date in ISO 8601 string into string with YYYY-MM-DD format
 * @param {string} dateString - the date in ISO 8601 string format
 * @returns The YYYY-MM-DD date string format
 */
function formatDateToYYYYMMDD(dateString) {
   const date = new Date(dateString);
   const year = date.getUTCFullYear();
   const month = String(date.getUTCMonth() + 1).padStart(2, '0');
   const day = String(date.getUTCDate()).padStart(2, '0');
   return `${year}-${month}-${day}`;
}

module.exports = { formatDateToYYYYMMDD }