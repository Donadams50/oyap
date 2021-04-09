const db = require("../mongoose");
const Products = db.products;
const Producttypes = db.producttypes;
 const sendemail = require('../helpers/emailhelper.js');
 const dotenv=require('dotenv');
 dotenv.config();
 
// Add new product to database
exports.create = async(req, res) => {
  console.log(req.body)
  // let {myrefCode} = req.query;
  const {   productName, productType  , productCategory , productPrice, productQuantity, productDescription, productInStock, productImages } = req.body;
  
  if ( productName && productType && productCategory && productPrice && productQuantity && productDescription && productInStock &&productImages){
      if ( productName==="" || productType==="" || productCategory==="" || productPrice==="" || productQuantity=== "" || productDescription ==="" || productInStock ==="" || productImages.length < 1 ){
          res.status(400).send({
              message:"Incorrect entry format"
          });
      }else{ 
   
        
          const products = new Products({
            productName: req.body.productName,
            productType: req.body.productType,
            productCategory: req.body.productCategory,
            productPrice: req.body.productPrice,
            productQuantity: req.body.productQuantity,
            productDescription: req.body.productDescription,
            productInStock : true,
            productImages : req.body.productImages,
            sellerId: req.user.id,
            sellerphoneNumber: req.user.phoneNumber,
            sellerFirstName: req.user.firstName,
            sellerLastName: req.user.lastName,
            sellerEmail: req.user.email,
            sellerRegDate : req.user.createdAt,
            sellerProfilePic: req.user.profilePic

       
            });
  
       
          try{                  
            const countProductByUser = await Products.countDocuments({sellerId:req.user.id})  
            console.log("countProduct")
            console.log(countProductByUser)
            if(countProductByUser >= process.env.noOfProductToUpload){     
                res.status(400).send({message:"You cant upload more than 5 product "})
            }else{
                const saveproduct = await  products.save()
                console.log(saveproduct)
               res.status(201).send({message:"Product created"})        
            }
          }catch(err){
              console.log(err)
              res.status(500).send({message:"Error while creating product "})
          }
      }
  }else{
      res.status(400).send({
          message:"Incorrect entry format"
      });
  }
  };

  // Find all products 
exports.findAllProductsForAUser = async (req, res) => {
    try{
        console.log(req.query)
      
        const resultsPerPage =  parseInt(req.query.limit);
        const offset1 = parseInt(req.query.offset);
        const sellerId = req.params.sellerId

        console.log(resultsPerPage)
        console.log(offset1)
        if(offset1 === 1){
            const findAllProduct = await Products.find({sellerId:sellerId}).sort({ _id: "desc" })
            .limit(resultsPerPage)
            console.log(findAllProduct)
            res.status(200).send(findAllProduct)
        }else{
            const page = offset1 -1;
            const findAllProduct = await Products.find({sellerId:sellerId}).sort({ _id: "desc" })
        .limit(resultsPerPage)
        .skip(resultsPerPage * page)
        console.log(findAllProduct)
        res.status(200).send(findAllProduct)
    }        
       }catch(err){
           console.log(err)
           res.status(500).send({message:"Error while getting product "})
       }
};


//get product by id
exports.findProductById= async (req, res) => {
    try{
        let id = req.params.id;
        
            
            const findProduct = await Products.findOne({_id:id})
            res.status(200).send(findProduct)
            console.log(findProduct)
                          
       }catch(err){
           console.log(err)
           res.status(500).send({message:"Error while getting product "})
       }
};

