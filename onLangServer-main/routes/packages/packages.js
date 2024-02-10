const express = require('express')
var bodyParser = require('body-parser')

/******** Prisma Client *******/
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

var router = express.Router()

var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false})

router.post("/", urlencodedParser, async(req, res) => {
	const packages = await prisma.packages.findMany({
		where : {
			AND : {
				NOT : {
					status : 2
				},
				timing : parseInt(req.body.packages)
			}
		},
		include : {
			course : {
				include : {
					accent : true
				}
			}
		}
	})
	if(packages.length > 0){
		res.json({
			"code": 200,
			"message": "Package Retrived Successfully",
			"packages": packages
		})
	}else{
		res.json({
			"code": 201,
			"message": "No Package Found"
		})
	}
})

router.get("/getall", async(req, res) => {
	const packages = await prisma.packages.findMany({
		where : {
			status : 0
		},
		orderBy: {
			timing: 'asc'
		},
		distinct: ['timing']
	})
	if(packages.length > 0){
		res.json({
			"code": 200,
			"message": "Package Retrived Successfully",
			"packages": packages
		})
	}else{
		res.json({
			"code": 201,
			"message": "No Package Found"
		})
	}
})


router.get("/getallPackages", async(req, res) => {
	const packages = await prisma.packages.findMany({
		where : {
			status : 0
		},
		orderBy: {
			timing: 'asc'
		},
		include : {
			course : true
		}
	})
	const duration = await prisma.packages.findMany({
		where : {
			status : 0
		},
		orderBy: {
			timing: 'asc'
		},
		distinct: ['timing']
	})
	if(packages.length > 0){
		res.json({
			"code": 200,
			"message": "Package Retrived Successfully",
			"packages": packages,
			"duration": duration
		})
	}else{
		res.json({
			"code": 201,
			"message": "No Package Found"
		})
	}
})

router.get("/subscribed", async(req, res) => {
	const college = await prisma.college.findMany({
		where : {
			jwt : req.headers.authtoken
		}
	})
	if(college.length > 0){
		const objects =  await prisma.subcriptions.findMany({
			where : {
				collegeId : parseInt(college[0].collegeid),
				usedslots: {
					lte : 8
				},
				optionmenu : {
					lte : 1
				}
			},
			include : {
				packages : {
					include : {
						course : true
					}
				}
			}
		})
		var subscriptions = []
		objects.forEach(obj => {
			subscriptions.push({
				packageid: obj.packages.packageid,
			    subscriptioid: obj.id,
			    coursename: obj.packages.course.coursename,
			    timing: obj.packages.timing,
			    noofstudent: obj.packages.noofstudent,
			    avaliableslots: obj.packages.noofstudent - obj.usedslots,
			    optionmenu: obj.optionmenu
			})
		})
		if(subscriptions.length > 0){
			res.json({
				"code": 200,
				"message": "Package Retrived Successfully",
				"packages": subscriptions
			})
		}else{
			res.json({
				"code": 202,
				"message": "No Package Found"
			})
		}
	}else{
		res.json({
			"code": 201,
			"message": "No Login User Found"
		})
	}
})


module.exports = router