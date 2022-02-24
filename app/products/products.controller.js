const db = require("../mongoose");
const Products = db.products;
const Productcategory = db.productcategories;
const Orders = db.orders;
const Productsubcategory = db.productsubcategories;
const sendemail = require('../helpers/emailhelper.js');
const mongoose = require("mongoose");
const dotenv=require('dotenv');
dotenv.config();
 
//Add new product to database
exports.create = async(req, res) => {
  console.log(req.body)
  // let {myrefCode} = req.query;
  const {   productName, productCategory , productSubcategory , productPrice, productQuantity, productDescription, productInStock, productImages , isLogistics, productWeight} = req.body;
  
  if ( productName && productCategory && productSubcategory && productPrice && productQuantity && productDescription && productInStock &&productImages && productWeight && isLogistics ){
      if ( productName==="" || productSubcategory==="" || productCategory==="" || productPrice==="" || productQuantity=== "" || productDescription ==="" || productInStock ==="" || productImages.length < 1 || productWeight === "" ){
          res.status(400).send({
              message:"Incorrect entry format"
          });
      }else{ 
   
           const rateInPrice = parseFloat(productPrice) * process.env.displayPriceRate
           const displayPriceCalc = parseFloat(rateInPrice) + parseFloat(productPrice) 

          const products = new Products({
            productName: productName,
            productSubcategory: productSubcategory,
            productCategory: productCategory,
            productPrice: productPrice,
            productQuantity: productQuantity,
            productDescription: productDescription,
            productInStock : true,
            productImages : productImages,
            sellerId: req.user.id,
            sellerphoneNumber: req.user.phoneNumber,
            sellerFirstName: req.user.firstName,
            sellerLastName: req.user.lastName,
            sellerEmail: req.user.email,
            sellerRegDate : req.user.createdAt,
            sellerProfilePic: req.user.profilePic,
            productWeight : productWeight,
            isLogistics : isLogistics,
            numberOfPurchase: 0,
            displayPrice: displayPriceCalc,
            feedback: []
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

//Find all products 
exports.findAllProductsForAUser = async (req, res) => {
    try{
        console.log(req.query)
      
        const resultsPerPage =  parseInt(req.query.limit);
        const offset1 = parseInt(req.query.offset);
        const sellerId = req.params.sellerId

        console.log(resultsPerPage)
        console.log(offset1)
        if(offset1 === 1){
            const findAllProduct = await Products.find({sellerId:sellerId}).sort({ _id: "desc" }).populate('productCategory').populate('productSubcategory')
            .limit(resultsPerPage)
            console.log(findAllProduct)
            res.status(200).send(findAllProduct)
        }else{
            const page = offset1 -1;
            const findAllProduct = await Products.find({sellerId:sellerId}).sort({ _id: "desc" }).populate('productCategory').populate('productSubcategory')
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

//Get product by id
exports.findProductById= async (req, res) => {
    try{
        let id = req.params.id;
        
            
            const findProduct = await Products.findOne({_id:id}).populate('productCategory').populate('productSubcategory')
            res.status(200).send(findProduct)
            console.log(findProduct)
                          
       }catch(err){
           console.log(err)
           res.status(500).send({message:"Error while getting product "})
       }
};

//Update a product
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
        productSubcategory: req.body.productSubcategory,
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
        isLogistics : req.body.isLogistics,
        productWeight : req.body.productWeight,
        numberOfPurchase: req.body.numberOfPurchase,
        feedback: req.body.feedback,
        displayPrice: req.body.displayPrice

   
      });
   
       try{

                       const findProductById = await Products.findOne({_id:req.params.id})
                       
                       if(findProductById.sellerId === req.user.id ){
                        const updateProduct = await Products.updateOne( {_id}, products)
                          // console.log(updateProduct)
                        //   const getProduct = await Products.findOne({_id:_id})
                        if(updateProduct.nModified === 1){
                           res.status(200).send({message:"Product updated "})
                        } else{
                            res.status(400).send({message:"Product not updated "})
                        }
                     } else{
                        res.status(400).send({message:"This product was not created  by this seller, You cannot update it"})
                     }
                        
          }
        catch(err){
                            console.log(err)
                            res.status(500).send({message:"Error while updating product "})
                        }
      
    //  

                   
};

//Delete product
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

//Create product category
exports.createProductCategory = async(req, res) => {
    console.log(req.body)
    // let {myrefCode} = req.query;
    const { categoryName } = req.body;
    
    if (categoryName){
        if (categoryName==="" ){
            res.status(400).send({
                message:"Incorrect entry format"
            });
        }else{ 
     
          
            const productcategory = new Productcategory({
              
              categoryName: categoryName
         
              });
    
         
            try{                  
                const findProductByCategory = await Productcategory.findOne({categoryName:categoryName})
          
              console.log(findProductByCategory)
              if(findProductByCategory){     
                  res.status(400).send({message:"This category already exist"})
              }else{
                  const saveproductcategory = await  productcategory.save()
              
                 res.status(201).send({message:"Product category created"})        
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
  
//Create product subcategory
exports.createProductSubcategory = async(req, res) => {
    

        const { categoryName,categoryId,subcategoryName } = req.body;
      
        if ( categoryName    && subcategoryName && categoryId ){
              if ( categoryName==="" ||    subcategoryName===""   || categoryId===""  ){
                res.status(400).send({
                    message:"Incorrect entry format5"
                });
            }else{
                
                    
                try{
                    const sess = await mongoose.startSession()
                    sess.startTransaction()
                    const subcategory = new Productsubcategory({     
                        categoryName: categoryName,
                        categoryId: categoryId,
                        subcategoryName: subcategoryName   
                      });
                    const saveSubCategory = await subcategory.save({session: sess})
                        await sess.commitTransaction()
                        sess.endSession();                  
                         res.status(201).send({message:"Created succesfully"})    
                }catch(err){
                    console.log(err)
                    res.status(500).send({message:"Error while creating Subcategory "})
                }   
              
            }
        }else{
            res.status(400).send({
                message:"Incorrect entry format6"
            });
        }
                       
    }

//Find all category
exports.getAllProductCategory = async (req, res) => {
    try{
            const findAllCategories = await Productcategory.find().sort({"_id": 1})    
            res.status(200).send(findAllCategories)
        
       }catch(err){
           console.log(err)
           res.status(500).send({message:"Error while getting all categories "})
       }
};

//Find subcategory by category id 
exports.getProductSubCategoryByCategoryId = async (req, res) => {
    try{
        
             let categoryId = req.params.categoryId
         const findsubcategoryByCategoryId = await Productsubcategory.find({categoryId: categoryId})
        
         res.status(200).send(findsubcategoryByCategoryId)
            
        }catch(err){
            console.log(err)
            res.status(500).send({message:"Error while getting sub category "})
        }
 
 };

//Find related product 
exports.findRelatedProduct = async (req, res) => {
    try{
        
         let subcategoryId = req.params.subcategoryId
         const findrelatedproduct = await Products.find({productSubcategory: subcategoryId})
         res.status(200).send(findrelatedproduct)
            
        }catch(err){
            console.log(err)
            res.status(500).send({message:"Error while getting related product"})
        }
 
 };

//Find all products 
exports.getAllProduct = async (req, res) => {
    try{
        console.log(req.query)
      
        const resultsPerPage =  parseInt(req.query.limit);
        const offset1 = parseInt(req.query.offset);
        console.log(resultsPerPage)
        console.log(offset1)
        if(offset1 === 1){
            const findAllProduct = await Products.find().sort({ _id: "desc" }).populate('productCategory').populate('productSubcategory')
            .limit(resultsPerPage)
            console.log(findAllProduct)
            res.status(200).send(findAllProduct)
        }else{
            const page = offset1 -1;
            const findAllProduct = await Products.find().sort({ _id: "desc" }).populate('productCategory').populate('productSubcategory')
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

//Count all products 
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




// buyer post feedback
exports.postFeedBack = async(req, res) => {
    try{
        const _id = req.params.productId;
        const orderId = req.body.orderId
        const getProduct = await Products.findOne({_id: _id})
        const  newPurchaseCount = parseInt(getProduct.numberOfPurchase) + 1
        const newFeedBack = {
             "message": req.body.feedback,
             "rating": req.body.rating,
             "rateMeaning" :req.body.rateMeaning,
             "buyerName": `${req.user.firstName } ${req.user.lastName}`,
             "buyerEmail": req.user.email,
             "buyerId": req.user.id,
             "date": new Date()
        }
        const updateProduct = await Products.updateOne({_id: _id}, { numberOfPurchase:newPurchaseCount, $addToSet: { feedback: [newFeedBack] }  } );
        if(updateProduct){
            const updateOrder= await Orders.updateOne({_id: orderId}, { isFeedbackGiven:true});


             res.status(200).send({message:"Feedback posted succesfully"})
        }else{
            res.status(400).send({message:"Feedback not saved"})
        }
    }catch(err){
        console.log(err)
        res.status(500).send({message:"Error while posting feedback "})
    }

};