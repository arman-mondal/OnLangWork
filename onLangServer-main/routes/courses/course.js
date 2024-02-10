const express = require('express')
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

router.get("/getall", urlencodedParser, async(req, res) => {
	const courses = await prisma.course.findMany({
		where : {
			status : 0
		},
		include : {
			accent : true
		}
	})
	if(courses.length > 0){
		res.json({
			"code": 200,
			"message": "College retrived successfully",
			"courses": courses
		})
	}else{
		res.json({
			"code": 201,
			"message": "No college Found"
		})
	}
})

router.get("/getteachercourses", urlencodedParser, async(req, res) => {
	const teacher = await prisma.teacher.findMany({ where : { jwt : req.headers.authtoken }})
	if(teacher.length > 0){
		const teacherCourses = await prisma.teachercourses.findMany({
			where : {
				teachercoursesstatus : 0,
				teacherid : teacher[0].teacherid
			},
			include : {
				course: {
					include : {
						accent : true
					}
				}
			}
		})
		const courses = await prisma.course.findMany({
			where : {
				status : 0,
			},
			include : {
				accent : true
			}
		})
		let allCourses = []
		courses.forEach(course => {
			var filtered = true
			teacherCourses.forEach(teacherCourse => {
				if(teacherCourse.course.courseid == course.courseid){
					filtered = false
				}
			})
			if(filtered){
				allCourses.push(course)
			}
		})
		res.json({
			"code": 200,
			"message": "Course retrived successfully",
			"courses": allCourses,
			"teacherCourses": teacherCourses
		})
	}else{
		res.json({
			"code": 201,
			"message": "Please Login Again"
		})
	}
})

router.post("/addnewteachercourse", urlencodedParser, async(req, res) => {
	const teacher = await prisma.teacher.findMany({ where : { jwt : req.headers.authtoken }})
	if(teacher.length > 0){
		await prisma.teachercourses.create({
			data : {
				teacherid : teacher[0].teacherid,
				courseid : parseInt(req.body.courseid),
				teachercoursesstatus : 0
			}
		})
		const teacherCourses = await prisma.teachercourses.findMany({
			where : {
				teachercoursesstatus : 0,
				teacherid : teacher[0].teacherid
			},
			include : {
				course: {
					include : {
						accent : true
					}
				}
			}
		})
		const courses = await prisma.course.findMany({
			where : {
				status : 0
			},
			include : {
				accent : true
			}
		})
		let allCourses = []
		courses.forEach(course => {
			var filtered = true
			teacherCourses.forEach(teacherCourse => {
				if(teacherCourse.course.courseid == course.courseid){
					filtered = false
				}
			})
			if(filtered){
				allCourses.push(course)
			}
		})
		res.json({
			"code": 200,
			"message": "Course retrived successfully",
			"courses": allCourses,
			"teacherCourses": teacherCourses
		})
	}else{
		res.json({
			"code": 201,
			"message": "Please Login Again"
		})
	}
})

router.post("/teachercoursedetails", urlencodedParser, async(req, res) => {
	const teacher = await prisma.teacher.findMany({ where : { jwt : req.headers.authtoken }})
	if(teacher.length > 0){
		const classes = await prisma.Renamedclass.findMany({
			where : {
				courseid : parseInt(req.body.courseid),
				teacherid : teacher[0].teacherid
			},
			include : {
				course: {
					include : {
						accent : true
					}
				},
				teacher : true,
				classstudents : true,
				classgroups : {
					include : {
						groups : {
							include : {
								groupstudents : true,
								subcriptions : {
									include : {
										college : true
									}
								}
							}
						}
					}
				}
			}
		})
		res.json({
			"code": 200,
			"message": "Course retrived successfully",
			"classes": classes
		})
	}else{
		res.json({
			"code": 201,
			"message": "Please Login Again"
		})
	}
})

module.exports = router