require("dotenv").config();
const jwt = require("jsonwebtoken");
const redisClient = require("../services/RedisClientServices")

const TOKEN_SECRET_KEY = process.env.JWT_TOKEN_SECRET_KEY

async function isTokenInvalidated(token) {
	if (!redisClient.isReady) await redisClient.connect();
	const result = await redisClient.get(token)
	if (result)
		return true
	return false
}

function verifyToken(token) {
	const verified = jwt.verify(auth_token, process.env.JWT_TOKEN_SECRET_KEY)
	return verified
}

const authenticateToken = async (req, res, next) => {
	const auth_token = req.header("auth_token")
	if (!auth_token)
		return res.status(403).json({
			success: false,
			message: "No auth token, authorization denied!",
		});
	try {
		const tokenVerified = jwt.verify(auth_token, process.env.JWT_TOKEN_SECRET_KEY)
		if (!tokenVerified)
			return res.status(400).json({
				success: false,
				message: "Token not verified, authorization denied!!",
			})
		const isTokenInvalid = await isTokenInvalidated(auth_token)
		if (isTokenInvalid) 
			return res.status(400).json({
				success: false,
				message: "Token invalidated, authorization denied!",
			})
		req.auth_token = auth_token
		next()
	} catch (error) {
		if (error.name === 'TokenExpiredError') 
			return res.status(400).json({
				success: false,
				message: "Token has expired, authorization denied!",
			});
		if (error.name === "JsonWebTokenError") 
			return res.status(400).json({
				success: false,
				message: "Token authorization failed, authorization denied!",
			});
		return res.status(401).json({
			success: false,
			message: "Authorization failed, authorization denied!",
		});
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
		const tokenVerified = verifyToken(token)
		if (!tokenVerified)
			return res.status(401).json({
				success: false,
				message: "Invalid not verified, authorization denied!",
			});

		if (allowRole !== tokenVerified.role) {
			return res.status(401).json({
				success: false,
				message: "Not authorized for this action, authorization denied!",
			});
		}
		next()
	}


	module.exports = { isCustomer, isStaff, authenticateToken };
