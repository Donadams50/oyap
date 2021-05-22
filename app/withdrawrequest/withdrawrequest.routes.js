module.exports = app => {
    const withdrawerrequest = require("./withdrawrequest.controller");
    const jwtTokenUtils = require('../helpers/jwtTokenUtils')
    const { verifyToken,  isSeller, isLogistics } = jwtTokenUtils;
   
 
        
   app.post("/withdraw",  verifyToken, isSeller,  withdrawerrequest.withdrawFunds)
  
}