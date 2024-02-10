const express = require('express')
var bodyParser = require('body-parser')

/******** Prisma Client *******/
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

var router = express.Router()

var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false})

router.get("/", async(req, res) => {
	const college = await prisma.college.findMany({ where : { jwt : req.headers.authtoken }})
	if(college.length > 0){
		const subscriptions = await prisma.subcriptions.findMany({
			where : {
				collegeId : college[0].collegeid
			},
			include : {
				packages : {
					include : {
						course : {
							include : {
								accent : true
							}
						}
					}
				},
				class : true
			}
		})
		console.log(subscriptions)
		if(subscriptions.length > 0){
			res.json({
				"code": 200,
				"message": "Subcriptions Retrived Successfully",
				"subscriptions": subscriptions
			})
		}else{
			res.json({
				"code": 201,
				"message": "No Subcription Found"
			})
		}
	}else{
		res.json({
			"code": 201,
			"message": "No Login User Found"
		})

	}
})

router.post("/createsubscription", urlencodedParser, async(req, res) => {
	const college = await prisma.college.findMany({ where : { jwt : req.headers.authtoken }})
	if(college.length > 0){
		const subcriptions = await prisma.subcriptions.create({
			data : {
				collegeId : college[0].collegeid,
				packageId : parseInt(req.body.subscription)
			}
		})
		const package = await prisma.packages.findUnique({ where : { packageid:  parseInt(req.body.subscription)}})
		const invoice = await prisma.invoices.create({
			data : {
				collegeid : college[0].collegeid,
				subscriptionid : subcriptions.id,
				subtotal : package.packageprice,
				vat : (package.packageprice / 100) * 25,
				discount : 0,
				total :(package.packageprice  + (package.packageprice / 100) * 20),
				createdon : new Date(),
				duedate : new Date(Date.now() + 12096e5),
				status : 0
			}
		})
		res.json({
			"code": 200,
			"message": "Package subscribe successfully"
		})
	}else{
		res.json({
			"code": 201,
			"message": "No Login User Found"
		})
	}
})

router.post("/getsubscriptiondetails", urlencodedParser, async(req, res) => {
	const college = await prisma.college.findMany({ where : { jwt : req.headers.authtoken }})
	if(college.length > 0){
		const subcription = await prisma.subcriptions.findUnique({
			where : {
				id : parseInt(req.body.subscriptionid)
			},
			include : {
				college : true,
				student : true,
				packages : {
					include : {
						course : {
							include : {
								accent : true
							}
						}
					}
				},
				class : true
			}
		})
		console.log(subcription)
		res.json({
			"code": 200,
			"message": "Subcription retived successfully",
			"subcription" : subcription
		})
	}else{
		res.json({
			"code": 201,
			"message": "No Login User Found"
		})
	}
})


module.exports = router