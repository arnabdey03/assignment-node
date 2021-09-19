require('dotenv').config()
const express = require("express")
const app = express()
const port = 8000
const jwt = require("jsonwebtoken")
const mysql = require("mysql")
const bcrypt = require("bcrypt")
const cors = require("cors")
app.use(cors())
app.use(express.json())

var conn;

function connectDatabase() {
	conn = mysql.createConnection({
		host: `${process.env.DB_HOST}`,
		user: `${process.env.DB_USER_NAME}`,
		password: `${process.env.DB_PASSWORD}`,
		database: `${process.env.DB_NAME}`
	})

	conn.connect((err) => {
		if (err) console.log(err)
	})
}

connectDatabase()

app.post("/signup", checkIfUserAlreadyExists, async (req, res) => {
	const userName = req.body.fullName
	const userEmail = req.body.email
	const userPassword = req.body.password
	console.log(typeof req.body.fullName)
	console.log(req.body.fullName)
	console.log(req.body)

	try {
		const hashedPassword = await bcrypt.hash(userPassword, 10);

		let createUser = `INSERT INTO users(name,email,password) VALUES ("${userName}","${userEmail}","${hashedPassword}"
		)`;

		await conn.query(createUser, (err, result) => {
			if (err) {
				return res.status(500).send({
					"error": "Something Went Wrong"
				})
			}

			let authorizationToken = jwt.sign({ email: userEmail, id: result.insertId }, process.env.AUTHORIZATION_TOKEN_SECRET, { expiresIn: 600 })

			return res.status(201).send({
				success: true,
				"message": "New User Created.",
				userID: result.insertId,
				authorizationToken
			})
		})

	}
	catch {
		return res.status(500).send({
			"message": "Something Went Wrong!"
		})
	}

})

app.post("/login", (req, res) => {
	const userEmail = req.body.email
	const userPassword = req.body.password

	if (userEmail == null || userEmail == "") {
		res.status(400).send({
			message: "Cannot Find User"
		})
	}
	else {
		let getUserDetails = `SELECT id,name,email,password FROM users WHERE email="${userEmail}"`;

		conn.query(getUserDetails, async (err, result) => {

			if (err) {
				res.status(500).send({
					error: "Something Went Wrong"
				})
			}

			if (result.length > 0) {

				try {
					if (await bcrypt.compare(userPassword, result[0].password)) {

						let authorizationToken = jwt.sign({ userEmail }, process.env.AUTHORIZATION_TOKEN_SECRET, { expiresIn: 6000 })

						res.status(200).send({
							success: true,
							message: "Logged In Successfully",
							userID: result[0].id,
							authorizationToken
						})
					}
					else {
						res.status(401).send({
							success: false,
							message: "Incorrect Password"
						})
					}
				}
				catch {
					res.status(500).send({
						error: err
					})
				}
			}
			else {
				res.status(404).send({
					success: false,
					message: "Email Not Found"
				})
			}

		})
	}

})

app.post("/add-product", checkAuthorizationToken, async (req, res) => {

	const productName = req.body.productName
	const productPrice = req.body.productPrice
	const productDescription = req.body.productDescription
	const userID = req.body.userID

	let fetchUserName = `SELECT name FROM users WHERE id=${userID}`

	let addNewProduct = `INSERT INTO products (name,price,description,add_by_user) VALUES ("${productName}","${productPrice}","${productDescription}","${userID}")`

	await conn.query(addNewProduct, (err, result) => {

		if (err) {
			res.status(500).send({
				error: "Something Went Wrong"
			})
		}

		if (result.affectedRows > 0) {
			res.status(200).send({
				success: true,
				message: "Product Added Successfully."
			})
		}
	})
})

