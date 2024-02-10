const express = require('express')
var bodyParser = require('body-parser')

/******** Prisma Client *******/
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

var router = express.Router()

var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false})

router.get("/getpreload", urlencodedParser, async(req, res) => {
	const courses = await prisma.course.findMany({
		where : {
			status : 0
		}
	})
	if(courses.length > 0){
		res.json({
			"code": 200,
			"message": "Accent Retrived Successfully",
			"courses": courses
		})
	}else{
		res.json({
			"code": 201,
			"message": "No accent Found"
		})
	}
})

router.post("/createassignment", urlencodedParser, async(req, res) => {
	const teacher = await prisma.teacher.findMany({ where : { jwt : req.headers.authtoken }})
	console.log(teacher)
	if(teacher.length > 0){
		let data = {
			course : parseInt(req.body.course),
			teacherid : teacher[0].teacherid,
			name : req.body.name,
			description : req.body.description,
			assignmentquestions : {
				create : []
			}
		}
		let questions = JSON.parse(req.body.questions)
		questions.forEach(question => {
			let myquestion = {
				question : question.question,
				ismultipechoice : question.ismultipechoice,
				mcqs : {
					create : []
				}
			}
			if(question.ismultipechoice){
				question.mcqs.forEach(mcq => {
					myquestion.mcqs.create.push({
						option : mcq.option,
						iswrite : mcq.iswrite
					})
				})
			}
			data.assignmentquestions.create.push(myquestion)
		});
		console.log(JSON.stringify(data))

		const assignment = await prisma.assignment.create({
			data : data
		})
		res.json({
			"code": 200,
			"message": "Assignment Created Successfully",
			assignment : assignment
		})
	}else{
		res.json({
			"code": 201,
			"message": "Please try again"
		})
	}
})

router.get("/getassignments", urlencodedParser, async(req, res) => {
	const teacher = await prisma.teacher.findMany({ where : { jwt : req.headers.authtoken }})
	console.log(teacher)
	if(teacher.length > 0){
		const assignments = await prisma.assignment.findMany({
			where : {
				teacherid : teacher[0].teacherid
			},
			include : {
				course_assignmentTocourse : true
			},
			orderBy : {
				id : 'desc'
			}
		})
		const classes = await prisma.renamedclass.findMany({
			where : {
				teacherid : teacher[0].teacherid
			},
			include : {
				course : {
					include : {
						accent : true
					}
				},
				subcriptions : {
					include : {
						college : true
					}
				}
			}
		})
		res.json({
			"code": 200,
			"message": "Assignments Retrived Successfully",
			assignments : assignments,
			classes : classes
		})
	}else{
		res.json({
			"code": 201,
			"message": "Please try again"
		})
	}
})

router.get("/getassignmentdetails/:id", urlencodedParser, async(req, res) => {
	const teacher = await prisma.teacher.findMany({ where : { jwt : req.headers.authtoken }})
	console.log(teacher)
	if(teacher.length > 0){
		const courses = await prisma.course.findMany({
			where : {
				status : 0
			}
		})
		const assignment = await prisma.assignment.findUnique({
			where : {
				id : parseInt(req.params.id)
			},
			include : {
				course_assignmentTocourse : true,
				assignmentquestions : {
					include : {
						mcqs : true
					}
				},

			}
		})
		res.json({
			"code": 200,
			"message": "Assignments Retrived Successfully",
			courses : courses,
			assignment : assignment
		})
	}else{
		res.json({
			"code": 201,
			"message": "Please try again"
		})
	}
})

router.post("/updateassignment", urlencodedParser, async(req, res) => {
	const teacher = await prisma.teacher.findMany({ where : { jwt : req.headers.authtoken }})
	console.log(teacher)
	if(teacher.length > 0){
		let assigment = JSON.parse(req.body.assignment)
		console.log(assigment)
		let updateAssignment = await prisma.assignment.update({
			where : {
				id : parseInt(assigment.id)
			},
			data : {
				course : parseInt(assigment.course),
				name : assigment.name,
				description : assigment.description,
			}
		})
		assigment.assignmentquestions.forEach(question => {
			let updatedQuestion = updateQuestion({
				question : question.question,
				ismultipechoice : question.ismultipechoice
			},question.id)
			if(question.ismultipechoice){
				question.mcqs.forEach(mcq => {
					let updatedMCQ = updateMCQ({
						option : mcq.option,
						iswrite : mcq.iswrite
					},mcq.id)
				})
			}
		})

		let questions = JSON.parse(req.body.questions)
		let data = []
		questions.forEach(question => {
			let myquestion = {
				assingment : assigment.id,
				question : question.question,
				ismultipechoice : question.ismultipechoice,
				mcqs : {
					create : []
				}
			}
			if(question.ismultipechoice){
				question.mcqs.forEach(mcq => {
					myquestion.mcqs.create.push({
						option : mcq.option,
						iswrite : mcq.iswrite
					})
				})
			}
			data.push(createQuestion(myquestion))
		});
		res.json({
			"code": 200,
			"message": "Assignments Updated Successfully",
			updateAssignment : updateAssignment
		})
	}else{
		res.json({
			"code": 201,
			"message": "Please try again"
		})
	}
})

