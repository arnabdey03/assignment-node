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

function connectDatabase(){
	conn = mysql.createConnection({
		host: "localhost",
		user: "root",
		password: "",
		database: "webgen_assignment"
	})

	conn.connect((err) => {
		if(err) console.log(err)
	})
}

connectDatabase()

app.post("/signup", checkIfUserAlreadyExists, async (req,res) => {
	const userName = req.body.fullName
	const userEmail = req.body.email
	const userPassword = req.body.password

	// let findUser = `SELECT count(*) as count FROM users WHERE email="${userEmail}"`;

	// conn.query(findUser, async (err, result) => {
	// 	if (err) {
	// 		return res.status(401).send({
	// 			"error": err
	// 		})
	// 	}
	// 	console.log(result)
	// 	if (result[0].count == 0){

	try{
		const hashedPassword = await bcrypt.hash(userPassword,10);

		let createUser = `INSERT INTO users(name,email,password) VALUES ("${userName}","${userEmail}","${hashedPassword}"
		)`;

		conn.query(createUser, (err,result) => {
			if (err) {
				return res.status(500).send({
					"error": err
				})
			}
			
			let authorizationToken = jwt.sign({ email:userEmail,id:result.insertId }, process.env.AUTHORIZATION_TOKEN_SECRET, { expiresIn: 20 })

			return res.status(201).send({
				success: true,
				"message": "New user created.",
				userID: result.insertId,
				authorizationToken
			})				
		})

	}
	catch{
		return res.status(500).send({
			"message": "Something went wrong!"
		})
	}

	// 	}
	// 	else{
	// 		res.status(200).send({
	// 			"message": "User Already Exists"
	// 		})
	// 	}

	// });

})

app.post("/login", (req,res) => {
	const userEmail = req.body.email
	const userPassword = req.body.password
	
	if(userEmail == null || userEmail == ""){
		res.status(400).send({
			message: "Cannot find user"
		})
	}
	else{
		let getUserDetails = `SELECT id,name,email,password FROM users WHERE email="${userEmail}"`;

		conn.query(getUserDetails, async (err,result) => {

			if(err){
				res.status(500).send({
					error: err
				})
			}

			if(result.length > 0){

				try{
					if(await bcrypt.compare(userPassword, result[0].password)){
	
						let authorizationToken = jwt.sign({ userEmail }, process.env.AUTHORIZATION_TOKEN_SECRET, { expiresIn: 60 })
						
						res.status(200).send({
							success: true,
							message: "Logged in successfully.",
							userID: result[0].id,
							authorizationToken
						})
					}
					else{
						res.status(401).send({
							success: false,
							message: "Incorrect Password"
						})
					}
				}
				catch{
					res.status(500).send({
						error: err
					})
				}
			}
			else{
				res.status(404).send({
					success: false,
					message: "Email Not Found"
				})
			}

		})
	}

})

app.post("/add-product", async (req,res) => {

	const productName = req.body.productName
	const productPrice = req.body.productPrice
	const productDescription = req.body.productDescription
	const userID = req.body.userID

	let fetchUserName = `SELECT name FROM users WHERE id=${userID}`

	// await conn.query(fetchUserName, (err,result) => {

	// 	if(err){
	// 		res.status(500).send({
	// 			error: err
	// 		})
	// 	}

	// 	if(result.length > 0 ){
	// 		const userName = result[0].name
	// 		res.send(userName)
	// 	}
	// })

	let addNewProduct = `INSERT INTO products (name,price,description,add_by_user) VALUES ("${productName}","${productPrice}","${productDescription}","${userID}")`

	await conn.query(addNewProduct, (err,result) => {

		if(err){
			res.status(500).send({
				error: error
			})
		}

		if(result.affectedRows > 0){
			res.status(200).send({
				success: true,
				message: "Product Added Successfully."
			})
		}
	})
})

