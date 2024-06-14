exports.responseHandler = (httpCode, isSuccess, message, data, error) => {
   switch (httpCode) {
      case 200:
         return res.status(httpCode).json({
            success: isSuccess,
            message: message,
            data: data
         })
      case 201:
      case 400:
      case 404:
         return res.status(httpCode).json({
            success: isSuccess,
            message: message
         })
      case 500:
         return res.status(httpCode).json({
            success: isSuccess,
            message: message,
            error: error.message
         })
      default:
         return res.status(httpCode).json({
            success: isSuccess,
            message: message,
            error: error.message
         })
   }
}