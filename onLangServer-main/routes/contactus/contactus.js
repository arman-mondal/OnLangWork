const express = require("express");
var bodyParser = require("body-parser");
var mail = require("../../constants/email");

/******** Prisma Client *******/
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/******** Json Parser *******/
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

/******** Creating Routing *******/
var router = express.Router();

router.post("/teachercontactus", urlencodedParser, async (req, res) => {
  const teacher = await prisma.teacher.findFirst({
    where: { jwt: req.headers.authtoken },
  });
  if (teacher) {
    const contactus = await prisma.contactus.create({
      data: {
        name: `${teacher.firstname} ${teacher.lastname}`,
        email: teacher.email,
        phone: teacher.phone,
        issue: req.body.issue,
        message: req.body.message,
        status: false,
      },
    });
    sendEmail(contactus, "teacher", "Teacher");
    res.json({
      code: 200,
      message: "process done successfully",
    });
  } else {
    res.json({
      code: 201,
      message: "Please Login Again",
    });
  }
});

router.post("/studentcontactus", urlencodedParser, async (req, res) => {
  const student = await prisma.student.findFirst({
    where: { jwt: req.headers.authtoken },
  });
  if (student) {
    const contactus = await prisma.contactus.create({
      data: {
        name: `${student.firstname} ${student.lastname}`,
        email: student.email,
        phone: student.phone,
        issue: req.body.issue,
        message: req.body.message,
        status: false,
      },
    });
    sendEmail(contactus, "student", "Student");
    res.json({
      code: 200,
      message: "process done successfully",
    });
  } else {
    res.json({
      code: 201,
      message: "Please Login Again",
    });
  }
});

router.post("/collegecontactus", urlencodedParser, async (req, res) => {
  const college = await prisma.college.findFirst({
    where: { jwt: req.headers.authtoken },
  });
  if (college) {
    const contactus = await prisma.contactus.create({
      data: {
        name: `${college.collegename} ${college.collegetype}`,
        email: college.email,
        phone: college.phone,
        issue: req.body.issue,
        message: req.body.message,
        status: false,
      },
    });
    sendEmail(contactus, "institution", "Institution");
    res.json({
      code: 200,
      message: "process done successfully",
    });
  } else {
    res.json({
      code: 201,
      message: "Please Login Again",
    });
  }
});

function sendEmail(contactus, profile, subject) {
  let mailOptions = {
    from: "On Lang <info@onlang.net>",
    to: "On Lang <support@onlang.net>",
    bcc: "application@onlang.net,mariamshir@gmail.com",
    subject: `${subject} Contact Us Message`,
    template: "contactUs",
    context: {
      contactus: contactus,
      profile: profile,
    },
  };
  mail
    .sendMail(mailOptions)
    .then(function (email) {
      console.log(email);
    })
    .catch(function (exception) {
      console.log(exception);
    });
}

module.exports = router;
