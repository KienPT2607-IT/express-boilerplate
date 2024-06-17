

function formatDateToYYYYMMDD(dateString) {
   const date = new Date(dateString);
   const year = date.getUTCFullYear();
   const month = String(date.getUTCMonth() + 1).padStart(2, '0');
   const day = String(date.getUTCDate()).padStart(2, '0');
   return `${year}-${month}-${day}`;
}

module.exports = { formatDateToYYYYMMDD }