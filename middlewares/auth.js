require("dotenv").config();
const jwt = require("jsonwebtoken");
const redisClient = require("../services/RedisClientServices")

const TOKEN_SECRET_KEY = process.env.JWT_TOKEN_SECRET_KEY

async function isTokenInvalidated (token) {
	if (!redisClient.isReady)
		await redisClient.connect();
	const result = redisClient.get(token)
	if (result) 
		return true
	return false
}

const authenticateToken = async (req, res, next) => {
	const auth_token = req.header("auth_token")
	if (!auth_token)
		return res.status(403).json({
			success: false,
			message: "No auth token, authorization denied!",
		});
	try {
		jwt.verify(auth_token, TOKEN_SECRET_KEY)
		req.auth_token = auth_token
		if (isTokenInvalidated(auth_token)) {
			return res.status(400).json({
				success: false,
				message: "Token invalidated, authorization denied!",
			})
		}

		next()
	} catch (error) {
		if (error.name === 'TokenExpiredError') {
			return res.status(401).json({
				success: false,
				message: "Token has expired, authorization denied!",
			});
		} else {
			return res.status(401).json({
				success: false,
				message: "Token authorization failed, authorization denied!",
			});
		}
	}
}

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
	const isVerified = jwt.verify(token, TOKEN_SECRET_KEY);
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


module.exports = { isCustomer, isStaff, authenticateToken };
