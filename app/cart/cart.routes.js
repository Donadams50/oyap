module.exports = app => {
    const cart = require("./cart.controller");
    const jwtTokenUtils = require('../helpers/jwtTokenUtils')
    const { verifyToken, isAdmin } = jwtTokenUtils;
   
 
        
  app.post("/cart",  verifyToken,  cart.create);
  //  app.get("/cart/:id",  verifyToken,   cart.findCartByUserId);
  //  app.get("/cartcount/:id",  verifyToken,   cart.countCart); 
  //   app.delete("/cart/:id",  verifyToken,  cart.deleteCart);
//  app.put("/questions/:id",  verifyToken,  isAdmin,    bespoke.update);
//  app.post("/entry",  verifyToken, bespoke.postEntry);
//  app.get("/entry",  verifyToken, isAdmin,  bespoke.getEntry);
//  app.get("/entry/:id",  verifyToken, isAdmin,  bespoke.getSingleEntry)
//  app.put("/entry/:id",  verifyToken,  isAdmin,    bespoke.reply);
}