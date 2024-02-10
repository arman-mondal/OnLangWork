const express = require("express");
const jwt = require("jsonwebtoken");
var bodyParser = require("body-parser");
var mail = require("../../constants/email");

/******** Prisma Client *******/
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

var router = express.Router();

var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

function generateAccessToken(user) {
  return jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: "1800s" });
}

router.get("/getInstitutionStudents", urlencodedParser, async (req, res) => {
  const college = await prisma.college.findMany({
    where: { jwt: req.headers.authtoken },
  });
  if (college.length > 0) {
    const students =
      await prisma.$queryRaw`SELECT student.*, course.coursename, course.courseid, subcriptions.id as subscritionid, packages.packageid, packages.noofclases , accent.accentname, packages.timing FROM student INNER JOIN subcriptions ON subcriptions.id = student.subcription INNER JOIN packages ON packages.packageid = subcriptions.packageId INNER JOIN course ON course.courseid = packages.courseid INNER JOIN accent ON accent.accentid = course.courseaccent WHERE student.status = 0 AND student.groupstatus = 1 AND university = ${college[0].collegeid}`;
    res.json({
      code: 200,
      message: "Students Retrived Successfully",
      students: students,
    });
  } else {
    res.json({
      code: 201,
      message: "No Login User Found",
    });
  }
});

router.post("/invite", urlencodedParser, async (req, res) => {
  var data = JSON.parse(req.body.data);
  const college = await prisma.college.findMany({
    where: { jwt: req.headers.authtoken },
  });
  if (college.length > 0) {
    for (var i = 0; i < data.length; i++) {
      const student = await prisma.student.findMany({
        where: { email: data[i].email },
      });
      if (student.length < 1) {
        const token = generateAccessToken({
          collegeid: college[0].collegeid,
          email: data[i].email,
        });
        await prisma.subcriptions.update({
          where: { id: parseInt(data[i].package) },
          data: { usedslots: { increment: 1 } },
        });
        await prisma.student.create({
          data: {
            email: data[i].email,
            university: college[0].collegeid,
            subcription: parseInt(data[i].package),
            jwt: token.trim(),
          },
        });
        const subcription = await prisma.subcriptions.findUnique({
          where: {
            id: parseInt(data[i].package),
          },
          include: {
            packages: {
              include: {
                course: {
                  include: {
                    accent: true,
                  },
                },
              },
            },
          },
        });
        let mailOptions = {
          from: "On Lang <info@onlang.net>",
          to: data[i].email,
          bcc: "application@onlang.net",
          subject: "On Lang New Registration",
          template: "inviteStudent",
          context: {
            token: token,
            colageName: college[0].collegename,
            courseName: subcription.packages.course.coursename,
            accentName: subcription.packages.course.accent.accentname,
          },
        };
        mail
          .sendMail(mailOptions)
          .then(function (email) {
            console.log("mail send");
          })
          .catch(function (exception) {
            console.log(exception);
          });
      } else {
        let mailOptions = {
          from: "On Lang <info@onlang.net>",
          to: data[i].email,
          bcc: "application@onlang.net",
          subject: "On Lang New Registration",
          template: "reinviteStudent",
          context: { user: "Student" },
        };
        mail
          .sendMail(mailOptions)
          .then(function (email) {
            console.log("mail send");
          })
          .catch(function (exception) {
            console.log(exception);
          });
      }
    }
    res.json({
      code: 200,
      message: "Succseefull",
    });
  } else {
    res.json({
      code: 201,
      message: "No Login User Found",
    });
  }
});

router.get("/getStudentFormInfo", urlencodedParser, async (req, res) => {
  const student = await prisma.student.findMany({
    where: { jwt: req.headers.authtoken },
    include: { college: true },
  });
  const studylevel = await prisma.studylevel.findMany({ where: { status: 0 } });
  const field = await prisma.field.findMany({ where: { status: 0 } });
  if (student.length > 0) {
    res.json({
      code: 200,
      student: student[0],
      studylevel: studylevel,
      field: field,
    });
  } else {
    res.json({
      code: 202,
      message: "Token not matched",
    });
  }
});