app.get("/products", (req,res) => {
	const page = parseInt(req.query.page)
	const limit = parseInt(req.query.limit)

	const startPosition  = (page-1)*limit
	const fetchTotalRows = limit

	let totalProducts = 0;
	
	let products = {}

	let getAllProductsCount = "SELECT COUNT(id) AS count FROM products"

	conn.query(getAllProductsCount, async (err,result) => {

		if(err){
			res.status(500).send({
				error: err
			})
		}
		
		if(await result[0].count > 0){
			totalProducts = await result[0].count
		}
	})

	let getAllProducts = `SELECT p.id AS product_id,p.name AS product_name,p.price As product_price,p.description AS product_description,u.name AS user_name FROM products AS p LEFT JOIN users AS u ON p.add_by_user = u.id ORDER BY product_id LIMIT ${startPosition},${fetchTotalRows}`

	conn.query(getAllProducts, async (err,result) => {

		if(err){
			res.status(500).send({
				error: err
			})
		}

		if(await result.length > 0){

			products = await result

		}

		if(totalProducts && products.length){

			res.status(200).send({
				totalProducts,
				products
			})
		}
		else{
			res.status(404).send({
				message: "No products found"
			})
		}

	})
})

app.get("/search-product", (req,res) => {
	const productName = req.query.productName

	let findProduct = `SELECT p.id AS product_id,p.name AS product_name,p.price As product_price,p.description AS product_description,u.name AS user_name FROM products AS p LEFT JOIN users AS u ON p.add_by_user = u.id WHERE p.name LIKE "%${productName}%" ORDER BY product_id`

	conn.query(findProduct, (err,result) => {

		if(err){
			return res.status(500).send({
				error: err
			})
		}
		
		if(result.length){
			return res.status(200).send({
				success: true,
				data: result
			})
		}
		else{
			return res.status(404).send({
				success: false,
				message: "Product not found."
			})
			
		}
	})
})

app.put("/update-product", (req,res) => {
	const productID = req.body.productID
	const productName = req.body.productName
	const productPrice = req.body.productPrice
	const productDescription = req.body.productDescription
	const userID = req.body.userID

	let updateProduct = `UPDATE products SET name = "${productName}", price = ${productPrice}, description = "${productDescription}", add_by_user = ${userID} WHERE id = ${productID}`

	conn.query(updateProduct, (err,result) => {

		if(err){
			return res.status(500).send({
				error: err
			})
		}

		if(result.affectedRows){
			return res.status(201).send({
				success: true,
				message: "Record updated successfully"
			})
		}
	})
})

app.delete("/delete-product", (req,res) => {
	const productID = req.query.productID

	let deleteProduct = `DELETE FROM products WHERE id = ${productID}`

	conn.query(deleteProduct, (err,result) => {

		if(err) {
			return res.status(500).send({
				error: err
			})
		}

		if(result){
			res.status(200).send({
				success: true,
				message: "Product deleted successfully."
			})
		}
	})
})

app.get("/check-token", checkAuthorizationToken, (req,res) => {

	res.status(200).send({
		success: true,
		message: "User token is valid."
	})
})

function checkIfUserAlreadyExists(req,res,next){
	let userEmail = req.body.email

	let findUser = `SELECT COUNT(*) AS count FROM users WHERE email="${userEmail}"`;

	conn.query(findUser, (err, result) => {
		if (err) {
			res.status(500).send({
				"error": err
			})
		}
		
		if (result[0].count == 0){
			next()
		}
		else{
			res.status(200).send({
				success: false,
				"message": "User already exists with this email."
			})
		}
	})
}

function checkAuthorizationToken(req,res,next){
	const authHeader = req.headers.authorization
	const authToken = authHeader && authHeader.split(" ")[1]
	
	if(authToken == null){
		return res.status(401).send({
			success: false,
			message: "Unauthorized To Access."
		})
	}

	jwt.verify(authToken, process.env.AUTHORIZATION_TOKEN_SECRET, (err,user) => {
		
		if(err) {
			return res.status(403).send({
				success: false,
				message: "Forbidden Access, try to login again."
			})
		}
		
		req.user = user
		next()
	})

}

app.listen(port, (error) => {
	if(error) console.log(error)
	console.log(`Server is running at port ${port}`)
})