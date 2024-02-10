const express = require('express')
var bodyParser = require('body-parser')
var mail = require("../../constants/email");
const { uploadFile } = require('../../middleware/multerupload')

/******** Prisma Client *******/
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

/******** Json Parser *******/
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false})

/******** Creating Routing *******/
var router = express.Router()

router.get("/getall", async(req, res) => {
	const colleges = await prisma.college.findMany({ where : { status : 0 }})
	if(colleges.length > 0){
		res.json({
			"code": 200,
			"message": "College retrived successfully",
			"colleges": colleges
		})
	}else{
		res.json({
			"code": 201,
			"message": "No college Found"
		})
	}
})

router.get("/getcollege", async(req, res) => {
	const college = await prisma.college.findMany({ where : { jwt : req.headers.authtoken }})
	if(college.length > 0){
		res.json({
			"code": 200,
			"message": "College retrived successfully",
			"college": college[0]
		})
	}else{
		res.json({
			"code": 201,
			"message": "No college Found"
		})
	}
})



router.post("/updatecollege", urlencodedParser, async(req, res) => {
	const collegeObj = await prisma.college.findMany({ where : { jwt : req.headers.authtoken }})
	if(collegeObj.length > 0){
		const college = await prisma.college.update({
		 where : { collegeid : collegeObj[0].collegeid },
		 data : {
			firstname : req.body.firstname,
			lastname : req.body.lastname,
			designation : req.body.designation,
			department : req.body.department,
			email : req.body.email,
			website : req.body.website, 
			phone : req.body.phone,
			tel : req.body.tel,
		 }
		})
		res.json({
			"code": 200,
			"message": "College updated successfully",
			"college": college
		})
	}else{
		res.json({
			"code": 201,
			"message": "No Login User Found"
		})
	}
})



router.post("/updatecollegelogins", urlencodedParser, async(req, res) => {
	const collegeObj = await prisma.college.findMany({ where : { jwt : req.headers.authtoken }})
	if(collegeObj.length > 0){
		const college = await prisma.college.update({
		 where : { collegeid : collegeObj[0].collegeid },
		 data : {
			username : req.body.username,
			password : req.body.password,
		 }
		})
		res.json({
			"code": 200,
			"message": "College updated successfully",
			"college": college
		})
	}else{
		res.json({
			"code": 201,
			"message": "No Login User Found"
		})
	}
})

router.post("/uploadimage", uploadFile('profileimages/').single('profile'), async(req, res) => {
	const collegeObj = await prisma.college.findMany({ where : { jwt : req.headers.authtoken }})
	if(collegeObj.length > 0){
		const college = await prisma.college.update({
			where : { collegeid : collegeObj[0].collegeid },
			data : {
				collegelogo : `profileimages/${req.file.filename}`,
			}
		})
		res.json({
			"code": 200,
			"message": "College updated successfully",
			"college": college
		})
	}else{
		res.json({
			"code": 201,
			"message": "No Login User Found"
		})
	}
})

module.exports = router