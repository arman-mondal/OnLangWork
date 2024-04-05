const express = require("express");
var bodyParser = require("body-parser");
const multer=require('multer');
const fs = require("fs");
/******** Prisma Client *******/
const {
    PrismaClient
} = require("@prisma/client");
const prisma = new PrismaClient();
const path = require('path'); // Add this line
var router = express.Router();

var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({
    extended: false
});
const upload = require("multer")();
const DIR = "assets/";
const dropboxToken =
    "sl.BvYAG8MabqB6_O9gHYT0cFTkw2vMgW8f2ip-YU60evFlI0ctBrKigYXEN16wNI1vHVZaneXUigqf0Wbnz3NHCSRfvZYRmkIb8OmoHcTT9Gp7JyGrjtQ3yo9l0rLCE-vzbUN-Z0v_tGUc";
const {
    Dropbox
} = require("dropbox");

router.get("/getclasseslist", async (req, res) => {
    const college = await prisma.college.findMany({
        where: {
            jwt: req.headers.authtoken
        },
    });
    if (college.length > 0) {
        const classes = await prisma.Renamedclass.findMany({
            where: {
                subcriptions: {
                    collegeId: college[0].collegeid,
                },
            },
            include: {
                course: {
                    include: {
                        accent: true,
                    },
                },
            },
        });
        res.json({
            code: 200,
            message: "Classes List retrived successfully",
            classes: classes,
        });
    } else {
        res.json({
            code: 201,
            message: "Please Login Again",
        });
    }
});

router.get("/getteacherclasseslist", async (req, res) => {
    const teacher = await prisma.teacher.findMany({
        where: {
            jwt: req.headers.authtoken
        },
    });
    if (teacher.length > 0) {
        const classes = await prisma.Renamedclass.findMany({
            where: {
                teacherid: teacher[0].teacherid,
            },
            include: {
                course: {
                    include: {
                        accent: true,
                    },
                },
            },
        });
        res.json({
            code: 200,
            message: "Classes List retrived successfully",
            classes: classes,
        });
    } else {
        res.json({
            code: 201,
            message: "Please Login Again",
        });
    }
});

router.post("/getcalssdetails", urlencodedParser, async (req, res) => {
    var whereCondition = {};
    const college = await prisma.college.findMany({
        where: {
            jwt: req.headers.authtoken
        },
    });
    if (college.length < 1) {
        const teacher = await prisma.teacher.findMany({
            where: {
                jwt: req.headers.authtoken
            },
        });
        if (teacher.length < 1) {
            res.json({
                code: 201,
                message: "Please Login Again",
            });
            return;
        } else {
            whereCondition = {
                classid: parseInt(req.body.classid),
                teacherid: teacher[0].teacherid,
            };
        }
    } else {
        whereCondition = {
            classid: parseInt(req.body.classid),
            subcriptions: {
                collegeId: college[0].collegeid,
            },
        };
    }
    const classes = await prisma.Renamedclass.findMany({
        where: whereCondition,
        include: {
            teacher: true,
            course: {
                include: {
                    accent: true,
                },
            },
            packages: true,
            subcriptions: true,
            classstudents: {
                include: {
                    student: true,
                },
            },
            classtiming: {
                include: {
                    slots: true,
                    days: true,
                },
            },
            liveclass: {
                include: {
                    teacher: true,
                    liveclassstudents: {
                        include: {
                            student: true,
                        },
                    },
                },
            },
        },
    });
    if (classes.length > 0) {
        res.json({
            code: 200,
            message: "Class details retrived successfully",
            classes: classes[0],
        });
    } else {
        res.json({
            code: 202,
            message: "Invalid Requesd for Class Details",
        });
    }
});

router.post("/getlivecalssdetails", urlencodedParser, async (req, res) => {
    const college = await prisma.college.findMany({
        where: {
            jwt: req.headers.authtoken
        },
    });
    if (college.length == 0) {
        const teacher = await prisma.teacher.findMany({
            where: {
                jwt: req.headers.authtoken
            },
        });
        if (teacher.length == 0) {
            res.json({
                code: 201,
                message: "Please Login Again",
            });
            return;
        }
    }
    const classes = await prisma.liveclass.findUnique({
        where: {
            liveclassid: parseInt(req.body.classid),
        },
        include: {
            teacher: true,
            liveclassstudents: {
                include: {
                    student: true,
                },
            },
        },
    });
    res.json({
        code: 200,
        message: "Class details retrived successfully",
        classes: classes,
    });
});

