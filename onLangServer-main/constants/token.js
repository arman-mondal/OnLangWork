/******** Prisma Client *******/
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = async function verifyToken(res,token){
	const college = await prisma.college.findMany({
		where : {
			jwt : token,
			status : 0
		}
	})
	if(college.length > 0){
		console.log("valid college token");
		res.json({
			"code": 200,
			"message": "Valid college Token",
			"type" : 1,
			"user" : college
		})
	}else{
		const student = await prisma.student.findMany({
			where : {
				jwt : token,
				status : 0
			}
		})
		if(student.length > 0){
			console.log("valid student token");
			res.json({
				"code": 200,
				"message": "Valid student Token",
				"type" : 2,
				"user" : student
			})
		}else{
			const teacher = await prisma.teacher.findMany({
				where : {
					jwt : token,
					status : 0
				}
			})
			if(teacher.length > 0){
				console.log("valid teacher token");
				res.json({
					"code": 200,
					"message": "Valid teacher Token",
					"type" : 3,
					"user" : teacher
				})
			}else{
				console.log("invalid token");
				res.json({
					"code": 201,
					"message": "Invalid Token"
				})
			}
		}
	}
};