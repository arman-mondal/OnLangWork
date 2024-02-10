const express = require('express')
var bodyParser = require('body-parser')

/******** Prisma Client *******/
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

var router = express.Router()

var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false})

router.get("/getall", urlencodedParser, async(req, res) => {
	const slots = await prisma.slots.findMany({where:{status:0}})
	const days = await prisma.days.findMany({ where : { status : 0 }})
        console.log(slots)	
        if(slots.length > 0 &&  days.length > 0){
		res.json({
			"code": 200,
			"message": "Data Retrived Successfully",
			"slots": slots,
			"days": days
		})
	}else{
		res.json({
			"code": 201,
			"message": "No accent Found"
		})
	}
})

router.get("/getTeacherSlot", urlencodedParser, async(req, res) => {
	const teacher = await prisma.teacher.findMany({ where : { jwt : req.headers.authtoken }})
	if(teacher.length > 0){
		const selecteddays = await prisma.$queryRaw`SELECT DISTINCT days.* FROM agenda INNER JOIN days ON days.id = agenda.dayid WHERE agenda.status = 0 AND agenda.teacherid = ${teacher[0].teacherid}`
		if(selecteddays.length > 0){
			const selectedSlots = await prisma.agenda.findMany({
				where : {
					status : 0,
					teacherid : teacher[0].teacherid
				}
			})
			if(selectedSlots.length > 0){
				res.json({
					"code": 200,
					"message": "Data Retrived Successfully",
					"selecteddays": selecteddays,
					"selectedSlots" : selectedSlots
				})
			}else{
				res.json({
					"code": 201,
					"message": "No Slot Found"
				})
			}
		}else{
			res.json({
				"code": 201,
				"message": "No Day Found"
			})
		}
	}else{
		res.json({
			"code": 201,
			"message": "No teacher found"
		})
	}
})

module.exports = router