router.post("/getTeacherClasses", urlencodedParser, async (req, res) => {
    const myClass =
        await prisma.$queryRaw`SELECT * FROM class INNER JOIN course ON course.courseid = class.courseid INNER JOIN classtiming ON classtiming.classid = class.classid INNER JOIN slots ON slots.slotid = classtiming.slotid INNER JOIN packages ON packages.packageid = class.packageid WHERE class.teacherid = ${req.body.teacherid} AND classtiming.dayid = ${req.body.dayid}`;
    if (myClass.length > 0) {
        res.json({
            code: 200,
            message: "Classes Retrived Successfully",
            classes: myClass,
        });
    } else {
        res.json({
            code: 201,
            message: "No Class Found",
        });
    }
});

router.post("/getTeacherTimetable", urlencodedParser, async (req, res) => {
    const myClass =
        await prisma.$queryRaw`SELECT * FROM class INNER JOIN course ON course.courseid = class.courseid INNER JOIN classtiming ON classtiming.classid = class.classid INNER JOIN slots ON slots.slotid = classtiming.slotid INNER JOIN packages ON packages.packageid = class.packageid WHERE class.teacherid = ${req.body.teacherid}`;
    if (myClass.length > 0) {
        const days = await prisma.days.findMany();
        res.json({
            code: 200,
            message: "Classes Retrived Successfully",
            classes: myClass,
            days: days,
        });
    } else {
        res.json({
            code: 201,
            message: "No Class Found",
        });
    }
});
router.post("/getStudentClasses", urlencodedParser, async (req, res) => {
    const d = new Date(req.body.date);
    console.log(d);

    // Map JavaScript day value to your database format
    const dayToDBDay = {
        0: 7, // Sunday to 7
        1: 1, // Monday to 1
        2: 2, // Tuesday to 2
        3: 3, // Wednesday to 3
        4: 4, // Thursday to 4
        5: 5, // Friday to 5
        6: 6 // Saturday to 6
    };

    // Get the day from the date object and convert it to your database format
    const n = dayToDBDay[d.getDay()];

    const myClass = await prisma.$queryRaw`SELECT DISTINCT(class.classid), class.*, course.coursename, slots.starttime, slots.endtime, packages.* FROM class INNER JOIN course ON course.courseid = class.courseid INNER JOIN classstudents ON classstudents.classid = class.classid INNER JOIN classtiming ON classtiming.classid = class.classid INNER JOIN slots ON slots.slotid = classtiming.slotid INNER JOIN packages ON packages.packageid = class.packageid WHERE classstudents.studentid = ${req.body.studentid} AND classstudents.status = 0 AND classtiming.dayid = ${Number(n)}`;

    if (myClass.length > 0) {
        res.json({
            "code": 200,
            "message": "Classes Retrieved Successfully",
            "classes": myClass
        });
    } else {
        res.json({
            "code": 201,
            "message": "No Class Found"
        });
    }
});


router.post("/getStudentTimetable", urlencodedParser, async (req, res) => {
    const myClass =
        await prisma.$queryRaw`SELECT DISTINCT(class.classid), class.*, course.coursename, slots.starttime, slots.endtime, classtiming.dayid FROM class INNER JOIN course ON course.courseid = class.courseid INNER JOIN classstudents ON classstudents.classid = class.classid INNER JOIN classtiming ON classtiming.classid = class.classid INNER JOIN slots ON slots.slotid = classtiming.slotid WHERE classstudents.studentid = ${req.body.studentid}`;
    if (myClass.length > 0) {
        const days = await prisma.days.findMany();
        res.json({
            code: 200,
            message: "Classes Retrived Successfully",
            classes: myClass,
            days: days,
        });
    } else {
        res.json({
            code: 201,
            message: "No Class Found",
        });
    }
});

