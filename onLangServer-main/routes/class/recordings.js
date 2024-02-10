const express = require('express')
var bodyParser = require('body-parser')
const { uploadRecordingFile } = require('../../middleware/upload')

/******** Prisma Client *******/
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

var router = express.Router()

var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false})

router.post("/upload", uploadRecordingFile('recordings/').single('recording'), async(req, res) => {
	const teacher = await prisma.teacher.findMany({ where : { jwt : req.headers.authtoken }})
	if(teacher.length > 0){
		const liveClass = await prisma.liveclass.findMany({
            where : {
                uuid : req.body.uuid
            }
        })
        var today = new Date();
        await prisma.recordings.create({
            data: {
                teacehrid : teacher[0].teacherid,
                liveclassid : liveClass[0].liveclassid,
                classid : parseInt(req.body.classid),
                title : "Recording " + today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+ " " + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds(),
                url : `recordings/${req.file.filename}`,
                status : 0
            }
        })
        res.json({
			"code": 200,
			"message": "Recording Upload Successfully successfully",
		})
	}else{
		res.json({
			"code": 201,
			"message": "Please Login Again"
		})
	}
})

router.post("/getTeacherRecordingsforliveclass", urlencodedParser, async(req, res) => {
	const teacher = await prisma.teacher.findMany({ where : { jwt : req.headers.authtoken }})
	if(teacher.length > 0){
        const recordings = await prisma.recordings.findMany({
            where : {
                status : 0,
                teacehrid : teacher[0].teacherid,
                liveclassid : parseInt(req.body.liveclassid)
            }
        })
        console.log(recordings)
        res.json({
			"code": 200,
			"message": "Recording Upload Successfully successfully",
            "recordings" : recordings
		})
	}else{
		res.json({
			"code": 201,
			"message": "Please Login Again"
		})
	}
})

module.exports = router