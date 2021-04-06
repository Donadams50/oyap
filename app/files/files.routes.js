module.exports = app => {
    const files = require("./files.controller");
    const jwtTokenUtils = require('../helpers/jwtTokenUtils')
    const { verifyToken, isSeller, isBuyer, isLogistics, isAdmin } = jwtTokenUtils;
   
    require('../cloudinary/cloudinary.js')
    const upload = require('../cloudinary/multer.js');
  
  app.post("/image", verifyToken,  upload.single("file"),  files.postImage)

  app.post("/profileimage", verifyToken,  upload.single("file"),  files.postImage)


    }
