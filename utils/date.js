function checkDateValid(dateString) {
   // Allow ISO 8601 format
   const date = new Date(dateString);

   // Check if the date is valid
   if (isNaN(date.getTime())) {
      return false;
   }
   return true;
}

function formatDateToYYYYMMDD(dateString) {
   const date = new Date(dateString);
   const year = date.getUTCFullYear();
   const month = String(date.getUTCMonth() + 1).padStart(2, '0');
   const day = String(date.getUTCDate()).padStart(2, '0');
   return `${year}-${month}-${day}`;
}

module.exports = {checkDateValid, formatDateToYYYYMMDD}