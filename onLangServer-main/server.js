require("dotenv").config();
const express = require("express");
const https = require("https");
var bodyParser = require("body-parser");
var cors = require("cors");
const fileupload = require("express-fileupload");
var mail = require("./constants/email");
var verifyToken = require("./constants/token");
const { uploadFile } = require("./middleware/multerupload");
const multer = require('multer');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require("fs");
const app = express();
var key = fs.readFileSync("ssl/private.key");
var cert = fs.readFileSync("ssl/certificate.crt");
var options1 = {
  key: key,
  cert: cert,
  ca: fs.readFileSync("ssl/ca_bundle.crt"),
};

/***** Assignment Routes *****/
var assignmentRoutes = require("./routes/assignment/assignment");

/*****Auth Routes********/
var authRoutes = require("./routes/auth/login");
var authRegister = require("./routes/auth/register");
var forgotPassword = require("./routes/auth/forgotPassword");
var resetPassword = require("./routes/auth/resetPassword");

/*****Accent Routes********/
var accentRoutes = require("./routes/accent/accent");

/***** Slots Routes *******/
var slotsRoutes = require("./routes/slots/slots");

/***** College Routes *****/
var collegeRoutes = require("./routes/college/college");

/***** Students Routes *****/
var institutionStudentsRoutes = require("./routes/students/students");

/***** Teachers Routes ****/
var teachersRoutes = require("./routes/teachers/teachers");

/***** Packages Routes *****/
var subscriptionRoutes = require("./routes/packages/subscription");
var packagesRoutes = require("./routes/packages/packages");
var invoicesRoutes = require("./routes/packages/invoices");

/***** Groups Routes *****/
var groupsRoutes = require("./routes/groups/groups");

/***** Courses Routes *****/
var coursesRoutes = require("./routes/courses/course");
var lessonRoutes = require("./routes/courses/lesson");

/***** Classes Routes *****/
var classesRoutes = require("./routes/class/class");
var recordingsRoutes = require("./routes/class/recordings");

/***** Contact Us Routes *****/
var contactusRoutes = require("./routes/contactus/contactus");

/********** JSON Parsers *******/
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

/******Express Server Setup*******/

app.use(urlencodedParser);
app.use(jsonParser);
corsOptions = ["*"]
app.use(cors(corsOptions));
// app.use(fileupload());
app.use("/backend", express.static("assets"));

/*******Definig Sub Routes**********/
app.use("/backend/assignment", assignmentRoutes);
app.use("/backend/auth", authRoutes);
app.use("/backend/register", authRegister);
app.use("/backend/forgotPassword", forgotPassword);
app.use("/backend/resetPassword", resetPassword);
app.use("/backend/packages", packagesRoutes);
app.use("/backend/subscription", subscriptionRoutes);
app.use("/backend/invoices", invoicesRoutes);
app.use("/backend/accent", accentRoutes);
app.use("/backend/slots", slotsRoutes);
app.use("/backend/college/", collegeRoutes);
app.use("/backend/students/", institutionStudentsRoutes);
app.use("/backend/teachers/", teachersRoutes);
app.use("/backend/groups/", groupsRoutes);
app.use("/backend/course/", coursesRoutes);
app.use("/backend/classes/", classesRoutes);
app.use("/backend/lesson/", lessonRoutes);
app.use("/backend/recordings/", recordingsRoutes);
app.use("/backend/contactus/", contactusRoutes);
app.get("/serverStatusCheck", (res, req) => {
  res.status(200).json({ "status": "OK" })
});
app.get("/backend/api", (req, res) => {
  let mailOptions = {
    from: "On Lang <info@onlang.net>",
    to: "mariamshir@gmail.com,mfaroughy@onlang.net",
    subject: "On Lang New Teacher Registration Request",
    template: "registerNotification",
  };

  mail
    .sendMail(mailOptions)
    .then(function (email) {
      console.log("mail send");
    })
    .catch(function (exception) {
      console.log(exception);
    });
  res.json({ users: ["userone", "usertwo", "userthree", "userfour"] });
});

// Learn Cube
app.post('/classes/get-valid-token/', function (req, res) {
  const privateKey = "6fa59d04cd04460ad8fa97e10154b5afcbec6709"
  const username = "sahilpethani50gmailcom"
  const user_id = "808117"
  const email = "sahilpethani50gmailcom"

  const token = jwt.sign({
    "exp": Math.floor(Date.now() / 1000) + (60 * 5),
    "username": username,
    "user_id": user_id,
    "email": email,
  }, privateKey, { algorithm: 'HS256' })

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ 'token': token }))
});

app.get('/backend/call/', function (req, res) {
  const { token, userid, username, userType, classid } = req.query;
  if (!token || !userid || !username || !userType || !classid) {
    return res.status(400).send('Error: Missing required parameters.');
  }

  let indexHtmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  indexHtmlContent = indexHtmlContent.replace(token);
  indexHtmlContent = indexHtmlContent.replace(userid);
  indexHtmlContent = indexHtmlContent.replace(username);
  indexHtmlContent = indexHtmlContent.replace(userType);
  indexHtmlContent = indexHtmlContent.replace(classid);
  res.send(indexHtmlContent);
});

app.get("/backend/home", (req, res) => {
  verifyToken(res, req.headers.authtoken);
});

app.post(
  "/backend/uploadImage",
  uploadFile("ckeditor").single("upload"),
  async (req, res) => {
    console.log(req.files);
    console.log(req.file);
    res.status(200).json({
      uploaded: true,
      url: `https://onlang.net:3001/backend/ckeditor/${req.file.filename}`,
    });
  }
);
const acceptedOrigins = [
  "http://localhost:3000",

  "*" // Be cautious when using the wildcard (*) for CORS
];
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (acceptedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400'); // 1 day cache
  }
  next();
});
const upload = multer({
  dest: 'uploads/', // Specify your upload folder path
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['gif', 'jpeg', 'jpg', 'png', 'svg'];
    const fileExtension = path.extname(file.originalname).toLowerCase().substring(1); // Get file extension

    if (!allowedExtensions.includes(fileExtension)) {
      return cb(new Error('Invalid file extension.'));
    }
    cb(null, true);
  }
});

// API endpoint for image upload
app.post('/imageuploadhandler', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const tempPath = req.file.path;
  const originalName = req.file.originalname;
  const uniqueFileName = `${Date.now()}_${originalName}`;
  const destination = path.join('uploads/', uniqueFileName);

  fs.rename(tempPath, destination, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server Error' });
    }

    res.json({ location: destination });
  });
});


app.use('/backend/ckeditor', express.static('assets/ckeditor'));

// var server = https.createServer(options1, app);
app.listen(3003, () => {
  console.log("server starting on port : " + 3003);
});
// server.listen(3001, () => {
//   console.log("server starting on port : " + 3001);
// });
