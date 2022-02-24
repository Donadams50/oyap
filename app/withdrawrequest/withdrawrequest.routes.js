module.exports = app => {
    const withdrawerrequest = require("./withdrawrequest.controller");
    const jwtTokenUtils = require('../helpers/jwtTokenUtils')
    const { verifyToken,  isSeller, isLogistics, isAdminOrSubadmin } = jwtTokenUtils;
   
 
        
   app.post("/withdraw",  verifyToken, isSeller,  withdrawerrequest.withdrawFunds)
   app.get("/withdrawer",  verifyToken, isAdminOrSubadmin,  withdrawerrequest.getAllWithdrawer)
   app.post("/cancelrequest/:withdrawerrequestId",  verifyToken, isAdminOrSubadmin,  withdrawerrequest.cancelRequest)
   app.post("/completerequest/:withdrawerrequestId",  verifyToken, isAdminOrSubadmin,  withdrawerrequest.completeRequest)
   app.get("/bank/code", verifyToken,  isSeller,  withdrawerrequest.getBankCode)
    
}