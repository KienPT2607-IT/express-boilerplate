require("dotenv").config();

const connection = require("../services/DBServices");
const { checkCategoryExists } = require("../services/CategoryServices");
const {
	isNameValid,
	isPriceValid,
	isQuantityValid,
	isDesValid,
	isCategoryIdsValid,
	isPageNumberValid,
	isProductLimitNumberValid,
	isSortOptionValid,
	isSortOrderValid,
	processCategories,
	isIdValid,
	processQueryParams,
} = require("../utils/product_utils");
const { isIdValid: isCategoryIdValid } = require("../utils/category_utils");
const { serverProductImagePaths } = require("../utils/file_utils");

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
	if (!isNameValid(name))
		return {
			success: false,
			message: "Invalid product name!",
		};
	if (!isPriceValid(price))
		return {
			success: false,
			message: "Invalid product price!",
		};
	if (!isQuantityValid(quantity))
		return {
			success: false,
			message: "Invalid product quantity!",
		};
	if (!isDesValid(description))
		return {
			success: false,
			message: "Invalid product description!",
		};
	if (!isCategoryIdsValid(category_ids))
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
 * @param {string} textQuery - The search keywords
 * @param {string} page - This is the current page number to get data
 * @param {string} limit - The maximum number of products shown in each page
 * @param {string} sortBy - The column name to be sorted
 * @param {string} sortOrder - The sort order
 * @param {string} category - The id of category which is filtered
 * @param {string} relatedToProduct - The id of product to find other related products
 * @returns The list of products and along with additional information
 */
async function getProductsForCustomer(
	textQuery,
	page,
	limit,
	sortBy,
	sortOrder,
	category,
	relatedToProduct,
) {
	/*
	 * Count the offset to find where to start returning data
	 * -> Check the sort order
	 * -> Check if the column will be sorted is allowed
	 */
	let offset;
	[offset, limit, sortBy, sortOrder] = processQueryParams(
		page,
		limit,
		sortBy,
		sortOrder
	);
	try {
		// * Get list of products related to the provided product
		if (relatedToProduct) {
			return await getListRelatedProducts({
				relatedToProduct: relatedToProduct,
				limit: limit
			});
		}

		// * Get list of product with option: 
		// * ->	search(textQuery-required, category-optional)/filter (category-required)/ view all(textQuey, category not provided)
		return await getListProducts({
			textQuery: textQuery,
			category: category,
			sortBy: sortBy,
			sortOrder: sortOrder,
			limit: limit,
			offset: offset
		});
	} catch (error) {
		return {
			success: true,
			message: "Get products failed!",
			error: error.message,
		};
	}
}

/**
 * The function get list of products
 * @param {object} options - The criteria used to get products
 * @returns The object contains list of product along with additional data
 */
