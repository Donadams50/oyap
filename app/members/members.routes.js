module.exports = app => {
    const member = require("./members.controller");
    const jwtTokenUtils = require('../helpers/jwtTokenUtils')
    const { verifyToken , isSeller, isBuyer, isLogistics, isAdminOrSubadmin, isAdmin} = jwtTokenUtils;
    

     app.post("/user",  member.create)
     app.post("/authenticate", member.signIn)
     app.post("/verifyuser",    member.verifyUser)
     app.post("/enableuser", verifyToken,isAdminOrSubadmin ,   member.enableUser)
     app.post("/disableuser",verifyToken, isAdminOrSubadmin ,   member.disableUser)
     app.post("/forgotpassword",  member.forgotPassword)
     app.post("/reset",    member.resetPassword)
     app.put("/member/:id", verifyToken,  member.updateMember)
     app.post("/link/verify/forgotpasswordcode" ,      member.verifyForgotpasswordlink)
     app.put("/billingdetails/:id",  verifyToken, isBuyer,  member.updateBillingDetails)
     app.get("/member/:id",  verifyToken,   member.findMembeById)
     app.get("/recentusers/admin",verifyToken, isAdminOrSubadmin, member.recentUsersAdmin)
     app.get("/users/count/dashboard",  verifyToken,  isAdminOrSubadmin, member.adminUserDashboardCount)
     app.get("/member",  verifyToken, isAdminOrSubadmin,   member.findAllMembers)


}
