const express = require('express')
var bodyParser = require('body-parser')

/******** Prisma Client *******/
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

var router = express.Router()

var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false})

router.get("/getall", urlencodedParser, async(req, res) => {
	const accents = await prisma.accent.findMany({
		where : {
			status : 0
		},
		orderBy: {
			priority: 'asc'
		}
	})
	if(accents.length > 0){
		res.json({
			"code": 200,
			"message": "Accent Retrived Successfully",
			"accents": accents
		})
	}else{
		res.json({
			"code": 201,
			"message": "No accent Found"
		})
	}
})

module.exports = router