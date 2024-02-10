const express = require('express')
var bodyParser = require('body-parser')

/******** Prisma Client *******/
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

var router = express.Router()

var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false})

router.post("/creategroup", urlencodedParser, async(req, res) => {
	var selectedStudents = JSON.parse(req.body.selectedStudents)
	var selectedSlots = JSON.parse(req.body.selectedSlots)
	const college = await prisma.college.findMany({ where : { jwt : req.headers.authtoken }})
	if(college.length > 0){
		console.log(college[0].collegeid)
		const group = await prisma.groups.create({
			data : {
				groupname : college[0].collegename+" Group "+selectedStudents[0].coursename.toString(),
				createdby : college[0].collegeid,
				packageid : parseInt(req.body.selectedPackage),
				subscriptionid : parseInt(req.body.selectedSubscription),
				courseid : parseInt(req.body.selectedCourse),
				remainingclasses : parseInt(req.body.noofclases),
				status : 1,
			}
		})
		for (var i = 0; i < selectedStudents.length; i++) {
			await prisma.groupstudents.create({
				data : {
					groupid : group.groupid,
					studentid : parseInt(selectedStudents[i].studentid),
					groupstudentstatus : 0
				}
			})
			await prisma.student.update({
				where : {
					studentid : parseInt(selectedStudents[i].studentid)
				},
				data : {
					groupstatus : 0
				}
			})
		}
		for (var i = 0; i < selectedSlots.length; i++) {
			await prisma.grouptimings.create({
				data : {
					groupid : group.groupid,
					slotid : parseInt(selectedSlots[i].slot.slotid),
					dayid : parseInt(selectedSlots[i].day.id)
				}
			})
		}
		res.json({
			"code": 200,
			"message": "Group Created Successfully"
		})
	}else{
		res.json({
			"code": 201,
			"message": "No Login User Found"
		})
	}
})

router.get("/grouplist", async(req, res) => {
	const college = await prisma.college.findMany({ where : { jwt : req.headers.authtoken }})
	if(college.length > 0){
		console.log(college[0].collegeid)
		const groups = await prisma.groups.findMany({
			where : {
				createdby : college[0].collegeid
			},
			include : {
				college : true,
				course : {
					include : {
						accent : true
					}
				},
				classgroups : {
					include : {
						class : true
					}
				}
			}
		})
		console.log(groups)
		res.json({
			"code": 200,
			"message": "Groups Retrived Successfully",
			"groups": groups
		})
	}else{
		res.json({
			"code": 201,
			"message": "No Login User Found"
		})
	}
})

router.get("/teachergrouplist", async(req, res) => {
	const teacher = await prisma.teacher.findMany({ where : { jwt : req.headers.authtoken }})
	if(teacher.length > 0){
		console.log(teacher[0].teacherid)
		const groups = await prisma.groups.findMany({
			where : {
				classgroups : {
					some : {
						class : {
							teacherid : teacher[0].teacherid
						}
					}
				}
			},
			include : {
				college : true,
				course : {
					include : {
						accent : true
					}
				}
			}
		})
		console.log(groups)
		res.json({
			"code": 200,
			"message": "Groups Retrived Successfully",
			"groups": groups
		})
	}else{
		res.json({
			"code": 201,
			"message": "No Login User Found"
		})
	}
})

router.post("/groupdetails", urlencodedParser, async(req, res) => {
	var whereCondition = {}
	const college = await prisma.college.findMany({ where : { jwt : req.headers.authtoken }})
	if(college.length < 1){
		const teacher = await prisma.teacher.findMany({ where : { jwt : req.headers.authtoken }})
		if(teacher.length < 1){
			res.json({
				"code": 201,
				"message": "Please Login Again"
			})
			return
		}else{
			whereCondition = {
				groupid : parseInt(req.body.groupid),
				classgroups : {
					some : {
						class : {
							teacherid : teacher[0].teacherid
						}
					}
				}
			}
		}
	}else{
		whereCondition = {
			groupid : parseInt(req.body.groupid),
			createdby : college[0].collegeid
		}
	}
	const group = await prisma.groups.findMany({
		where : whereCondition,
		include : {
			college : true,
			course : {
				include : {
					accent : true
				}
			},
			packages : true,
			subcriptions : true,
			groupstudents : {
				include : {
					student : true
				}
			}
		}
	})
	if(group.length > 0){
		res.json({
			"code": 200,
			"message": "Groups Retrived Successfully",
			"group": group[0]
		})
	}else{
		res.json({
			"code": 202,
			"message": "Invalid Requesd for Group Details",
		})
	}
})

