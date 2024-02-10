const express = require('express')
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const fileupload = require("express-fileupload");
var bodyParser = require('body-parser')
var mail = require("../../constants/email");

/******** Prisma Client *******/
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

/******** Json Parser *******/
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false})

/******** Creating Routing *******/
var router = express.Router()

function generateAccessToken(user) {
  return jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}

router.post("/login", urlencodedParser, async(req, res) => {
	var type = req.body.type;
	if(req.body.username === "no" || req.body.password === "no"){
		res.json({ "code": 201, "message": "No User Found" })
	}else{
		let table = "college"
		let user = await prisma.college.findFirst({
			where:{
				email : req.body.email,
				password : req.body.password,
				status : 0
			}
		})
		if(!user){
			table = "teacher" 
			user = await prisma.teacher.findFirst({
				where:{
					email : req.body.email,
					password : req.body.password,
					status : 0
				}
			})
			if(!user){
				table = "student" 
				user = await prisma.student.findFirst({
					where:{
						email : req.body.email,
						password : req.body.password,
						status : 0
					}
				})
				if(!user){
					res.json({ "code": 201, "message": "No User Found" })
					return
				}
			}
		}
		if(table === "college"){
			token = generateAccessToken({collegeid : user.collegeid, collegename : user.collegename})
			console.log(user.collegeid )
			user = await prisma.college.update({
				where:{ collegeid : user.collegeid },
				data: { jwt: token }
			})
		}else{
			if(table === "student"){
				token = generateAccessToken({collegeid : user.studentid, studentname : user.firstname})
				user = await prisma.student.update({
					where:{ studentid : user.studentid },
					data: { jwt: token }
				})
			}else{
				if(table === "teacher"){
					token = generateAccessToken({teacherid : user.teacherid, teachername : user.firstname})
					user = await prisma.teacher.update({
						where:{ teacherid : user.teacherid },
						data: { jwt: token }
					})
				}
			}
		}
		res.json({ "code": 200, "message": "Login Successful", "user": user, "token":token})
	}
})


module.exports = router