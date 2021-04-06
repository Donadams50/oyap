const db = require("../mongoose");
const Carts = db.carts;
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'Bulkpay backend' },
    transports: [
      //
      // - Write all logs with level `error` and below to `error.log`
      // - Write all logs with level `info` and below to `combined.log`
      //
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' })
    ]
  });
 const sendemail = require('../helpers/emailhelper.js');

 // Add new symptom  to category
 exports.create = async(req, res) => {
    console.log(req.body)
   
    const {    cartQty, subTotal, productName,productType, productCategory,productPrice,productQuantity, productDescription,productInStock,productImages,sellerId,sellerphoneNumber,sellerFirstName,sellerLastName,sellerRegDate,sellerEmail,sellerpickUpDetails,sellerProfilePic  } = req.body;
 
    if (  cartQty && subTotal && productName ){
        if (  cartQty==="" || subTotal===""){
            res.status(400).send({
                message:"Incorrect entry format"
            });
   
        }else{
            if (req.body.productId ){
                 proId = req.body.productId
            }else{
                 proId = req.body.id
            }
          
            const cart = new Carts({
                productId: proId,
                cartQty: req.body.cartQty,
                userId:req.user.id,
                subTotal : req.body.subTotal,
                productName: req.body.productName,
                productType: req.body.productType,
                productCategory:req.body.productCategory,
                productPrice: req.body.productPrice,
                productQuantity: req.body.productQuantity,
                productDescription: req.body.productDescription,
                productInStock:req.body.productInStock,
                productImages: req.body.productImages,
                sellerId: req.body.sellerId,
                sellerphoneNumber: req.body.sellerphoneNumber,
                sellerFirstName: req.body.sellerFirstName,
                sellerLastName: req.body.sellerLastName,
                sellerRegDate: req.body.sellerRegDate,
                sellerEmail: req.body.sellerEmail,
                sellerpickUpDetails: req.body.seller,
                sellerProfilePic: req.body.sellerProfilePic
            
          
              }); 
    
         
            try{
           
                const isProductExist = await Carts.findOne({productId: proId, userId: req.user.id })
                if(isProductExist){
                 const _id = isProductExist.id
                   const cartqty = parseFloat(isProductExist.cartQty)  + parseFloat(cartQty);
                   const subtotal = parseFloat(isProductExist.subTotal)  + parseFloat(subTotal) ;
                    const updateCartQty= await Carts.findOneAndUpdate({ _id }, { cartQty: cartqty });
                    const updateCart= await Carts.findOneAndUpdate({ _id }, { subTotal: subtotal });  
                    if(updateCartQty &&updateCart){
                        console.log("addcart 5")   
                        res.status(201).send({message:"added to cart succesfuly 5" })   
                    }else{
                        res.status(400).send({message:"not succesfull "})
                    }

                    }else{            
                        const  addcart = await  cart.save()
                        console.log("addcart")              
                         if(addcart._id){                         
                         res.status(201).send({message:"added to cart succesfuly"})                   
                         }else{                  
                        res.status(400).send({message:"not succesfull "})
                          
                    }
                        
                   
                     
               }
                      
                
            }catch(err){
                console.log(err)
               
                res.status(500).send({message:"Error while creating question "})
            }
        }
    }else{
        res.status(400).send({
            message:"Incorrect entry format jj"
        });
    }
    };
    //get cart by userid
exports.findCartByUserId = async (req, res) => {
    try{
     
      console.log(req.params)
      
        let id = req.params.id;         
            const findcart = await Carts.find({userId:id})
           // .populate('productId')
          //  for(var i = 0; i< findcart.length; i++){
          //    findcart[i].productId.userd =   findcart[i].userId
          //    console.log(findcart[i])
          //   //  findcart[i].img =   findcart[i].productId.imgUrl
            //  findcart[i].priceItem =   findcart[i].productId.price
            //  findcart[i].categoryiTEM=   findcart[i].productId.category

           //}
           //console.log(findcart)
            res.status(200).send(findcart)
           
                          
       }catch(err){
        logger.log({
          level: 'error',
          message:"Server error",
          params: req.params,
              query: req.query,
              url: req.url,
              statusCode: 500,
          time :  new Date()
      
        });
        logger.add(new winston.transports.Console({
          format: winston.format.simple()
        }));
           console.log(err)
           res.status(500).send({message:"Error while getting product "})
       }
};
    //get cart by userid
    exports.countCart = async (req, res) => {
        try{
            let id = req.params.id;
            
                
             
                const countCart = await Carts.countDocuments({userId:id})
                console.log(countCart)

                res.status(200).send({"cartcount": countCart})
               
                              
           }catch(err){
               console.log(err)
               res.status(500).send({message:"Error while getting cart count "})
           }
    };

    exports.deleteCart = async (req, res) => {
      try{
          const id = req.params.id;
          const deletecart = await Carts.findByIdAndRemove(id)
          console.log(deletecart)
          res.status(200).send({message:"Cart deleted  succesfully "})
           
         }catch(err){
             console.log(err)
             res.status(500).send({message:"Error while deleting quecartstions "})
         }
  }