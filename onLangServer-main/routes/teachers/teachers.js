const express = require("express");
const jwt = require("jsonwebtoken");
var bodyParser = require("body-parser");
var mail = require("../../constants/email");
const { uploadFile } = require("../../middleware/multerupload");

/******** Prisma Client *******/
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

var router = express.Router();

var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

function generateAccessToken(user) {
  return jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: "1800s" });
}

router.get("/getall", urlencodedParser, async (req, res) => {
  const teachers = await prisma.teacher.findMany({ where: { status: 0 } });
  if (teachers.length > 0) {
    res.json({
      code: 200,
      message: "Teachers Retrived Successfully",
      teachers: teachers,
    });
  } else {
    res.json({
      code: 201,
      message: "No teacher Found",
    });
  }
});

router.get("/getteacher", urlencodedParser, async (req, res) => {
  const teacher = await prisma.teacher.findMany({
    where: { jwt: req.headers.authtoken },
    include: {
      college: true,
    },
  });
  console.log(teacher);
  if (teacher.length > 0) {
    res.json({
      code: 200,
      message: "Teacher Retrived Successfully",
      teacher: teacher[0],
    });
  } else {
    res.json({
      code: 201,
      message: "No teacher Found",
    });
  }
});

router.get("/getgenda", urlencodedParser, async (req, res) => {
  const teacher = await prisma.teacher.findMany({
    where: { jwt: req.headers.authtoken },
  });
  if (teacher.length > 0) {
    const agenda = await prisma.agenda.findMany({
      where: {
        status: 0,
        teacherid: teacher[0].teacherid,
      },
      include: {
        slots: true,
        days: true,
      },
    });
    res.json({
      code: 200,
      message: "Agenda Retrived Successfully",
      agenda: agenda,
    });
  } else {
    res.json({
      code: 201,
      message: "No teacher Found",
    });
  }
});

router.post("/createagenda", urlencodedParser, async (req, res) => {
  var selectedSlots = JSON.parse(req.body.selectedSlots);
  const teacher = await prisma.teacher.findMany({
    where: { jwt: req.headers.authtoken },
  });
  if (teacher.length > 0) {
    for (var i = 0; i < selectedSlots.length; i++) {
      await prisma.agenda.create({
        data: {
          teacherid: teacher[0].teacherid,
          slotid: parseInt(selectedSlots[i].slot.slotid),
          dayid: parseInt(selectedSlots[i].day.id),
        },
      });
    }
    res.json({
      code: 200,
      message: "Accent Retrived Successfully",
      teachers: teacher,
    });
  } else {
    res.json({
      code: 201,
      message: "No teacher Found",
    });
  }
});

router.post("/updateagenda", urlencodedParser, async (req, res) => {
  console.log(req.headers.authtoken);
  console.log(req.body);
  var selectedSlots = JSON.parse(req.body.selectedSlots);

  const teacher = await prisma.teacher.findMany({
    where: { jwt: req.headers.authtoken },
  });
  if (teacher.length > 0) {
    const agendaStatus = await prisma.agenda.updateMany({
      where: {
        teacherid: teacher[0].teacherid,
      },
      data: {
        status: 1,
      },
    });
    selectedSlots.forEach((selectedSlot) => {
      upsertAgenda(teacher, selectedSlot);
    });
    res.json({
      code: 200,
      message: "Accent Retrived Successfully",
      teachers: teacher,
    });
  } else {
    res.json({
      code: 201,
      message: "No teacher Found",
    });
  }
});

async function upsertAgenda(teacher, selectedSlot) {
  const agendaAvaliable = await prisma.agenda.findMany({
    where: {
      teacherid: teacher[0].teacherid,
      slotid: parseInt(selectedSlot.slot.slotid),
      dayid: parseInt(selectedSlot.day.id),
    },
  });
  console.log(agendaAvaliable);
  if (agendaAvaliable.length < 1) {
    await prisma.agenda.create({
      data: {
        teacherid: teacher[0].teacherid,
        slotid: parseInt(selectedSlot.slot.slotid),
        dayid: parseInt(selectedSlot.day.id),
      },
    });
  } else {
    await prisma.agenda.update({
      where: {
        agendaid: agendaAvaliable[0].agendaid,
      },
      data: {
        status: 0,
      },
    });
  }
}

router.post("/inviteTeacher", urlencodedParser, async (req, res) => {
  var data = JSON.parse(req.body.data);
  const college = await prisma.college.findMany({
    where: { jwt: req.headers.authtoken },
  });
  if (college.length > 0) {
    for (var i = 0; i < data.length; i++) {
      const teacher = await prisma.teacher.findMany({
        where: { email: data[i].email },
      });
      if (teacher.length < 1) {
        console.log("teacher created");
        const token = generateAccessToken({
          collegeid: college[0].collegeid,
          email: data[i].email,
        });
        await prisma.teacher.create({
          data: {
            email: data[i].email,
            university: college[0].collegeid,
            jwt: token.trim(),
            status: 0,
          },
        });
        let mailOptions = {
          from: "On Lang <info@onlang.net>",
          to: data[i].email,
          bcc: "application@onlang.net",
          subject: "On Lang New Registration",
          template: "inviteTeacher",
          context: {
            token: token,
          },
        };
        mail
          .sendMail(mailOptions)
          .then(function (email) {
            console.log("mail send", email);
          })
          .catch(function (exception) {
            console.log(exception);
          });
        res.json({
          code: 200,
          message: "Succseefull",
        });
      } else {
        console.log("teacher already registered");
        let mailOptions = {
          from: "On Lang <info@onlang.net>",
          to: data[i].email,
          bcc: "application@onlang.net",
          subject: "On Lang New Registration",
          template: "reinviteStudent",
          context: {
            user: "Teacher",
          },
        };
        mail
          .sendMail(mailOptions)
          .then(function (email) {
            console.log("mail send", email);
          })
          .catch(function (exception) {
            console.log(exception);
          });
        res.json({
          code: 200,
          message: "Succseefull",
        });
      }
    }
  } else {
    res.json({
      code: 201,
      message: "No User Found",
    });
  }
});