async function getListProducts(options) {
	let queryResults, totalProducts, categoryListWithTotalProducts;

	// * The sql statement's components pre-prepared
	let sql = `
		SELECT
				p.id,
				p.name,
				price,
				quantity,
				like_count,
				image_path
			FROM 
				products AS p`;
	const joinStatements = `
		INNER JOIN product_categories AS pc ON pc.product_id = p.id
		INNER JOIN categories AS c ON pc.category_id = c.id`;
	const whereStatements = `
		WHERE
			p.is_active = 1`;
	const orderStatement = ` ORDER BY p.${options.sortBy} ${options.sortOrder}`;
	const paginationStatements = ` LIMIT ? OFFSET ?`;

	try {
		// * Perform search products
		if (options.textQuery) {
			sql += joinStatements;
			sql += whereStatements + ` AND c.is_active = 1`;
			sql += ` AND p.name LIKE ?`;
			sql += (options.category) ? ` AND c.id = ?` : "";
			sql += ` GROUP BY p.id`;
			sql += orderStatement;
			sql += paginationStatements;

			// * Perform search based on whether the category is provided
			[queryResults] = await connection.query(
				sql,
				(options.category)
					? [`%${options.textQuery}%`, options.category, options.limit, options.offset]
					: [`%${options.textQuery}%`, options.limit, options.offset]
			);
			totalProducts = await getTotalProductWithTextQuery(options.textQuery);
		} else if (options.category) {
			// * Perform filter products based on provided category
			sql += joinStatements;
			sql += whereStatements + ` AND c.is_active = 1`;
			sql += ` AND c.id = ?`;
			sql += ` GROUP BY p.id`;
			sql += orderStatement;
			sql += paginationStatements;
			[queryResults] = await connection.query(
				sql,
				[options.category, options.limit, options.offset]
			);
			totalProducts = await getTotalProductsWithFilter(options.category);
		} else {
			// * Perform get normal list of products
			sql += whereStatements;
			sql += orderStatement;
			sql += paginationStatements;
			[queryResults] = await connection.query(
				sql,
				[options.limit, options.offset]
			);
			totalProducts = await getTotalProductsWithNoFilter();
		}
		if (queryResults.length === 0) return {
			success: false,
			message: "No products found!"
		};

		// * Get list of categories and their total products based on the options' criteria
		categoryListWithTotalProducts = await getCategoryListWithTotalProducts(options);

		queryResults = serverProductImagePaths(queryResults);
		return {
			success: true,
			message: `Found: ${queryResults.length} products`,
			total_products: totalProducts,
			products: queryResults,
			categories: categoryListWithTotalProducts
		};
	} catch (error) {
		return {
			success: false,
			message: "Error fetching products",
			error: error.message,
		};
	}

}

/**
 * The function get list of products related to the provided one
 * @param {object} options - The criteria used to get products
 * @returns The object contains list of product related to the provided one along with additional data
 */
async function getListRelatedProducts(options) {
	try {
		let [queryResults] = await connection.query(
			`SELECT 
					DISTINCT p.id,
					p.name,
					p.price,
					quantity,
					p.like_count,
					p.image_path
				FROM 
					products AS p
				JOIN 
					product_categories AS pc1 ON pc1.product_id = p.id
				JOIN (
					SELECT category_id 
					FROM product_categories
					WHERE product_id = ? 
				) pc2 ON pc1.category_id = pc2.category_id
				WHERE 
					p.id != ?
				ORDER BY 
					p.like_count DESC,
					p.name ASC
				LIMIT ?
				`,
			[options.relatedToProduct, options.relatedToProduct, options.limit]
		);
		if (!queryResults.length) return {
			success: false,
			message: "No products found!",
		};
		// Process serving image as static file
		queryResults = serverProductImagePaths(queryResults);

		return {
			success: true,
			products: queryResults,
		};
	} catch (error) {
		return {
			success: false,
			message: "Error fetching related products",
			error: error.message,
		};
	}
}

/**
 * The function returns the list of categories along with total products of each
 * @returns The list of categories along with total products which each category holds
 */
async function getCategoryListWithTotalProducts(options) {
	let sql = `
		SELECT 
				c.id,
				c.name,
				COUNT(p.id) as total_products
			FROM 
				categories AS c
			INNER JOIN 
				product_categories AS pc ON pc.category_id = c.id
			INNER JOIN 
				products AS p ON pc.product_id = p.id
			WHERE 
				c.is_active = 1`;
	if (options.textQuery) {
		if (options.category)
			sql += ` AND c.id = ? AND p.name LIKE ?`;
		else
			sql += ` AND p.name LIKE ?`;
		sql += ` GROUP BY c.id ORDER BY c.name ASC`;

		const [categoryQueryResults] = await connection.query(
			sql,
			(options.category)
				? [options.category, `%${options.textQuery}%`]
				: [`%${options.textQuery}%`]
		);
		return categoryQueryResults;
	} else if (options.category) {
		sql += ` AND c.id = ?`;
		const [categoryQueryResult] = await connection.query(
			sql,
			[options.category]
		);
		return categoryQueryResult;
	} else {
		sql += ` GROUP BY c.id ORDER BY c.name ASC`;
		const [categoryQueryResults] = await connection.query(sql);
		return categoryQueryResults;
	}
}

/**
 * The function returns the total products stored in database
 * @returns The total available products
 */
