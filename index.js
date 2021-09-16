require('dotenv').config()
const express = require("express")
const app = express()
const port = 3000
const jwt = require("jsonwebtoken")
const mysql = require("mysql")
const bcrypt = require("bcrypt")
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

function checkIfUserAlreadyExists(req,res,next){
	let userEmail = req.body.email

	let findUser = `SELECT count(*) as count FROM users WHERE email="${userEmail}"`;

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
				message: "Forbidden Access"
			})
		}
		
		req.user = user
		next()
	})

}

app.post("/signup", checkIfUserAlreadyExists, async (req,res) => {
	const userName = req.body.fullName
	const userEmail = req.body.email
	const userPassword = req.body.password;

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
				res.status(500).send({
					"error": err
				})
			}
			
			let authorizationToken = jwt.sign({ email:userEmail,id:result.insertId }, process.env.AUTHORIZATION_TOKEN_SECRET, { expiresIn: 20 })

			res.status(201).send({
				"message": "New user created.",
				authorizationToken
			})				
		})

	}
	catch{
		res.status(500).send({
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
	
						let authorizationToken = jwt.sign({ userEmail }, process.env.AUTHORIZATION_TOKEN_SECRET, { expiresIn: 15 })
						
						res.status(200).send({
							success: true,
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

app.post("/add-product", checkAuthorizationToken, async (req,res) => {

	const productName = req.body.productName
	const productPrice = req.body.productPrice
	const productDescription = req.body.productDescription
	const userID = req.body.userID

	console.log(req.user)

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
			res.send(result)
		}
	})
})

app.get("/products", (req,res) => {
	let getAllProducts = "SELECT p.id AS product_id,p.name AS product_name,p.price As product_price,p.description AS product_description,u.name AS user_name FROM products AS p LEFT JOIN users AS u ON p.add_by_user = u.id ORDER BY product_id"

	conn.query(getAllProducts, (err,result) => {

		if(err){
			res.status(500).send({
				error: err
			})
		}

		if(result.length > 0){
			res.send(result)
		}

	})
})

app.get("/test", (req,res) => {
	res.send("etst")
})

app.listen(port, () => {
	console.log(`Server is running at port ${port}`)
})