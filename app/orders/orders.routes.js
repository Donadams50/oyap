module.exports = app => {
    const order = require("./orders.controller");
    const jwtTokenUtils = require('../helpers/jwtTokenUtils')
    const { verifyToken,  isSeller, isBuyer, isLogistics, isAdmin } = jwtTokenUtils;
    require('../Cloudinary/cloudinary.js')
    const upload = require('../Cloudinary/multer.js');
 
        
   app.post("/order",  verifyToken, isBuyer,  order.createOrder)
   app.get("/new/orders/seller/:id",  verifyToken,  isSeller, order.findNewOrder)
   app.get("/buyer/orders/:status",  verifyToken,  isBuyer, order.findOrderByStatusBuyer)
   app.put("/confirm/orders/:orderId",  verifyToken,  isSeller,  order.confirmOrder)
   app.get("/seller/order/:status",  verifyToken, isSeller,  order.findOrderByStatusSeller)
//  app.post("/dispatchorder",  verifyToken, isAdmin,  order.dispatchOrder)
//  app.post("/completeorder/:orderId",  verifyToken,   order.completeOrder)
//   app.get("/completedorder/:userId",  verifyToken, order.completedOrderByUserId)
//    app.get("/incompletedorder/:userId",  verifyToken, order.inCompletedOrderByUserId)
}