require("dotenv").config();
const jwt = require("jsonwebtoken");

const tokenSecretKey = process.env.JWT_TOKEN_SECRET_KEY

const isCustomer = async (req, res, next) => {
	try {
		const token = req.header("auth-token");
		if (!token)
			return res.status(401).json({
				success: false,
				error: "No auth token, authorization denied!",
			});
		const isVerified = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
		if (isVerified)
			return res.status(401).json({
				success: false,
				error: "Token authorization failed, authorization denied!",
			});

		// Run a query to extract roles from db then use the result to compare
		if (isVerified.role) {
			return res.status(401).json({
				success: false,
				error: "Not authorized for this action, authorization denied!",
			});
		}

		req._id = verified._id; // extract _id from token and assign to req._id
		next();
	} catch (error) {
		res.status(500).json({
			error: "Server error!",
		});
	}
};

const isStaff = (allowRole) => (req, res, next) => {
	const token = req.header("auth_token");
	if (!token)
		return res.status(401).json({
			success: false,
			message: "No auth token, authorization denied!",
		});
	const isVerified = jwt.verify(token, tokenSecretKey);
	if (!isVerified)
		return res.status(401).json({
			success: false,
			message: "Token authorization failed, authorization denied!",
		});

	if (allowRole !== isVerified.role) {
		return res.status(401).json({
			success: false,
			message: "Not authorized for this action, authorization denied!",
		});
	}
	next()
}


module.exports = { isCustomer, isStaff };
