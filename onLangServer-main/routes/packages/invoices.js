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
		const invoices = await prisma.invoices.findMany({
			where : {
				collegeid : college[0].collegeid
			},
			include : {
				subcriptions : {
					include : {
						packages : {
							include : {
								course : {
									include : {
										accent : true
									}
								}
							}
						}
					}
				}
				
			}
		})
		console.log(invoices)
		if(invoices.length > 0){
			res.json({
				"code": 200,
				"message": "Invoices Retrived Successfully",
				"invoices": invoices
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

router.post("/details", urlencodedParser, async(req, res) => {
	const college = await prisma.college.findMany({ where : { jwt : req.headers.authtoken }})
	if(college.length > 0){
		const invoice = await prisma.invoices.findUnique({
			where : {
				id : parseInt(req.body.invoiceid)
			},
			include : {
				college: true,
				subcriptions : {
					include : {
						packages : {
							include : {
								course : {
									include : {
										accent : true
									}
								}
							}
						}
					}
				}
				
			}
		})
		console.log(invoice)
		res.json({
			"code": 200,
			"message": "Invoices Retrived Successfully",
			"invoice": invoice
		})
	}else{
		res.json({
			"code": 201,
			"message": "No Login User Found"
		})

	}
})


module.exports = router