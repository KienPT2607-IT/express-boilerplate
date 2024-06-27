require("dotenv").config();
const path = require("path");

const connection = require("../services/DBServices");
const { checkCategoryExists } = require("../services/CategoryServices");
const {
	checkNameValid,
	checkPriceValid,
	checkQuantityValid,
	checkDesValid,
	checkCategoryIdsValid,
	processCategories,
	checkPageNumberValid,
	checkProductLimitNumberValid,
	checkSortOptionValid,
	checkSortOrderValid,
} = require("../utils/product_utils");
const { checkIdValid } = require("../services/CategoryServices");
const { UPLOADS_BASE_PATH } = require("../utils/constants");
const { serverProductImagePaths } = require("../utils/file_utils");
const { type } = require("os");

/**
 * The function checks for the validation of the product details
 * right after when its data received
 * @param {string} name - The name of the product
 * @param {string} price - The price of th product
 * @param {string} quantity - The quantity of the product
 * @param {Array<string>} category_ids - The array of category ids
 * @param {string | undefined} description - The description of the product
 * @returns If the product details are valid, if not returns along with a message
 * representing which data is invalid
 */
function validateNewProductInputs(
	name,
	price,
	quantity,
	category_ids,
	description
) {
	if (!checkNameValid(name))
		return {
			success: false,
			message: "Invalid product name!",
		};
	if (!checkPriceValid(price))
		return {
			success: false,
			message: "Invalid product price!",
		};
	if (!checkQuantityValid(quantity))
		return {
			success: false,
			message: "Invalid product quantity!",
		};
	if (!checkDesValid(description))
		return {
			success: false,
			message: "Invalid product description!",
		};
	if (!checkCategoryIdsValid(category_ids))
		return {
			success: false,
			message: "Invalid product category ids!",
		};
	return { success: true };
}

/**
 *
 * @param {string} name - The name for product
 * @param {string | number} price - The price for product, it can be string or number but must be in unsigned integer or float
 * @param {number} quantity - The quantity for the product
 * @param {Array<string | number>} category_ids - The array ids of category where product belongs to
 * @param {string} description - The description for the product
 * @param {string} image_path - the image name of the product
 * @returns If the product is inserted successfully. If so, returns along with its id,
 * otherwise, returns the message or/and error
 */
async function addNewProduct(
	name,
	price,
	quantity,
	description,
	image_path,
	category_ids
) {
	try {
		// * Start the transaction
		await connection.beginTransaction();

		// * Execute query to insert product
		const [insertProductResult] = await connection.query(
			`INSERT INTO products (name, price, quantity, quantity_in_stock, description, image_path) 
         VALUES (?, ?, ?, ?, ?, ?)`,
			[name, price, quantity, quantity, description, image_path]
		);

		const productId = insertProductResult.insertId;

		const productCategoriesValues = category_ids.map((category_id) => [
			productId,
			category_id,
		]);
		console.log(productCategoriesValues);
		await connection.query(
			`INSERT INTO product_categories (product_id, category_id) VALUES ?`,
			[productCategoriesValues]
		);

		await connection.commit();
		return {
			success: true,
			product_id: productId,
			message: "Product inserted successfully!",
		};
	} catch (error) {
		await connection.rollback();
		if (error.name === "ER_DUP_ENTRY")
			return {
				success: false,
				message: "Duplicate product name!",
				error: error.message,
			};
		if (error.name === "ER_SIGNAL_EXCEPTION")
			return {
				success: false,
				message: "A category is inactive!",
				error: error.message,
			};
		console.log(error);
		return {
			success: false,
			message: "Error inserting product and categories!",
			error: error.message,
		};
	}
}

/**
 * This function retrieves products from DB and return to customer 
 * @param {number} page - This is the current page number to get data
 * @param {number} limit - The maximum number of products shown in each page
 * @param {string} sortBy - The column name to be sorted
 * @param {string} sortOrder - The sort order 
 * @param {number | string} categoryId - The id of category which is filtered
 * @returns The list of products and along with additional information
 */
async function getProductsForCustomer(
	page = 1,
	limit = 15,
	sortBy,
	sortOrder,
	categoryId
) {
	/* 
	* Count the offset to find where to start returning data
	* -> Check the sort order
	* -> Check if the column will be sorted is allowed 
	*/
	const offset = (page - 1) * limit;
	sortOrder = sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC";
	const allowedSortColumns = ["name", "price", "like_count", "create_at",];
	if (!allowedSortColumns.includes(sortBy))
		sortBy = "create_at";
	try {
		if (!categoryId) {
			return await getProductsForCustomerNoFilter(limit, sortBy, sortOrder, offset);
		}
		return await getProductsForCustomerWithFilter(limit, sortBy, sortOrder, categoryId, offset);
	} catch (error) {
		return {
			success: true,
			message: "Get products failed!",
			error: error.message,
		};
	}
}

