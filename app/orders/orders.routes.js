module.exports = app => {
    const order = require("./orders.controller");
    const jwtTokenUtils = require('../helpers/jwtTokenUtils')
    const { verifyToken,  isSeller, isBuyer, isLogistics, isAdmin } = jwtTokenUtils;
    require('../Cloudinary/cloudinary.js')
    const upload = require('../Cloudinary/multer.js');
 
        
   app.post("/order",  verifyToken, isBuyer,  order.createOrder)
   app.get("/new/orders/seller/:id",  verifyToken,  isSeller, order.findNewOrder)
   app.get("/buyer/orders/:status",  verifyToken,  isBuyer, order.findOrderByStatusBuyer)
   app.put("/confirm/orders/:orderId",  verifyToken,  isSeller,  order.confirmOrderSeller)
   app.get("/seller/order/:status",  verifyToken, isSeller,  order.findOrderByStatusSeller)
   app.get("/order/confirmed",  verifyToken,   order.getAllConfirmedOrder)
   app.get("/order/:orderId",  verifyToken,   order.findOrderById)
/  app.post("/confirm/order/logistics",  verifyToken, isLogistics , order.confirmOrderLogistics)
//    app.get("/incompletedorder/:userId",  verifyToken, order.inCompletedOrderByUserId)
}