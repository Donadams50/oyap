module.exports = app => {
    const member = require("./members.controller");
    const jwtTokenUtils = require('../helpers/jwtTokenUtils')
    const { verifyToken , isSeller, isBuyer, isLogistics, isAdmin} = jwtTokenUtils;
    

     app.post("/user",  member.create)
     app.post("/authenticate", member.signIn)
     app.post("/verifyuser",    member.verifyUser)
     app.post("/enableuser", isAdmin ,   member.enableUser)
     app.post("/disableuser", isAdmin ,   member.disableUser)
     app.post("/forgotpassword",  member.forgotPassword)
     app.post("/reset",    member.resetPassword)
     app.put("/member/:id", verifyToken,  member.updateMember)
     app.post("/link/verify/forgotpasswordcode" ,      member.verifyForgotpasswordlink)
    // app.get("/members/:id",  verifyToken, isAdmin,  member.findMembeById)
    // app.get("/members/loanofficer/:id",  verifyToken, isAdmin,  member.findLoanOfficer)
    // app.get("/member/count",  verifyToken, isAdmin,  member.countUsers)

    // app.post("/changepassword",verifyToken,  member.changePassword)

}
