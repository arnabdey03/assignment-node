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
		console.log("connected")
	})
}

connectDatabase()

function checkIfUserAlreadyExists(req,res,next){
	let userName = req.body.fullName
	let userEmail = req.body.email
	let userPassword = req.body.password;

	let findUser = `SELECT count(*) as count FROM users WHERE email="${userEmail}"`;

	conn.query(findUser, (err, result) => {
		if (err) {
			res.status(500).send({
				"error": err
			})
		}
		console.log(result)
		if (result[0].count == 0){
			console.log("not found")
			next()
		}
		else{
			console.log("found")
			res.status(200).send({
				"message": "User already exists with this email."
			})
		}
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
		console.log(hashedPassword)

		let createUser = `INSERT INTO users(name,email,password) VALUES ("${userName}","${userEmail}","${hashedPassword}"
		)`;

		conn.query(createUser, (err,result) => {
			if (err) {
				res.status(500).send({
					"error": err
				})
			}
			console.log(result)
			let authorizationToken = jwt.sign({ userEmail }, process.env.AUTHORIZATION_TOKEN_SECRET, { expiresIn: 600 })

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
		let getUserDetails = `SELECT id,name,password FROM users WHERE email="${userEmail}"`;

		conn.query(getUserDetails, async (err,result) => {

			if(err){
				res.status(500).send({
					error: err
				})
			}

			try{
				if(await bcrypt.compare(userPassword, result[0].password)){
					res.send("user exists")
				}
				else{
					res.send("incorrect password")
				}
			}
			catch{
				res.send("error")
			}

		})
	}

})

app.get("/test", (req,res) => {
	res.send("etst")
})

app.listen(port, () => {
	console.log(`Server is running at port ${port}`)
})