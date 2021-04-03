module.exports = app => {
    const product = require("./products.controller");
    const jwtTokenUtils = require('../helpers/jwtTokenUtils')
    const { verifyToken,  isSeller, isBuyer, isLogistics, isAdmin } = jwtTokenUtils;
    require('../cloudinary/cloudinary.js')
    const upload = require('../cloudinary/multer.js');
 
        
 app.post("/product",  verifyToken, isSeller,   product.create)
  app.get("/sellerproducts/:sellerId",  verifyToken, isSeller,  product.findAllProductsForAUser)
  app.get("/products/:id",  verifyToken,   product.findProductById)
 // app.get("/products/count",  verifyToken,   product.countProduct)
  app.delete("/products/:id",  verifyToken, isSeller, product.deleteProduct);
   app.put("/products/:id",  verifyToken, isSeller,  product.updateProduct)

}