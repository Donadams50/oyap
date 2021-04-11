module.exports = app => {
    const order = require("./transactions.controller");
    const jwtTokenUtils = require('../helpers/jwtTokenUtils')
    const { verifyToken,  isSeller, isBuyer, isLogistics, isAdmin } = jwtTokenUtils;
    require('../cloudinary/cloudinary.js')
    const upload = require('../cloudinary/multer.js');
 
        
  // app.post("/withdraw",  verifyToken, isBuyer,  order.withdrawFunds)
   app.get("/transactions/seller",  verifyToken,  isSeller, order.getTransactionHistory)
  
}