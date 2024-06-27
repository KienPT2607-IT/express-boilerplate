require("dotenv").config();
const {
	validateNewProductInputs,
	addNewProduct,
	getProductsForCustomer,
	validateGetProductQueryParams,
	checkIdValid,
	getProductDetail,
} = require("../services/ProductServices");
const { removeUploadFile } = require("../utils/file_utils");
const { CUSTOMER_ROLE } = require("../utils/constants");
const { response } = require("express");

exports.addProduct = async (req, res) => {
	const { name, price, quantity, description } = req.body;
	let { category_ids } = req.body;
	try {
		// TODO: This is for test only, maybe need to remove later
		// ? The swagger sends ids in an array but those ids are treated as a single string
		if (
			Array.isArray(category_ids) &&
			category_ids.length === 1 &&
			typeof category_ids[0] === "string"
		) {
			category_ids = category_ids[0].split(",");
		}

		if (typeof category_ids === "string") {
			category_ids = category_ids.split(",");
		}

		// * Validate the data of the product to be inserted
		const validateResult = validateNewProductInputs(
			name,
			price,
			quantity,
			category_ids,
			description
		);
		if (!validateResult.success) {
			removeUploadFile(req.file.filename, "products");
			return res.status(400).json(validateResult);
		}
		// * Insert the product into db
		const addNewProductResult = await addNewProduct(
			name,
			price,
			quantity,
			description,
			req.file.filename,
			category_ids
		);

		// * If the product is unable to inserted, remove the image just uploaded
		if (!addNewProductResult.success) {
			removeUploadFile(req.file.filename, "products");
			return res.status(400).json(addNewProductResult);
		}
		return res.status(201).json(addNewProductResult);
	} catch (error) {
		removeUploadFile(req.file.filename, "products");
		res.status(500).json({
			success: false,
			message: "Database query error",
			error: error.message,
		});
	}
};

exports.getListProductsForCustomer = async (req, res) => {
	const { page, limit, sortBy, sortOrder, categoryId } = req.query;
	try {
		// * Check if all the query parameters are valid before start querying
		const validateResult = validateGetProductQueryParams(
			page, limit, sortBy, sortOrder, categoryId
		);
		if (!validateResult.success)
			return res.status(400).json(validateResult);

		const productQueryResult = await getProductsForCustomer(
			parseInt(page, 10),
			parseInt(limit, 10),
			sortBy,
			sortOrder,
			categoryId
		);
		if (!productQueryResult.success) {
			const statusCode = (productQueryResult.error) ? 500 : 404;
			return res.status(statusCode).json(productQueryResult);
		}
		return res.status(200).json(productQueryResult);
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Server error!",
			error: error.message,
		});
	}
};

exports.getProductDetail = async (req, res) => {
	try {
		const validationResult = checkIdValid(req.params.id)
		if (!validationResult.success) 
			return res.status(400).json(validationResult)

		const queryResult = await getProductDetail(req.params.id)
		if (!queryResult.success){
			const statusCode = (queryResult.error) ? 500 : 404
			return res.status(statusCode).json(queryResult)
		}
		return res.status(200).json(queryResult)
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Server error!",
			error: error.message,
		});
	}
}