async function createQuestion(data){
	return await prisma.assignmentquestions.create({
		data : data
	})
}

async function updateQuestion(data,questionId){
	return await prisma.assignmentquestions.update({
		where : {
			id : questionId
		},
		data : data
	})
}

async function updateMCQ(data,mcqId){
	return await prisma.mcqs.update({
		where : {
			id : mcqId
		},
		data : data
	})
}

router.post("/assignassignment", urlencodedParser, async(req, res) => {
	const teacher = await prisma.teacher.findMany({ where : { jwt : req.headers.authtoken }})
	console.log(teacher)
	if(teacher.length > 0){
		const classassignment = await prisma.classassignment.create({
			data : {
				assignment : parseInt(req.body.assignmentId),
				class : parseInt(req.body.classId),
				duedate : new Date(req.body.dueDate),
				status : 0
			}
		})
		res.json({
			"code": 200,
			"message": "Assignment Created Successfully",
		})
	}else{
		res.json({
			"code": 201,
			"message": "Please try again"
		})
	}
})

router.get("/getstudentsassignments", urlencodedParser, async(req, res) => {
	const student = await prisma.student.findMany({ where : { jwt : req.headers.authtoken }})

	if(student.length > 0){
		const assignments = await prisma.classstudents.findFirst({
			where : {
				studentid : student[0].studentid
			},
			include : {
				class : {
					include : {
						classassignment : {
							include : {
								assignment_assignmentToclassassignment : {
									include : {
										course_assignmentTocourse : true
									}
								},
								submitedassignments : {
									where : {
										student : student[0].studentid
									}
								}
							}
						}
					}
				}
			}
		})	
		console.log(JSON.stringify(assignments))
		res.json({
			"code": 200,
			"message": "Assignments Retrived Successfully",
			assignments : assignments,
		})
	}else{
		res.json({
			"code": 201,
			"message": "Please try again"
		})
	}
})

router.get("/getstudentassignmentdetails/:id", urlencodedParser, async(req, res) => {
	const student = await prisma.student.findMany({ where : { jwt : req.headers.authtoken }})
	console.log(student)
	if(student.length > 0){
		const assignment = await prisma.assignment.findUnique({
			where : {
				id : parseInt(req.params.id)
			},
			include : {
				course_assignmentTocourse : true,
				assignmentquestions : {
					include : {
						mcqs : true
					}
				},

			}
		})
		console.log(assignment)
		res.json({
			"code": 200,
			"message": "Assignments Retrived Successfully",
			assignment : assignment
		})
	}else{
		res.json({
			"code": 201,
			"message": "Please try again"
		})
	}
})

router.post("/submitassignment", urlencodedParser, async(req, res) => {
	const student = await prisma.student.findFirst({ where : { jwt : req.headers.authtoken }})
	console.log(student)
	if(student){
		let submitedassignments = await prisma.submitedassignments.create({
			data : {
				student : student.studentid,
				assignment : parseInt(req.body.assignment),
				classassignment : parseInt(req.body.classassignment),
				status : 0
			}
		})
		let answers = JSON.parse(req.body.answers)
		console.log(answers)
		let data = []
		answers.forEach(answer => {
			data.push({
				submittedassignment : submitedassignments.id,
				question : answer.question,
				answer : answer.answer
			})
		})
		let submittedassignmentanswers = await prisma.submittedassignmentanswers.createMany({
			data : data
		})
		
		res.json({
			"code": 200,
			"message": "Assignments Updated Successfully",
			submitedassignments : submitedassignments,
			submittedassignmentanswers : submittedassignmentanswers
		})
	}else{
		res.json({
			"code": 201,
			"message": "Please try again"
		})
	}
})

module.exports = router