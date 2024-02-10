const express = require('express')
var bodyParser = require('body-parser')
var mail = require("../../constants/email")
var fs = require('fs')
const { uploadFile } = require('../../middleware/multerupload')

/******** Prisma Client *******/
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

/******** Json Parser *******/
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false})

/******** Creating Routing *******/
var router = express.Router()

router.post("/getlessonplan", urlencodedParser, async(req, res) => {
	const course = await prisma.course.findUnique({where : { courseid : parseInt(req.body.courseid) }})
	if(course == null || course == undefined || course == NaN){
		return res.json({
			"code": 201,
			"message": "Invalid course id"
		})
	}
	const teacher = await prisma.teacher.findMany({ where : { jwt : req.headers.authtoken }})
	if(teacher.length < 1){
		return res.json({
			"code": 201,
			"message": "Invalid teacher token"
		})
	}
	const teachercourse = await prisma.teachercourses.findMany({
		where : {
			courseid : parseInt(req.body.courseid),
			teacherid : teacher[0].teacherid
		}
	})
	console.log(teachercourse)
	const lessons = await prisma.lesson.findMany({
		where : {
			teachercourseid : teachercourse[0].teachercoursesid,
		}
	})
	res.json({
		"code": 200,
		"message": "Lessons retrived successfully",
		"lessons": lessons,
		"course" : course
	})
});

router.post("/createlessonplan", uploadFile('courses/').any('files'), async(req, res) => {
	const course = await prisma.course.findUnique({where : { courseid : parseInt(req.body.courseid) }})
	if(course == null || course == undefined || course == NaN){
		return res.json({
			"code": 201,
			"message": "Invalid course id"
		})
	}
	const teacher = await prisma.teacher.findMany({ where : { jwt : req.headers.authtoken }})
	if(teacher.length < 1){
		return res.json({
			"code": 201,
			"message": "Invalid teacher token"
		})
	}
	const filesURL = [];
	req.files.forEach(file => {
		filesURL.push(`courses/${file.filename}`)
	})
	const teachercourse = await prisma.teachercourses.findMany({
		where : {
			courseid : parseInt(req.body.courseid),
			teacherid : teacher[0].teacherid
		}
	})
	console.log(teachercourse)
	const lesson = await prisma.lesson.create({
		data : {
			teachercourseid : teachercourse[0].teachercoursesid,
			lessonno : parseInt(req.body.selectedLesson),
			title : req.body.lessontitle,
			description : req.body.lessondescription,
			attachments : JSON.stringify(filesURL),
			status : 0
		}
	})
	const lessons = await prisma.lesson.findMany({
		where : {
			teachercourseid : teachercourse[0].teachercoursesid,
		}
	})
	res.json({
		"code": 200,
		"message": "Lessons retrived successfully",
		"lessons": lessons
	})
});

router.post("/getlessonplandetails", urlencodedParser, async(req, res) => {
	const teacher = await prisma.teacher.findMany({ where : { jwt : req.headers.authtoken }})
	if(teacher.length < 1){
		return res.json({
			"code": 201,
			"message": "Invalid teacher token"
		})
	}
	const lesson = await prisma.lesson.findUnique({
		where : {
			id : parseInt(req.body.lessonid),
		}
	})
	res.json({
		"code": 200,
		"message": "Lessons retrived successfully",
		"lesson": lesson,
	})
});

router.post("/updatelessonplan", urlencodedParser, async(req, res) => {
	const lesson = await prisma.lesson.findUnique({
		where : {
			id : parseInt(req.body.lessonid)
		},
		include:{
			teachercourses : {
				include : {
					course : true
				}
			}
		}
	})
	if(lesson == null || lesson == undefined || lesson == NaN){
		return res.json({
			"code": 201,
			"message": "Invalid lesson id"
		})
	}
	const teacher = await prisma.teacher.findMany({ where : { jwt : req.headers.authtoken }})
	if(teacher.length < 1){
		return res.json({
			"code": 201,
			"message": "Invalid teacher token"
		})
	}

	var data = {
			title : req.body.lessontitle,
			description : req.body.lessondescription,
		}
	if(req.body.filescount > 0){

		var dir = `assets/courses/${lesson.teachercourses.course.coursename}/${teacher[0].firstname}${teacher[0].lastname}/${req.body.lessontitle}`;
		if (!fs.existsSync(dir)){
		    fs.mkdirSync(dir, { recursive: true });
		}
		const filesURL = [];
		for (var i = 0; i < req.body.filescount; i++){
			req.files[i].mv(`assets/courses/${lesson.teachercourses.course.coursename}/${teacher[0].firstname}${teacher[0].lastname}/${req.body.lessontitle}/${req.files[i].name}`, (err) => { if (err) { console.log(err) }});
			filesURL.push(`courses/${lesson.teachercourses.course.coursename}/${teacher[0].firstname}${teacher[0].lastname}/${req.body.lessontitle}/${req.files[i].name}`)
		}
		data["attachments"] = JSON.stringify(filesURL)
	}

	const updatedlesson = await prisma.lesson.update({
		where : {
			id : parseInt(req.body.lessonid)
		},
		data : data
	})
	res.json({
		"code": 200,
		"message": "Lessons updated successfully",
		"lesson": updatedlesson
	})
});

router.get("/getstudentlessonplan", async(req, res) => {
	const student = await prisma.student.findMany({ where : { jwt : req.headers.authtoken }})
	if(student.length < 1){
		return res.json({
			"code": 201,
			"message": "Invalid teacher token"
		})
	}
	const myClass = await prisma.classstudents.findMany({
		where : {
			studentid : student[0].studentid
		},
		include : {
			class : {
				include : {
					_count : {
						select  : { liveclass : true},
					},
					course : true,
					teacher : true,
				}
			},
		}
	})
	if(myClass.length < 1){
		return res.json({
			"code": 201,
			"message": "No class found"
		})
	}
	const teachercourse = await prisma.teachercourses.findMany({
		where : {
			courseid : myClass[0].class.courseid,
			teacherid :  myClass[0].class.teacherid
		}
	})
	const lessons = await prisma.lesson.findMany({
		where : {
			teachercourseid : teachercourse[0].teachercoursesid,
		},
		take : myClass[0].class._count.liveclass
	})
	res.json({
		"code": 200,
		"message": "Lessons retrived successfully",
		"lessons": lessons,
		"course" : myClass[0].class.course,
		"teacher" : myClass[0].class.teacher
	})
});

router.post("/getstudentlessonplandetails", urlencodedParser, async(req, res) => {
	const student = await prisma.student.findMany({ where : { jwt : req.headers.authtoken }})
	if(student.length < 1){
		return res.json({
			"code": 201,
			"message": "Invalid student token"
		})
	}
	const myClass = await prisma.classstudents.findMany({
		where : {
			studentid : student[0].studentid
		},
		include : {
			class : {
				include : {
					_count : {
						select  : { liveclass : true},
					},
					course : true,
					teacher : true,
				}
			},
		}
	})
	const lesson = await prisma.lesson.findUnique({
		where : {
			id : parseInt(req.body.lessonid),
		},
		include : {
			teachercourses : true
		}
	})

	if(lesson.lessonno > myClass[0].class._count.liveclass || lesson.teachercourses.courseid != myClass[0].class.courseid){
		return res.json({
			"code": 201,
			"message": "Invalid access"
		})
	}else{
		res.json({
			"code": 200,
			"message": "Lessons retrived successfully",
			"lesson": lesson,
		})
	}
});

module.exports = router