router.get("/getclassinfo/:classid", async (req, res) => {
    const teacher = await prisma.teacher.findMany({
        where: {
            jwt: req.headers.authtoken
        },
    });
    if (!teacher) {
        const student = await prisma.student.findMany({
            where: {
                jwt: req.headers.authtoken
            },
        });
        if (!student) {
            res.json({
                code: 201,
                message: "No live class found",
            });
        }
    }

    const classInfo = await prisma.Renamedclass.findFirst({
        where: {
            classid: parseInt(req.params.classid),
        },
        include: {
            course: {
                include: {
                    accent: true,
                },
            },
            subcriptions: {
                include: {
                    college: true,
                },
            },
            classstudents: true,
        },
    });
    res.json({
        code: 200,
        message: "Classes Info Successfully",
        classInfo: classInfo,
    });
});

router.post("/createliveclass", urlencodedParser, async (req, res) => {
    const liveclass = await prisma.liveclass.findMany({
        where: {
            classid: parseInt(req.body.classid),
            teacherid: parseInt(req.body.teacherid),
            status: 0,
        },
    });
    if (liveclass.length > 0) {
        res.json({
            code: 201,
            message: "Class already in progress",
            uuid: liveclass[0].uuid,
        });
    } else {
        const newliveclass = await prisma.liveclass.create({
            data: {
                classid: parseInt(req.body.classid),
                teacherid: parseInt(req.body.teacherid),
                uuid: req.body.uuid,
            },
        });
        await prisma.$queryRaw`UPDATE class SET remainingclasses = remainingclasses - 1 WHERE classid = ${req.body.classid}`;
        res.json({
            code: 200,
            message: "Class Created Successfully",
            classes: newliveclass,
        });
    }
});

router.post("/closeliveclass", urlencodedParser, async (req, res) => {
    const liveclass = await prisma.liveclass.findMany({
        where: {
            uuid: req.body.uuid,
            status: 0,
        },
    });
    await prisma.$queryRaw`delete from liveclassfiles WHERE uuid = ${req.body.uuid}`;
    await prisma.$queryRaw`UPDATE liveclass SET status = 1, endtime = NOW() WHERE uuid = ${req.body.uuid}`;
    if (liveclass.length > 0) {
        await prisma.$queryRaw`UPDATE liveclassstudents SET status = 1,endtime = NOW() WHERE status = 0 AND liveclass = ${liveclass[0].liveclassid}`;
        res.json({
            code: 200,
            message: "Class Closes Successfully",
            classes: liveclass,
        });
    } else {
        res.json({
            code: 202,
            message: "Database Error",
            error: "Not able to get live class",
        });
    }
});

router.post("/joinliveclass", urlencodedParser, async (req, res) => {
    const liveclass = await prisma.liveclass.findMany({
        where: {
            classid: parseInt(req.body.classid),
            status: 0,
        },
    });
    if (liveclass.length > 0) {
        await prisma.liveclassstudents.create({
            data: {
                liveclass: liveclass[0].liveclassid,
                studentid: parseInt(req.body.studentid),
            },
        });
        res.json({
            code: 200,
            message: "Class already in progress",
            uuid: liveclass[0].uuid,
        });
    } else {
        res.json({
            code: 201,
            message: "No live class found",
        });
    }
});

router.get(
    "/getclassforcourse/:courseid",
    urlencodedParser,
    async (req, res) => {
        console.log(req.body);
        const teacher = await prisma.teacher.findMany({
            where: {
                jwt: req.headers.authtoken
            },
        });
        if (teacher.length > 0) {
            const classes = await prisma.Renamedclass.findMany({
                where: {
                    teacherid: teacher[0].teacherid,
                    courseid: parseInt(req.params.courseid),
                },
                include: {
                    course: {
                        include: {
                            accent: true,
                        },
                    },
                    subcriptions: {
                        include: {
                            college: true,
                        },
                    },
                },
            });
            res.json({
                code: 200,
                message: "Classes Retrived Successfully",
                classes: classes,
            });
        } else {
            res.json({
                code: 201,
                message: "No live class found",
            });
        }
    }
);