router.get("/avaliablegroups", urlencodedParser, async(req, res) => {
	const teacher = await prisma.teacher.findFirst({ 
		where : {
			jwt : req.headers.authtoken 
		},
		include : {
			teachercourses : {
				include : {
					course : true
				}
			}
		}
	})
	let teacherCourses = []
	teacher.teachercourses.forEach(course => {
		teacherCourses.push(course.course)
	})
	let filteredGroups = []
	if(teacher){
		if(teacher.university == null){
			const groups = await prisma.groups.findMany({
				where : {
					status : 1,
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
					},
					groupstudents : true,
					grouptimings : {
						include : {
							slots : true,
							days : true
						}
					}
				},
				orderBy : {
					groupid : 'desc'
				}
			})
			groups.forEach(group => {
				if(teacherCourses.filter(course => course.courseid = group.course.courseid)){
					filteredGroups.push(group)
				}
			})
		}else{
			const groups = await prisma.groups.findMany({
				where : {
					status : 1,
					subcriptions : {
						collegeId : teacher.university
					}
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
					},
					groupstudents : true,
					grouptimings : {
						include : {
							slots : true,
							days : true
						}
					}
				},
				orderBy : {
					groupid : 'desc'
				}
			})
			groups.forEach(group => {
				let filteredCourses = teacherCourses.filter(course => course.courseid == group.course.courseid)
				if(filteredCourses.length > 0){
					filteredGroups.push(group)
				}
			})
		}
		console.log(filteredGroups)
		res.json({
			"code": 200,
			"message": "Avaliable groups retrived successfully",
			filteredgroups : filteredGroups
		})
	}else{
		res.json({
			"code": 201,
			"message": "Please Login Again"
		})
	}
})

router.post("/acceptgroupbyteacher", urlencodedParser, async(req, res) => {
	const teacher = await prisma.teacher.findFirst({ where : { jwt : req.headers.authtoken }})
	if(teacher){
		const group = await prisma.groups.findUnique({
			where : {
				groupid : parseInt(req.body.groupid),
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
				},
				packages : true,
				groupstudents : true,
				grouptimings : {
					include : {
						slots : true,
						days : true
					}
				}
			},
		})
		let teacherClasses = await prisma.renamedclass.findMany({
			where : {
				teacherid : teacher.teacherid
			},
			include : {
				classtiming : {
					include : {
						slots : true,
						days : true
					}
				}
			}
		})
		let flag = false
		teacherClasses.forEach(teacherclass => {
			teacherclass.classtiming.forEach(slot => {
				let filteredSlot = group.grouptimings.filter(groupslot => groupslot.slotid == slot.slotid)
				let filteredDay = group.grouptimings.filter(groupslot => groupslot.dayid == slot.dayid)
				if(filteredSlot.length > 0 && filteredDay.length > 0){
					flag = true
				}
			})
		})
		if(flag){
			res.json({
				"code": 202,
				"message": "You're already booked for this period.",
			})
		}else{
			let startDate = new Date()
			let endDate = new Date()
			endDate.setMonth(endDate.getMonth() + group.packages.timing)
			const renamedclass = await prisma.renamedclass.create({
				data : {
					teacherid : teacher.teacherid,
					courseid : group.courseid,
					packageid : group.packageid,
					subscriptionid : group.subscriptionid,
					noofstudents : group.groupstudents.length,
					startdate : startDate,
					endate : endDate,
					remainingclasses : group.remainingclasses,
					classstatus : 0
				}
			})
			const classgroups = await prisma.classgroups.create({
				data : {
					classid : renamedclass.classid,
					groupid : group.groupid,
					status : 0
				}
			})
			group.groupstudents.forEach(student => {
				let classStudent = createClassStudents({
					classid : renamedclass.classid,
					studentid : student.studentid,
					status : 0
				})
			})
			group.grouptimings.forEach(slot => {
				let grouptiming = createClassTiming({
					classid : renamedclass.classid,
					slotid : slot.slotid,
					dayid : slot.dayid,
					classtimingstatus : 0
				})
			})
			let updatedgroup = await prisma.groups.update({
				where : {
					groupid : parseInt(req.body.groupid),
				},
				data : {
					status : 0
				}
			})
			res.json({
				"code": 200,
				"message": "Class accepted successfully",
			})
		}
	}else{
		res.json({
			"code": 201,
			"message": "Please Login Again"
		})
	}
})

async function createClassStudents(data){
	return await prisma.classstudents.create({
		data : data
	})
}

async function createClassTiming(data){
	return await prisma.classtiming.create({
		data : data
	})
}

module.exports = router