app.get("/products", checkAuthorizationToken, (req, res) => {
	const page = parseInt(req.query.page)
	const limit = parseInt(req.query.limit)

	const startPosition = (page - 1) * limit || 0
	const fetchTotalRows = limit || 10

	let totalProducts = 0;

	let products = {}

	let getAllProductsCount = "SELECT COUNT(id) AS count FROM products"

	conn.query(getAllProductsCount, async (err, result) => {

		if (err) {
			res.status(500).send({
				error: "Something Went Wrong"
			})
		}

		if (await result[0].count > 0) {
			totalProducts = await result[0].count
		}
	})

	let getAllProducts = `SELECT p.id AS product_id,p.name AS product_name,p.price As product_price,p.description AS product_description,u.name AS user_name FROM products AS p LEFT JOIN users AS u ON p.add_by_user = u.id ORDER BY product_id LIMIT ${startPosition},${fetchTotalRows}`

	conn.query(getAllProducts, async (err, result) => {

		if (err) {
			res.status(500).send({
				error: "SOmething Went Wrong"
			})
		}

		if (await result.length > 0) {

			products = await result

		}

		if (totalProducts && products.length) {

			res.status(200).send({
				totalProducts,
				products
			})
		}
		else {
			res.status(404).send({
				message: "No Products Found"
			})
		}

	})
})

app.get("/search-product", checkAuthorizationToken, (req, res) => {
	const productName = req.query.productName

	let findProduct = `SELECT p.id AS product_id,p.name AS product_name,p.price As product_price,p.description AS product_description,u.name AS user_name FROM products AS p LEFT JOIN users AS u ON p.add_by_user = u.id WHERE p.name LIKE "%${productName}%" ORDER BY product_id`

	conn.query(findProduct, (err, result) => {

		if (err) {
			return res.status(500).send({
				error: "Something Went Wrong"
			})
		}

		if (result.length) {
			return res.status(200).send({
				success: true,
				data: result
			})
		}
		else {
			return res.status(404).send({
				success: false,
				message: "Product not found."
			})

		}
	})
})

app.put("/update-product", checkAuthorizationToken, (req, res) => {
	const productID = req.body.productID
	const productName = req.body.productName
	const productPrice = req.body.productPrice
	const productDescription = req.body.productDescription
	const userID = req.body.userID

	let updateProduct = `UPDATE products SET name = "${productName}", price = ${productPrice}, 
	description = "${productDescription}", add_by_user = ${userID}, updated_at = CURRENT_TIMESTAMP()
	WHERE id = ${productID}`

	conn.query(updateProduct, (err, result) => {

		if (err) {
			return res.status(500).send({
				error: "Something Went Wrong"
			})
		}

		if (result.affectedRows) {
			return res.status(201).send({
				success: true,
				message: "Record Updated Successfully"
			})
		}
	})
})

app.delete("/delete-product", checkAuthorizationToken, (req, res) => {
	const productID = req.query.productID

	let deleteProduct = `DELETE FROM products WHERE id = ${productID}`

	conn.query(deleteProduct, (err, result) => {

		if (err) {
			return res.status(500).send({
				error: "Something went wrong."
			})
		}

		if (result.affectedRows) {
			res.status(200).send({
				success: true,
				message: "Product Deleted Successfully."
			})
		}
		else {
			res.status(404).send({
				success: false,
				message: "Product Not Found."
			})
		}
	})
})

app.get("/check-token", checkAuthorizationToken, (req, res) => {

	res.status(200).send({
		success: true,
		message: "User Token Is Valid."
	})
})

function checkIfUserAlreadyExists(req, res, next) {
	let userEmail = req.body.email

	let findUser = `SELECT COUNT(*) AS count FROM users WHERE email="${userEmail}"`;

	conn.query(findUser, (err, result) => {
		if (err) {
			res.status(500).send({
				"error": "Something Went Wrong"
			})
		}

		if (result[0].count == 0) {
			next()
		}
		else {
			res.status(200).send({
				success: false,
				"message": "User Already Exists With This Email."
			})
		}
	})
}

function checkAuthorizationToken(req, res, next) {
	const authHeader = req.headers.authorization
	const authToken = authHeader && authHeader.split(" ")[1]

	if (authToken == null) {
		return res.status(401).send({
			success: false,
			message: "Unauthorized To Access. Please Login Again"
		})
	}

	jwt.verify(authToken, process.env.AUTHORIZATION_TOKEN_SECRET, (err, user) => {

		if (err) {
			return res.status(403).send({
				success: false,
				message: "Forbidden Access, Please Login Again."
			})
		}

		req.user = user
		next()
	})

}

app.listen(port, (error) => {
	if (error) console.log(error)
	console.log(`Server Is Running At Port ${process.env.SERVER_PORT}`)
})