router.get(
    "/getliveclassforcourse/:classid",
    urlencodedParser,
    async (req, res) => {
        const teacher = await prisma.teacher.findMany({
            where: {
                jwt: req.headers.authtoken
            },
        });
        if (teacher.length > 0) {
            const classes = await prisma.liveclass.findMany({
                where: {
                    teacherid: teacher[0].teacherid,
                    classid: parseInt(req.params.classid),
                },
                include: {
                    class: {
                        include: {
                            course: {
                                include: {
                                    accent: true,
                                },
                            },
                            subcriptions: {
                                include: {
                                    college: true,
                                },
                            },
                        },
                    },
                },
            });
            res.json({
                code: 200,
                message: "Classes Retrived Successfully",
                classes: classes,
            });
        } else {
            res.json({
                code: 201,
                message: "No live class found",
            });
        }
    }
);

router.post("/update-whiteboard", urlencodedParser, async (req, res) => {
    var uuid = req.body.uuid;

    if (uuid != "") {
        await prisma.$queryRaw`UPDATE liveclass SET live_message = ${req.body.data} WHERE uuid = ${req.body.uuid}`;
        res.json({
            code: 200,
            message: "Message updated successfully",
            classes: req.body.uuid,
        });
    } else {
        res.json({
            code: 201,
            message: "No uuid found",
        });
    }
});

router.get("/live-class-files/:uuid", urlencodedParser, async (req, res) => {
    console.log(req.params.uuid)
    try {
        const files = await prisma.liveclassfiles.findMany({
            where: {
                uuid: req.params.uuid
            }
        })
        res.json({
            code: 200,
            message: "Files Retrived Successfully",
            classes: files,
        });
    } catch (err) {
        return res.json({
            code: 401,
            message: "Error",
            classes: err,
        });
    }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // const uploadPath = req.body.uploadPath || './uploads/'; // Default path is './uploads/'
    const uploadPath = './assets/uploads/'+req.body.uuid+"/"; // Default path is './uploads/'
    console.log(uploadPath)
    // Create the folder if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const customFileName = 'class-' + Date.now() + path.extname(file.originalname);
    cb(null, customFileName);
  }
});

const uploadFile = multer({
  storage: storage
});


router.post("/upload-file", uploadFile.single('file'), async (req, res) => {
    var uuid = req.body.uuid;
    // const dropbox = new Dropbox({
    //     accessToken: dropboxToken
    // });
    // var uploadResponse = await dropbox.filesUpload({
    //     path: `/${uuid}/${fileName}`,
    //     contents: fileBuffer,
    // });

    // console.log(uploadResponse.result.path_display);
    // const sharedLinkResponse = await dropbox.sharingCreateSharedLink({
    //     path: uploadResponse.result.path_display,
    // });
    const sharedLink = "https://onlang.net:3001/backend/uploads/"+req.body.uuid+"/"+req.file.filename;
    const type = req.body.type;
    const type_id = parseInt(req.body.type_id);

    await prisma.$queryRaw`INSERT INTO liveclassfiles (filename,type,type_id,uuid) VALUES (${sharedLink}, ${type},${type_id},${uuid})`;
    res.json({
        code: 200,
        message: "File uploaded to Dropbox successfully!",
        url: sharedLink
    });
});

router.post("/acceptrejectclass", urlencodedParser, async (req, res) => {
    const teacher = await prisma.teacher.findMany({
        where: {
            jwt: req.headers.authtoken
        },
    });
    if (teacher.length > 0) {
        const updatedClass = await prisma.Renamedclass.update({
            where: {
                classid: parseInt(req.body.classid),
            },
            data: {
                classstatus: parseInt(req.body.status),
            },
        });
        const classes = await prisma.Renamedclass.findMany({
            where: {
                teacherid: teacher[0].teacherid,
            },
            include: {
                course: {
                    include: {
                        accent: true,
                    },
                },
            },
        });
        res.json({
            code: 200,
            message: "Classes List retrived successfully",
            classes: classes,
        });
    } else {
        res.json({
            code: 201,
            message: "Please Login Again",
        });
    }
});

module.exports = router;