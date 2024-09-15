const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const fileupload = require("express-fileupload");
var bodyParser = require("body-parser");
var mail = require("../../constants/email");
const { uploadFile } = require("../../middleware/multerupload");

/******** Prisma Client *******/
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/******** Json Parser *******/
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

/******** Creating Routing *******/
var router = express.Router();

const DIR = "assets/";

function generateAccessToken(user) {
  return jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: "1800s" });
}

router.post("/college", urlencodedParser, async (req, res) => {
  const startdate = new Date(req.body.startdate);

  const teachers=JSON.parse(req.body.selectedTeacher)
// console.log(teachers)
// return
  const createPackage=async()=>{

    const package=await prisma.packages.create({
      data:{
        packageprice:0,
        noofclases:parseInt(req.body.noofclass),
        noofstudent:parseInt(req.body.noofstudents),
        timing:parseInt(req.body.courseperiods),
        packagecolor:'#dbff33',
        feature1:'',
        feature2:'',
        feature3:'',
        feature4:'',
        feature5:'',
        feature6:'',
        feature7:'',
        feature8:'',
        status:0,
        support:0,
        createdby:req.body.collegename,
        course:{
          create:{
            coursename:req.body.coursename,
            courseaccent:13,
            description:'created by user',
            createdby:req.body.collegename,
            status:0
          }
        }
      }
    })
    return package.packageid


  }

  const pkgId=await createPackage()

  const user = await prisma.college.create({
    data: {
      collegename: req.body.collegename,
      collegetype: req.body.collegetype,
      username: req.body.email,
      password: req.body.password,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      designation: req.body.designation,
      department: req.body.department,
      email: req.body.email,
      website: req.body.website,
      phone: req.body.phone,
      tel: req.body.tel,
      city: req.body.city,
      postalcode: req.body.postalcode,
      country: req.body.country,
      countrycode: req.body.countrycode,
      noofpackages: 1,
      startdate: startdate,
      accent: req.body.accent,
      subscription: pkgId,
      status: 1,
      reading: Boolean(req.body.reading),
      writing: Boolean(req.body.writing),
      speaking: Boolean(req.body.speaking),
      listening: Boolean(req.body.listening),
    },
  });
  for (var i = 0; i < parseInt(req.body.noofpackages); i++) {
    const subcriptions = await prisma.subcriptions.create({
      data: {
        collegeId: user.collegeid,
        packageId: pkgId,
        
      },
    });
    const package = await prisma.packages.findUnique({
      where: { packageid: pkgId },
    });
    if(teachers.length>0){
      teachers.forEach(async(teacher)=>{
        const deleteTeacherWithCourse=await prisma.teachercourses.deleteMany({
          where:{
            teacherid:teacher.teacherid
          }
        })
        let mailOptions = {
          from: "On Lang <info@onlang.net>",
          to: teacher.email,
          bcc: "application@onlang.net",
          subject: "On Lang New Registration",
          template: "teacherformdone",
          context: {
            user: "Teacher",
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
        const teacherCourses=await prisma.teacher.update(
          {
            where:{
              teacherid:teacher.teacherid,
            },
            data:{
              university:user.collegeid,
              
              

            }
          }
        )
      }
      )
    }

    const invoice = await prisma.invoices.create({
      data: {
        collegeid: user.collegeid,
        subscriptionid: subcriptions.id,
        subtotal: package.packageprice,
        vat: (package.packageprice / 100) * 25,
        discount: 0,
        total: package.packageprice + (package.packageprice / 100) * 20,
        createdon: new Date(),
        duedate: new Date(Date.now() + 12096e5),
        status: 0,
      },
    });
  }
  let mailOptions = {
    from: "On Lang <info@onlang.net>",
    to: req.body.email,
    bcc: "application@onlang.net,mariamshir@gmail.com,mfaroughy@onlang.net",
    subject: "On Lang New Registration",
    template: "registerCollege",
    context: { name: req.body.collegename },
  };
  mail
    .sendMail(mailOptions)
    .then(function (email) {
      console.log("Email Sended to College");
      let mailOptionsNotification = {
        from: "On Lang <info@onlang.net>",
        to: "mariamshir@gmail.com,mfaroughy@onlang.net",
        subject: "On Lang New Institution Request",
        template: "registerNotification",
      };
      mail
        .sendMail(mailOptionsNotification)
        .then(function (email) {
          console.log("Notification Email Sended");
          res.json({ code: 200, message: "Register Successful", user: user });
        })
        .catch(function (exception) {
          console.log("Notification Email Failed");
          res.json({ code: 200, message: exception, user: user });
        });
    })
    .catch(function (exception) {
      console.log("College Email Failed");
      res.json({ code: 200, message: exception, user: user });
    });
});

router.post(
  "/teacher",
  uploadFile("teacher/").any("files"),
  async (req, res) => {
    const filesURL = [];
    req.files.forEach((file) => {
      filesURL.push(`teacher/${file.filename}`);
    });
    const teacher = await prisma.teacher.create({
      data: {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        username: req.body.email,
        password: req.body.password,
        phone: req.body.phone,
        accent: parseInt(req.body.accent),
        street: req.body.streetno,
        address: req.body.streetname,
        city: req.body.city,
        country: req.body.country,
        university:
          parseInt(req.body.university) == 0
            ? null
            : parseInt(req.body.university),
        cartificate: JSON.stringify(filesURL),
      },
    });
    JSON.parse(req.body.courses).forEach((course) => {
      console.log(course);
      addCourses(teacher.teacherid, course.courseid);
    });

    let mailOptions = {
      from: "On Lang <info@onlang.net>",
      to: req.body.email,
      bcc: "application@onlang.net,mariamshir@gmail.com,mfaroughy@onlang.net",
      subject: "On Lang New Registration",
      template: "registerTeacher",
      context: {
        fname: req.body.firstname.toUpperCase(),
        lname: req.body.lastname.toUpperCase(),
      },
    };
    mail
      .sendMail(mailOptions)
      .then(function (email) {
        let mailOptionsNotification = {
          from: "On Lang <info@onlang.net>",
          to: "mariamshir@gmail.com,mfaroughy@onlang.net",
          subject: "On Lang New Teacher Registration Request",
          template: "registerNotification",
        };
        mail
          .sendMail(mailOptionsNotification)
          .then(function (email) {
            res.json({
              code: 200,
              message: "Register Successful",
            });
          })
          .catch(function (exception) {
            res.json({
              code: 200,
              message: exception,
            });
          });
      })
      .catch(function (exception) {
        res.json({
          code: 200,
          message: "EMail Send Error",
        });
      });
  }
);

async function addCourses(teacherid, courseid) {
  await prisma.teachercourses.create({
    data: {
      teacherid: teacherid,
      courseid: courseid,
      teachercoursesstatus: 0,
    },
  });
}
module.exports = router;