router.post("/updateStudentinfo", urlencodedParser, async (req, res) => {
  try{
    const mandatoryFields = ['email', 'password']; // Fields that are mandatory

  // Check if mandatory fields are missing in the request body
  const missingFields = mandatoryFields.filter(field => !req.body[field]);
  if (missingFields.length > 0) {
    return res.status(400).json({
      code: 400,
      message: `Missing mandatory field(s): ${missingFields.join(', ')}`,
    });
  }

  let token = generateAccessToken({
    teacherid: parseInt(req.body.teacherid),
    teachername: req.body.firstname,
  });

  const updateData = {
    jwt: token,
  };

  // Update only the fields that are present in the request body
  ['firstname', 'lastname', 'phone', 'citizenship', 'dateofbirth', 'fieldofstudy', 'city', 'country'].forEach(field => {
    if (req.body[field]) {
      updateData[field] = req.body[field];
    }
    updateData['status'] = 0;
  });

  // Update only if password is provided
  if (req.body.password) {
    updateData.password = req.body.password;
  }

  const student = await prisma.student.update({
    where: {
      studentid: parseInt(req.body.studentid),
    },
    data: updateData,
  });

  let mailOptions = {
    from: "On Lang <info@onlang.net>",
    to: req.body.email,
    bcc: "application@onlang.net",
    subject: "On Lang New Registration",
    template: "teacherformdone",
    context: {
      user: "Teacher",
    },
  };

  mail.sendMail(mailOptions)
    .then(function (email) {
      console.log("mail send");
    })
    .catch(function (exception) {
      console.log(exception);
    });

  res.json({
    code: 200,
    message: "Information Updated Successfully",
    student: student,
    token: token,
  });
  }
  catch(err){
    console.log(err);
    res.json({
      code: 201,
      message: {err},
    });
  }

});

router.post("/updateStudentStatus", urlencodedParser, async (req, res) => {
  const student = await prisma.student.update({
    where: {
      studentid: parseInt(req.body.studentid),
    },
    data: {
      status: parseInt(req.body.status),
    },
  });
  var template = "studentRestrict";
  var subject = "On Lang Account Access Restricted";
  if (parseInt(req.body.status) == 0) {
    template = "studentActive";
    subject = "On Lang Account Access Re Activated";
  }
  let mailOptions = {
    from: "On Lang <info@onlang.net>",
    to: student.email,
    bcc: "application@onlang.net",
    subject: subject,
    template: template,
    context: {
      user: student.firstname + " " + student.lastname,
    },
  };

  mail
    .sendMail(mailOptions)
    .then(function (email) {
      console.log("mail send");
    })
    .catch(function (exception) {
      console.log(exception);
    });
  res.json({
    code: 200,
    message: "Information Updated Successfully",
  });
});

router.get("/getInstitutionStudentList", async (req, res) => {
  console.log("Check: " + req.headers.authtoken);
  const college = await prisma.college.findMany({
    where: { jwt: req.headers.authtoken },
  });
  if (college.length > 0) {
    console.log(college[0].collegeid);
    const students = await prisma.student.findMany({
      where: {
        university: college[0].collegeid,
      },
    });
    res.json({
      code: 200,
      message: "students retrived successfully",
      students: students,
    });
  } else {
    res.json({
      code: 201,
      message: "Please Login Again",
    });
  }
});

router.post(
  "/getinstitutionstudentdetails",
  urlencodedParser,
  async (req, res) => {
    var whereCondition = {};
    const college = await prisma.college.findMany({
      where: { jwt: req.headers.authtoken },
    });
    if (college.length < 1) {
      const teacher = await prisma.teacher.findMany({
        where: { jwt: req.headers.authtoken },
      });
      if (teacher.length < 1) {
        res.json({
          code: 201,
          message: "Please Login Again",
        });
        return;
      } else {
        whereCondition = {
          studentid: parseInt(req.body.studentid),
          classstudents: {
            some: {
              class: {
                teacherid: teacher[0].teacherid,
              },
            },
          },
        };
      }
    } else {
      whereCondition = {
        studentid: parseInt(req.body.studentid),
        university: parseInt(college[0].collegeid),
      };
    }
    const students = await prisma.student.findMany({
      where: whereCondition,
      include: {
        studylevel: true,
        subcriptions: {
          include: {
            packages: {
              include: {
                course: {
                  include: {
                    accent: true,
                  },
                },
              },
            },
          },
        },
        classstudents: {
          include: {
            class: {
              include: {
                subcriptions: {
                  include: {
                    packages: {
                      include: {
                        course: {
                          include: {
                            accent: true,
                          },
                        },
                      },
                    },
                  },
                },
                classtiming: {
                  include: {
                    days: true,
                    slots: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (students.length > 0) {
      res.json({
        code: 200,
        message: "students details retrived successfully",
        student: students[0],
      });
    } else {
      res.json({
        code: 202,
        message: "Invalid Requesd for Class Details",
      });
    }
  }
);

module.exports = router;
