const multer = require("multer")

module.exports.uploadRecordingFile = (folderName) => {
  return multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null,  `assets/${folderName}/`);
      },
      filename: (req, file, cb) => {
        console.log(file.originalname);
        cb(null, Date.now() + ".webm");
      },
    })
  })
}