router.get("/getTeacherFormInfo", urlencodedParser, async (req, res) => {
  const teacher = await prisma.teacher.findMany({
    where: { jwt: req.headers.authtoken },
    include: { college: true },
  });
  res.json({
    code: 200,
    teacher: teacher[0],
  });
});

router.post("/updateTeacherinfo", urlencodedParser, async (req, res) => {
  let token = generateAccessToken({
    teacherid: parseInt(req.body.teacherid),
    teachername: req.body.firstname,
  });
  const teacher = await prisma.teacher.update({
    where: {
      teacherid: parseInt(req.body.teacherid),
    },
    data: {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      phone: req.body.phone,
      password: req.body.password,
      username: req.body.email,
      status: 0,
      street: req.body.streetno,
      address: req.body.streetname,
      city: req.body.city,
      country: req.body.country,
      accent: parseInt(req.body.accent),
      jwt: token,
    },
  });
  var courses = JSON.parse(req.body.courses);
  courses.forEach((course) => {
    addCourses(req.body.teacherid, course.courseid);
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
    teacher: teacher,
    token: token,
  });
});

router.get("/getinstitutionteachers", async (req, res) => {
  const college = await prisma.college.findMany({
    where: { jwt: req.headers.authtoken },
  });
  if (college.length > 0) {
    const teachers = await prisma.teacher.findMany({
      where: {
        university: college[0].collegeid,
      },
    });
    res.json({
      code: 200,
      message: "teachers retrived successfully",
      teachers: teachers,
    });
  } else {
    res.json({
      code: 201,
      message: "Please Login Again",
    });
  }
});

async function addCourses(teacherid, courseid) {
  var addcourse = await prisma.teachercourses.create({
    data: {
      teacherid: parseInt(teacherid),
      courseid: parseInt(courseid),
      teachercoursesstatus: 0,
    },
  });
}

router.get("/getinstitutionteacher", async (req, res) => {
  const college = await prisma.college.findMany({
    where: { jwt: req.headers.authtoken },
  });
  if (college.length > 0) {
    const teachers = await prisma.teacher.findMany({
      where: {
        university: college[0].collegeid,
      },
    });
    res.json({
      code: 200,
      message: "teachers retrived successfully",
      teachers: teachers,
    });
  } else {
    res.json({
      code: 201,
      message: "Please Login Again",
    });
  }
});

router.post(
  "/getinstitutionteacherdetails",
  urlencodedParser,
  async (req, res) => {
    const college = await prisma.college.findMany({
      where: { jwt: req.headers.authtoken },
    });
    if (college.length > 0) {
      const teachers = await prisma.teacher.findUnique({
        where: {
          teacherid: parseInt(req.body.teacherid),
        },
        include: {
          teachercourses: {
            include: {
              course: {
                include: {
                  accent: true,
                },
              },
            },
          },
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
            },
          },
        },
      });
      res.json({
        code: 200,
        message: "teacher details retrived successfully",
        teachers: teachers,
      });
    } else {
      res.json({
        code: 201,
        message: "Please Login Again",
      });
    }
  }
);

async function addCourses(teacherid, courseid) {
  var addcourse = await prisma.teachercourses.create({
    data: {
      teacherid: parseInt(teacherid),
      courseid: parseInt(courseid),
      teachercoursesstatus: 0,
    },
  });
}

router.post("/updateteacher", urlencodedParser, async (req, res) => {
  const teacherObj = await prisma.teacher.findMany({
    where: { jwt: req.headers.authtoken },
  });
  if (teacherObj.length > 0) {
    const teacher = await prisma.teacher.update({
      where: { teacherid: teacherObj[0].teacherid },
      data: {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        phone: req.body.phone,
        street: req.body.street,
        address: req.body.address,
        city: req.body.city,
        country: req.body.country,
      },
    });
    console.log(teacher);
    res.json({
      code: 200,
      message: "Teacher updated successfully",
      teacher: teacher,
    });
  } else {
    res.json({
      code: 201,
      message: "No Login User Found",
    });
  }
});

router.post("/updateteacherlogins", urlencodedParser, async (req, res) => {
  const teacherObj = await prisma.teacher.findMany({
    where: { jwt: req.headers.authtoken },
  });
  if (teacherObj.length > 0) {
    const teacher = await prisma.teacher.update({
      where: { teacherid: teacherObj[0].teacherid },
      data: {
        username: req.body.username,
        password: req.body.password,
      },
    });
    res.json({
      code: 200,
      message: "Teacher updated successfully",
      teacher: teacher,
    });
  } else {
    res.json({
      code: 201,
      message: "No Login User Found",
    });
  }
});

router.post(
  "/uploadimage",
  uploadFile("profileimages/").single("profile"),
  async (req, res) => {
    const teacherObj = await prisma.teacher.findMany({
      where: { jwt: req.headers.authtoken },
    });
    if (teacherObj.length > 0) {
      console.log(req.files);
      console.log(req.file);
      const teacher = await prisma.teacher.update({
        where: { teacherid: teacherObj[0].teacherid },
        data: {
          image: `profileimages/${req.file.filename}`,
        },
      });
      res.json({
        code: 200,
        message: "College updated successfully",
        teacher: teacher,
      });
    } else {
      res.json({
        code: 201,
        message: "No Login User Found",
      });
    }
  }
);

module.exports = router;