async function getTotalProductsWithNoFilter() {
	const [countResults] = await connection.query(
		`SELECT COUNT(*) AS count 
			FROM products
			WHERE is_active = 1`
	);
	const totalProducts = countResults[0].count;
	return totalProducts;
}

/**
 * The function get the total number of products that matches the search string 
 * @param {string} textQuery - The search string
 * @returns The total products matching with the search string
 */
async function getTotalProductWithTextQuery(textQuery) {
	const [countResults] = await connection.query(
		`SELECT 
				COUNT(*) AS count 
			FROM 
				products
			WHERE 
				is_active = 1 AND name LIKE ?`,
		[`%${textQuery}%`]
	);
	return countResults[0].count;
}

/**
 * The functions get the total products of category when filtering
 * @param {string} categoryId - The id of category which will use to filter products
 * @returns The total products that belong to filtering category
 */
async function getTotalProductsWithFilter(categoryId) {
	const [countResults] = await connection.query(
		`SELECT COUNT(*) AS count 
			FROM products as p
			INNER JOIN product_categories AS pc ON pc.product_id = p.id
			WHERE p.is_active = 1 AND pc.category_id = ?`,
		[categoryId]
	);
	return countResults[0].count;
}

/**
 *
 * @param {string} page - This is the current page number to get data
 * @param {string} limit - The number of products will be returned
 * @param {string | undefined} sortBy - The sort criteria
 * @param {string | undefined} sortOrder - The sort order ASC or DESC
 * @param {string | undefined} category - The category which will use to filter products
 * @returns If the product query params are valid if not returns along with the message
 */
function validateGetProductQueryParams(
	page,
	limit,
	sortBy,
	sortOrder,
	category,
	product,
) {
	if (!isPageNumberValid(page))
		return {
			success: false,
			message: "Invalid page number!",
		};
	if (!isProductLimitNumberValid(limit))
		return {
			success: false,
			message: "Invalid product limit number!",
		};
	if (!isSortOptionValid(sortBy))
		return {
			success: false,
			message: "Invalid sort option!",
		};
	if (!isSortOrderValid(sortOrder))
		return {
			success: false,
			message: "Invalid sort order!",
		};
	if (typeof category !== "undefined" && category.trim().length != 0)
		if (!isCategoryIdValid(category))
			return {
				success: false,
				message: "Invalid category!",
			};
	if (typeof product !== "undefined" && product.trim().length != 0)
		if (!isIdValid(product))
			return {
				success: false,
				message: "Invalid product!"
			};
	return { success: true };
}

/**
 * This function checks if the product id is valid
 * @param {string} id - The id of product to get detail
 * @returns If the id is valid along with the message if invalid
 */
function checkIdValid(id) {
	if (!isIdValid(id))
		return {
			success: false,
			message: "Invalid product id!",
		};
	return { success: true };
}

/**
 * This function gets detail of a specified product
 * @param {string} id - The id of product to get detail
 * @returns The data of product with provided id or error if any
 */
async function getProductDetail(id) {
	try {
		let [queryResult] = await connection.query(
			`SELECT 
				p.id, 
				p.name, 
				price, 
				quantity,
				like_count,
				dislike_count,
				p.description, 
				image_path, 
				p.create_at,
				GROUP_CONCAT(c.id, ':', c.name) AS categories
			FROM products AS p
			INNER JOIN product_categories AS pc ON pc.product_id = p.id
			INNER JOIN categories AS c ON pc.category_id = c.id
			WHERE p.is_active = 1 AND p.id = ? AND c.is_active = 1
			GROUP BY p.id`,
			[id]
		);
		if (queryResult.length == 0)
			return {
				success: false,
				message: "Product not found!",
			};
		queryResult = serverProductImagePaths(queryResult);
		queryResult = processCategories(queryResult);
		return {
			success: true,
			data: queryResult,
		};
	} catch (error) {
		console.log(error);
		return {
			success: false,
			message: "Get products failed!",
			error: error.message,
		};
	}
}

module.exports = {
	validateNewProductInputs,
	addNewProduct,
	getProductsForCustomer,
	validateGetProductQueryParams,
	checkIdValid,
	getProductDetail,
};
