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
    logger.log({
        level: 'info',
        message: 'The body of the message',
        body: req.body,
        time :  new Date()
      });
      logger.add(new winston.transports.Console({
        format: winston.format.simple()
      }));
    const {   productId, userId, quantitySelected  } = req.body;
    
    if ( productId && userId && quantitySelected ){
        if ( productId==="" || userId==="" || quantitySelected===""){
            res.status(400).send({
                message:"Incorrect entry format"
            });
   logger.log({
    level: 'error',
    message:"Incorrect entry format",
    
    time :  new Date()

  });
       logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
        }else{
    
          
            const cart = new Carts({
                productId: req.body.productId,
                userId: req.body.userId,
                quantitySelected: req.body.quantitySelected,
                productName: req.body.productName,
                productImgUrl: req.body.productImgUrl,
                productPrice:req.body.productPrice,
                productCategory: req.body.productCategory
                
          
              });
    
         
            try{
      
              const  addcart = await  cart.save()
              console.log(addcart)
           
               if(addcart._id){
                logger.log({
                    level: 'info',
                    message:"added to cart succesfuly",
                    
                    time :  new Date()
                
                  });
                  logger.add(new winston.transports.Console({
                    format: winston.format.simple()
                  }));
               res.status(201).send({message:"added to cart succesfuly"})
                  
                
               }else{
                logger.log({
                  level: 'error',
                  message:"not  succesfuly",
                  
                  time :  new Date()
              
                });
                logger.add(new winston.transports.Console({
                  format: winston.format.simple()
                }));
             
             
              res.status(400).send({message:"not succesfull "})
                
          }
                       
                
            }catch(err){
                console.log(err)
                logger.log({
                  level: 'info',
                  message:"Server Error",
                  
                  time :  new Date()
              
                });
                logger.add(new winston.transports.Console({
                  format: winston.format.simple()
                }));
                res.status(500).send({message:"Error while creating question "})
            }
        }
    }else{
        res.status(400).send({
            message:"Incorrect entry format"
        });
    }
    };
    //get cart by userid
exports.findCartByUserId = async (req, res) => {
    try{
      console.log(req.url)
      console.log(req.params)
      console.log(req.query)
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