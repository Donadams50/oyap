module.exports = app => {
    const admin = require("./admin.controller");
    const jwtTokenUtils = require('../helpers/jwtTokenUtils')
    const { verifyToken,  isSeller, isBuyer, isLogistics, isAdmin , isAdminOrSubadmin} = jwtTokenUtils;
   
 
    app.get("/logistics/orders/admin/count",  verifyToken,  isAdminOrSubadmin, admin.adminLogisticsDashboardCount)
    app.get("/logistics/orders/admin",verifyToken, isAdminOrSubadmin, admin.getLogisticsByAdmin)
}