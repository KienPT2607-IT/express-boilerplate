require("dotenv").config();
const jwt = require("jsonwebtoken");
const connection = require("../services/db");

const isCustomer = async (req, res, next) => {
	try {
		const token = req.header("auth-token");
		if (!token) {
			return res.status(401).json({
				error: "No auth token, authorization denied!",
			});
		}

		const isVerified = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
		if (isVerified) {
			return res.status(401).json({
				error: "Token authorization failed, authorization denied!",
			});
		}

		// Run a query to extract roles from db then use the result to compare
		if (isVerified.role !== "Customer") {
			return res.status(401).json({
				error: "Not authorized for this action, authorization denied!",
			});
		}

		req._id = verified._id; // extract _id from token and assign to req._id
		req.role = verified.role; // extract role from token and assign to req.role
		next();
	} catch (error) {
		res.status(500).json({
			error: "Server error!",
		});
	}
};

module.exports = { isCustomer };
