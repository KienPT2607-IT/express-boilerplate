require("dotenv").config();
const jwt = require("jsonwebtoken");
const redisClient = require("../services/RedisClientServices")

/**
 * This functions checks if the token is invalidated
 * @param {string} auth_token - The auth token given to user when logged in
 * @returns If the token is invalidated, if so returns along with a message
 */
async function checkTokenInvalidated(auth_token) {
	if (!redisClient.isReady) await redisClient.connect();
	const result = await redisClient.get(auth_token)
	if (result) return {
		success: true,
		message: "Token invalidated, authorization denied!",
	}
	return { success: false }
}

/**
 * This function verifies the auth token and return the payload if token verified
 * @param {string} auth_token - The auth token given to user when logged in
 * @returns The result if the token is verified. If so returns along with payload
 */
function checkTokenVerified(auth_token) {
	const tokenVerified = jwt.verify(auth_token, process.env.JWT_TOKEN_SECRET_KEY)
	if (!tokenVerified) return {
		success: false,
		message: "Token not verified, authorization denied!!",
	}
	return { success: true, token_payload: tokenVerified }
}

/**
 * This function check if token is authenticated to perform action
 * @returns The authenticate result
 */
const authenticateToken = async (req, res, next) => {
	const auth_token = req.header("auth_token")
	if (!auth_token) return res.status(403).json({
		success: false,
		message: "No auth token, authorization denied!",
	});
	try {
		// * Verify auth token
		const tokenVerifiedResult = checkTokenVerified(auth_token)
		if (!tokenVerifiedResult.success)
			return res.status(400).json(tokenVerifiedResult)

		// * Check if token is invalidated
		const checkInvalidatedResult = await checkTokenInvalidated(auth_token)
		if (checkInvalidatedResult.status) return res.status(400).json({
			success: false,
			message: checkInvalidatedResult.message,
		})
		req.auth_token = auth_token
		next()
	} catch (error) {
		console.log(error);
		if (error.name === 'TokenExpiredError') return res.status(400).json({
			success: false,
			message: "Token has expired, authorization denied!",
		});
		if (error.name === "JsonWebTokenError") return res.status(400).json({
			success: false,
			message: "Token authorization failed, authorization denied!",
		});
		return res.status(401).json({
			success: false,
			message: "Authorization failed, authorization denied!",
		});
	}
}

// TODO: NEED TO BE FIXED
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
		if (isVerified.role) return res.status(401).json({
			success: false,
			error: "Not authorized for this action, authorization denied!",
		});


		req._id = verified._id; // extract _id from token and assign to req._id
		next();
	} catch (error) {
		res.status(500).json({
			error: "Server error!",
		});
	}
};

const isStaff = (allowRoles) => async (req, res, next) => {
	const auth_token = req.header("auth_token");
	if (!auth_token) return res.status(401).json({
		success: false,
		message: "No auth token, authorization denied!",
	});
	try {
		// * Verify token
		const tokenVerifiedResult = checkTokenVerified(auth_token)
		if (!tokenVerifiedResult.success)
			return res.status(400).json(tokenVerifiedResult)

		// * Check if token is invalidated
		const checkInvalidatedResult = await checkTokenInvalidated(auth_token)
		if (checkInvalidatedResult.status) return res.status(400).json({
			success: false,
			message: checkInvalidatedResult.message,
		})

		// * Check if role is allowed
		if (!allowRoles.includes(tokenVerifiedResult.token_payload.role))
			return res.status(401).json({
				success: false,
				message: "Not authorized for this action, authorization denied!",
			});
		next()
	} catch (error) {
		if (error.name === 'TokenExpiredError') return res.status(401).json({
			success: false,
			message: "Token has expired, authorization denied!",
		});
		if (error.name === "JsonWebTokenError") return res.status(401).json({
			success: false,
			message: "Token authorization failed, authorization denied!",
		});
		return res.status(401).json({
			success: false,
			message: "Authorization failed, authorization denied!",
		})
	}
}


module.exports = { isCustomer, isStaff, authenticateToken };