/**
 * This function retrieves products from DB
 * @param {number} page - This is the current page number to get data
 * @param {number} limit - The maximum number of products shown in each page
 * @param {string} sortBy - The column name to be sorted
 * @param {string} sortOrder - The sort order 
 * @returns The list of products and along with additional information
 */
async function getProductsForCustomerNoFilter(
	limit,
	sortBy,
	sortOrder,
	offset
) {
	try {
		let [queryResults] = await connection.query(
			`SELECT 
				p.id,
				p.name, 
				price, 
				quantity, 
				like_count, 
				dislike_count, 
				GROUP_CONCAT(CONCAT(c.id, ':', c.name) SEPARATOR ',') as categories,
				image_path
			FROM products AS p
			INNER JOIN product_categories AS pc ON pc.product_id = p.id
			INNER JOIN categories AS c ON pc.category_id = c.id
			WHERE p.is_active = 1
			GROUP BY p.id
			ORDER BY p.${sortBy} ${sortOrder}
			LIMIT ?
			OFFSET ?`,
			[limit, offset]
		);
		if (!queryResults) return {
			success: false,
			message: "No products found!",
			totalItems: 0,
			totalPages: 0
		};

		const [countResults] = await connection.query(
			`SELECT COUNT(*) AS count 
			FROM products
			WHERE is_active = 1`
		);
		const totalItems = countResults[0].count;
		const totalPages = Math.ceil(totalItems / limit);

		queryResults = serverProductImagePaths(queryResults);
		queryResults = processCategories(queryResults);
		return {
			success: true,
			message: `Found: ${queryResults.length} products`,
			total_items: totalItems,
			total_pages: totalPages,
			data: queryResults,
		};
	} catch (error) {
		return {
			success: true,
			message: "Get products failed!",
			error: error.message,
		};
	}
}

/**
 * This function retrieves products from DB
 * @param {number} page - This is the current page number to get data
 * @param {number} limit - The maximum number of products shown in each page
 * @param {string} sortBy - The column name to be sorted
 * @param {string} sortOrder - The sort order 
 * @param {number | string} categoryId - The id of category which is filtered
 * @returns The list of products and along with additional information
 */
async function getProductsForCustomerWithFilter(
	limit,
	sortBy,
	sortOrder,
	categoryId,
	offset
) {
	try {
		// * Check if category is available for filtering products
		const isCategoryAvailable = await checkCategoryExists(categoryId);
		if (!isCategoryAvailable.success) return isCategoryAvailable;
		let [queryResults] = await connection.query(
			`SELECT 
				p.id,
				p.name, 
				price, 
				quantity, 
				like_count, 
				dislike_count, 
				GROUP_CONCAT(c.id, ':', c.name) as categories,
				image_path
			FROM products AS p
			INNER JOIN product_categories AS pc ON pc.product_id = p.id
			INNER JOIN categories AS c ON pc.category_id = c.id
			WHERE p.is_active = 1 AND c.id = ?
			GROUP BY p.id
			ORDER BY p.${sortBy} ${sortOrder}
			LIMIT ?
			OFFSET ?`,
			[categoryId, limit, offset]
		);
		if (queryResults.length === 0) return {
			success: false,
			message: "No products found!",
			totalItems: 0,
			totalPages: 0
		};

		const [countResults] = await connection.query(
			`SELECT COUNT(*) AS count 
			FROM products as p
			INNER JOIN product_categories AS pc ON pc.product_id = p.id
			WHERE p.is_active = 1 AND pc.category_id = ?`,
			[categoryId]
		);
		const totalItems = countResults[0].count;
		const totalPages = Math.ceil(totalItems / limit);

		queryResults = serverProductImagePaths(queryResults);
		queryResults = processCategories(queryResults);
		return {
			success: true,
			message: `Found: ${queryResults.length} products`,
			total_items: totalItems,
			total_pages: totalPages,
			data: queryResults,
		};
	} catch (error) {
		return {
			success: true,
			message: "Get products failed!",
			error: error.message,
		};
	}
}

/**
 * 
 * @param {string} page - This is the current page number to get data
 * @param {string} limit 
 * @param {string | undefined} sortBy 
 * @param {string | undefined} sortOrder 
 * @param {string | undefined} categoryId 
 */
function validateGetProductQueryParams(page, limit, sortBy, sortOrder, categoryId) {
	let validationResult = checkPageNumberValid(page);
	if (!validationResult.success)
		return validationResult;

	validationResult = checkProductLimitNumberValid(limit);
	if (!validationResult.success)
		return validationResult;

	validationResult = checkSortOptionValid(sortBy);
	if (!validationResult.success)
		return validationResult;

	validationResult = checkSortOrderValid(sortOrder);
	if (!validationResult.success)
		return validationResult;

	if (typeof categoryId !== "undefined" && categoryId.trim().length != 0) {
		validationResult = checkIdValid(categoryId);
		if (!validationResult.success)
			return validationResult;
	}
	return { success: true };
}
module.exports = {
	validateNewProductInputs,
	addNewProduct,
	getProductsForCustomer,
	validateGetProductQueryParams,
};