// Update a product
exports.updateProduct = async(req, res) => {
    const _id = req.params.id;
    if(req.body.productQuantity > 1){
        productInStock = true
     } else{
        productInStock = false
     }
           const products = new Products({
        _id : req.params.id,
        productName: req.body.productName,
        productType: req.body.productType,
        productCategory: req.body.productCategory,
        productPrice: req.body.productPrice,
        productQuantity: req.body.productQuantity,
        productDescription: req.body.productDescription,
        productInStock : productInStock,
        productImages : req.body.productImages,
        sellerId: req.user.id,
        sellerphoneNumber: req.user.phoneNumber,
        sellerfirstName: req.user.firstName,
        sellerlastName: req.user.lastName,
        sellerEmail: req.user.email,
   
      });
   
       try{

                       const findProductById = await Products.findOne({_id:req.params.id})
                       
                       if(findProductById.sellerId === req.user.id ){
                        const updateProduct = await Products.updateOne( {_id}, products)
                           console.log(updateProduct)
                        //   const getProduct = await Products.findOne({_id:_id})
                        if(updateProduct.nModified === 1){
                           res.status(200).send({message:"Product updated "})
                        } else{
                            res.status(400).send({message:"Product not updated "})
                        }
                     } else{
                        res.status(400).send({message:"This product was not created  by this seller, You cant update it "})
                     }
                        
          }
        catch(err){
                            console.log(err)
                            res.status(500).send({message:"Error while updating product "})
                        }
      
    //  

                   
};



// delete product
exports.deleteProduct = async (req, res) => {
    try{
        const id = req.params.id;
        const deleteproduct = await Products.findByIdAndRemove(id)
        console.log(deleteproduct)
        res.status(200).send({message:"Deleted succesfully"})
         
       }catch(err){
           console.log(err)
           res.status(500).send({message:"Error while getting questions "})
       }
}

//get product by TYPE
exports.findProductByType = async (req, res) => {
    try{
        
        let type = req.params.type;
        
            const findProductByTypes = await Producttypes.find({productType:type}).sort({ _id: "desc" })    
            console.log(findProductByTypes)
            res.status(200).send(findProductByTypes)
              
       }catch(err){
           console.log(err)
           res.status(500).send({message:"Error while getting product "})
       }
};


exports.createProductType = async(req, res) => {
    console.log(req.body)
    // let {myrefCode} = req.query;
    const {    productCategory , productType } = req.body;
    
    if ( productType && productCategory  ){
        if (  productType==="" || productCategory==="" ){
            res.status(400).send({
                message:"Incorrect entry format"
            });
        }else{ 
     
          
            const producttypes = new Producttypes({
              productType: req.body.productType,
              productCategory: req.body.productCategory
         
              });
    
         
            try{                  
                const findProductByCategory = await Producttypes.findOne({productCategory:productCategory})
          
              console.log(findProductByCategory)
              if(findProductByCategory){     
                  res.status(400).send({message:"This category already exist"})
              }else{
                  const saveproducttype = await  producttypes.save()
                  console.log(saveproducttype)
                 res.status(201).send({message:"Product type created"})        
              }
            }catch(err){
                console.log(err)
                res.status(500).send({message:"Error while creating product type "})
            }
        }
    }else{
        res.status(400).send({
            message:"Incorrect entry format"
        });
    }
    };
  

      // Find all products 
exports.getAllProduct = async (req, res) => {
    try{
        console.log(req.query)
      
        const resultsPerPage =  parseInt(req.query.limit);
        const offset1 = parseInt(req.query.offset);
        console.log(resultsPerPage)
        console.log(offset1)
        if(offset1 === 1){
            const findAllProduct = await Products.find().sort({ _id: "desc" })
            .limit(resultsPerPage)
            console.log(findAllProduct)
            res.status(200).send(findAllProduct)
        }else{
            const page = offset1 -1;
            const findAllProduct = await Products.find().sort({ _id: "desc" })
        .limit(resultsPerPage)
        .skip(resultsPerPage * page)
        console.log(findAllProduct)
        res.status(200).send(findAllProduct)
    }        
       }catch(err){
           console.log(err)
           res.status(500).send({message:"Error while getting product "})
       }
};
  // Count all products 
exports.countProduct = async (req, res) => {
    try{
         let category1 = "Hair"
         let category2 = "Skin"
        const countProduct = await Products.countDocuments()
        const countProductHair = await Products.countDocuments({category:category1})
        const countProductSkin = await Products.countDocuments({category:category2})
        console.log(countProductHair)
        console.log(countProduct)
        console.log(countProductSkin)
          res.status(200).send({countOfAllProduct:countProduct,countHair:countProductHair,counSkin:countProductSkin})
     }catch(err){
           console.log(err)
           res.status(500).send({message:"Error while counting product "})
       }
};



