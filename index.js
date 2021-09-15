const express = require("express")
const app = express()
const port = 3000
const jwt = require("jsonwebtoken")
const mysql = require("mysql")
const md5 = require("md5")
const env = require('dotenv').config()
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

app.post("/signup", (req,res) => {
	let userName = req.body.fullName
	let userEmail = req.body.email
	let userPassword = md5(req.body.password);

	let findUser = `SELECT * FROM users WHERE email="${userEmail}"`;

	conn.query(findUser, (err, result) => {
		if (err) {
			res.status(401).send({
				"error": err
			})
			return
		}

		if (result.length == 0){
			let createUser = `INSERT INTO users(name,email,password) VALUES ("${userName}","${userEmail}","${userPassword}"
			)`;

			conn.query(createUser, (err,result) => {
				if (err) {
					res.status(401).send({
						"error": err
					})
					return
				}

				let authorization_token = jwt.sign({userEmail}, process.env.SECRET_AUTHORIZATION_TOKEN, {expiresIn:600})

				res.status(200).send({
					"message": "User Created",
					"authorization_token": authorization_token
				})
			})
		}
		else{
			res.status(200).send({
				"message": "User Already Exists"
			})
		}
	});

})

app.get("/test", (req,res) => {
	res.send("etst")
})

app.listen(port, () => {
	console.log(`Server is running at port ${port}`)
})