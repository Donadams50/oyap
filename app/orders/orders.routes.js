module.exports = app => {
    const order = require("./orders.controller");
    const jwtTokenUtils = require('../helpers/jwtTokenUtils')
    const { verifyToken,  isSeller, isBuyer, isLogistics, isAdmin, isAdminOrSubadmin } = jwtTokenUtils;
    require('../cloudinary/cloudinary.js')
    const upload = require('../cloudinary/multer.js');
 
        
   app.post("/order",  verifyToken, isBuyer,  order.createOrder)
   app.get("/new/orders/seller/:id",  verifyToken,  isSeller, order.findNewOrder)
   app.get("/buyer/orders/:status",  verifyToken,  isBuyer, order.findOrderByStatusBuyer)
   app.put("/confirm/orders/:orderId",  verifyToken,  isSeller,  order.confirmOrderSeller)
   app.get("/seller/order/:status",  verifyToken, isSeller,  order.findOrderByStatusSeller)
   app.get("/order/confirmed",  verifyToken,   order.getAllConfirmedOrder)
   app.get("/order/:orderId",  verifyToken,   order.findOrderById)
   app.post("/logistics/confirm/order/:orderId",  verifyToken, isAdminOrSubadmin , order.confirmOrderLogistics)
   app.get("/dashboard/seller/count",  verifyToken, order.sellerDashboardCount)
   app.post("/ontransit/order/:orderId",  verifyToken, isAdminOrSubadmin , order.makeOrderOnTransit)
   app.get("/admin/orders/dashboard/count",  verifyToken,  isAdminOrSubadmin, order.adminOrderDashboardCount)
   app.get("/recentorders/admin",verifyToken, isAdminOrSubadmin, order.recentOrdersAdmin)
   app.get("/admin/user/dashboard/count/:userId",  verifyToken,  isAdminOrSubadmin, order.getUserDashboardCountByAdmin)
   app.get("/admin/user/orders/:userId",  verifyToken,  isAdminOrSubadmin, order.getUserOrdersByAdmin)
   app.put("/cancel/orders/:orderId",  verifyToken,    isAdminOrSubadmin,  order.cancelOrder)
   app.get("/allorders",verifyToken, isAdminOrSubadmin, order.getAllOrders)
   app.post("/shipping/fee",  verifyToken, isAdminOrSubadmin , order.postShippingFee)
   app.get("/shipping/fee",  verifyToken, order.getShippingFee)
}