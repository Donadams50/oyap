const db = require("../mongoose");
const Orders = db.orders;
const Members = db.profiles;
const Carts = db.carts;
const Products = db.products;

  const sendemail = require('../helpers/emailhelper.js');

// Add new product to database
exports.createOrder = async(req, res) => {
 
  const {   cartItems, paymentResponse  , billingDetails, shippingFee, totalAmountPaid } = req.body;
  
  if ( cartItems&& paymentResponse  && billingDetails&& shippingFee&& totalAmountPaid  ){
      if ( cartItems.length < 1  || shippingFee==="" || paymentResponse==="" || billingDetails==="" || totalAmountPaid===""  ){
          res.status(400).send({
              message:"Incorrect entry format"
          });
      }else{
           const buyer = req.user
        for( var i = 0; i < cartItems.length; i++){
            
            basic= await PersistOneByOne(cartItems[i], paymentResponse, billingDetails, shippingFee, totalAmountPaid, buyer);
          
        
          }
     
         const emptyUserCart = await Carts.remove({ userId: buyer.id }) 
         console.log(emptyUserCart)
       
          try{
             
               res.status(201).send({message:"Order posted Succesfully"})
              
       
                     
              
          }catch(err){
              console.log(err)
              res.status(500).send({message:"Error while making order "})
          }
      }
  }else{
      res.status(400).send({
          message:"Incorrect entry format"
      });
  }
  };

  //find new order
exports.findNewOrder = async (req, res) => {
    try{
        const resultsPerPage =  parseInt(req.query.limit);
        const offset1 = parseInt(req.query.offset);

        let id = req.params.id
     
        if(offset1 === 1){
            const findOrder = await Orders.find({sellerId: id, isConfirmed : false }).sort({ _id: "desc" })
            .limit(resultsPerPage)
              if(findOrder){
                res.status(200).send(findOrder)
              }else{
                res.status(400).send({message:"No new order to fetch "})
              }

        }else{
            const page = offset1 -1;
            const findOrder = await Orders.find({sellerId: id, isConfirmed : false }).sort({ _id: "desc" })
            .limit(resultsPerPage)
            .skip(resultsPerPage * page)
        if(findOrder){
            res.status(200).send(findOrder)
          }else{
            res.status(400).send({message:"No new order to fetch "})
          }
         }
        
       }catch(err){
           console.log(err)
           res.status(500).send({message:"Error while getting orders "})
       }
};


// confirm order
exports.confirmOrderSeller = async(req, res) => {
       
            try{
                          
          
                      const _id = req.params.orderId;
                    getOrder = await Orders.findOne({_id: _id})
                    console.log(getOrder)
                    getBuyerDetails = await Members.findOne({_id:getOrder.buyerId})
                    if(getOrder.sellerId === req.user.id){
                        const timeline = {
                            "status" : " Order Confirmed",
                            "dateOccured":  new Date()
                        }
                const updateOrder = await Orders.updateOne({_id: _id}, { $addToSet: { timeLine: [timeline] } } );

                        if(updateOrder){
                const postIsComplete = await Orders.findOneAndUpdate({ _id }, { isConfirmed: true });         
                  const emailFrom = 'Oyap   <noreply@oyap.com.ng>';
                 const subject = 'Order Confirmed';                      
                 const hostUrl = "oyap.netlify.app"
                 const hostUrl2 = "https://oyap.netlify.app" 
                 const username =  getBuyerDetails.firstName
                 const   text = "This order has been confirmed by the farmer" 
               const emailTo = getBuyerDetails.email
               const link = `${hostUrl}`;
                 const link2 = `${hostUrl2}`;
                 processEmail(emailFrom, emailTo, subject, link, link2, text, username);

                 res.status(200).send({message:"Order confirmed succesfully"})

                }else{
                    res.status(400).send({message:"Order not found "})
                }
    
            }else{
                res.status(400).send({message:"Seller Id Invalid "})
            }
            }catch(err){
                console.log(err)
                res.status(500).send({message:"Error while confirming order "})
            }
     
    };

    // get orders by a particular seller
exports.findOrderByStatusBuyer = async (req, res) => {
        try{
            
            let status = req.params.status
            const resultsPerPage =  parseInt(req.query.limit);
            const offset1 = parseInt(req.query.offset);
           
            

            if(offset1 === 1){
                const findOrderByStatus = await Orders.find({ buyerId:req.user.id, status: status}).sort({ _id: "desc" })
                .limit(resultsPerPage)
                    res.status(200).send(findOrderByStatus)
            }else{
                const page = offset1 -1;
                const findOrderByStatus = await Orders.find({ buyerId:req.user.id, status: status}).sort({ _id: "desc" })
                .limit(resultsPerPage)
                .skip(resultsPerPage * page)
            
                res.status(200).send(findOrderByStatus)      
             }       
           }catch(err){
               console.log(err)
               res.status(500).send({message:"Error while getting orders "})
           }
    };

    // get orders by a particular seller
 exports.findOrderByStatusSeller = async (req, res) => {
        try{
            const resultsPerPage =  parseInt(req.query.limit);
            const offset1 = parseInt(req.query.offset);
            let status = req.params.status
             if(status === "Confirmed"){
                 stat = "Pending"
             }else{
                 stat = status;
             }

             if(offset1 === 1){
                const findOrderByStatus = await Orders.find({ sellerId:req.user.id, isConfirmed : true, status : stat}).sort({ _id: "desc" })
                .limit(resultsPerPage)
                    res.status(200).send(findOrderByStatus)
            }else{
                const page = offset1 -1;
                const findOrderByStatus = await Orders.find({ sellerId:req.user.id, isConfirmed : true, status : stat}).sort({ _id: "desc" })
                .limit(resultsPerPage)
                .skip(resultsPerPage * page)
            
                res.status(200).send(findOrderByStatus)      
             }  
               
           }catch(err){
               console.log(err)
               res.status(500).send({message:"Error while getting orders "})
           }
    };

 exports.findOrderById = async (req, res) => {
        try{
            
            let id = req.params.orderId
            const findOrderById = await Orders.findOne({ _id:id})
          
            res.status(200).send(findOrderById)
             
           }catch(err){
               console.log(err)
               res.status(500).send({message:"Error while getting orders "})
           }
    };

    
 exports.getAllConfirmedOrder = async (req, res) => {
        try{
            
           
            const findOrderByStatus = await Orders.find({  isConfirmed : true, status : "Pending"}).sort({ _id: "desc" })
           
           
            res.status(200).send(findOrderByStatus)
              
           }catch(err){
               console.log(err)
               res.status(500).send({message:"Error while getting orders "})
           }
    };
    
// confirm order
exports.confirmOrderLogistics = async(req, res) => {
       
    try{
                  
  
              const _id = req.params.orderId;
            getOrder = await Orders.findOne({_id: _id})
            console.log(getOrder)
            getBuyerDetails = await Members.findOne({_id:getOrder.buyerId})
            if(getOrder.sellerId === req.user.id){
                const timeline = {
                    "status" : " Order Confirmed",
                    "dateOccured":  new Date()
                }
        const updateOrder = await Orders.updateOne({_id: _id}, { $addToSet: { timeLine: [timeline] } } );

                if(updateOrder){
        const postIsComplete = await Orders.findOneAndUpdate({ _id }, { isConfirmed: true });         
          const emailFrom = 'Oyap   <noreply@oyap.com.ng>';
         const subject = 'Order Confirmed';                      
         const hostUrl = "oyap.netlify.app"
         const hostUrl2 = "https://oyap.netlify.app" 
         const username =  getBuyerDetails.firstName
         const   text = "This order has been confirmed by the farmer" 
       const emailTo = getBuyerDetails.email
       const link = `${hostUrl}`;
         const link2 = `${hostUrl2}`;
         processEmail(emailFrom, emailTo, subject, link, link2, text, username);

         res.status(200).send({message:"Order confirmed succesfully"})

        }else{
            res.status(400).send({message:"Order not found "})
        }

    }else{
        res.status(400).send({message:"Seller Id Invalid "})
    }
    }catch(err){
        console.log(err)
        res.status(500).send({message:"Error while confirming order "})
    }

};

  // Count dashboard count 
  exports.sellerDashboardCount = async (req, res) => {
    try{
      
        const countConfirmedOrder = await Orders.countDocuments({ sellerId:req.user.id, isConfirmed : true, status : "Pending"})
        const countCompletedOrder = await Orders.countDocuments({sellerId:req.user.id, isConfirmed : true, status : "Completed"})
        const countNewOrder = await Orders.countDocuments({sellerId:req.user.id, isConfirmed : false, status : "Pending"})
        const countAllProductSeller = await Products.countDocuments({sellerId:req.user.id})
        console.log(countConfirmedOrder)
        console.log(countCompletedOrder)
        console.log(countNewOrder)
        console.log(countAllProductSeller)
          res.status(200).send({countConfirmedOrder:countConfirmedOrder,countCompletedOrder:countCompletedOrder,countNewOrder:countNewOrder, countAllProductSeller: countAllProductSeller})
     }catch(err){
           console.log(err)
           res.status(500).send({message:"Error while counting orders "})
       }
};



async function processEmail(emailFrom, emailTo, subject, link, link2, text, fName){
  try{
      //create org details
      // await delay();
     const sendmail =  await sendemail.emailUtility(emailFrom, emailTo, subject, link, link2, text, fName);
   //  console.log(sendmail)
      return sendmail
  }catch(err){
      console.log(err)
      return err
  }

}



async function PersistOneByOne(cartDetails, paymentResponse, billingDetails, shippingFee, totalAmountPaid, buyer){
    const orders = new Orders({      
        status: "Pending",
        buyerId: buyer.id,
        sellerId: cartDetails.sellerId,
        cartItem: cartDetails,
        paymentResponse: paymentResponse,
        billingDetails: billingDetails,
        shippingFee: shippingFee,
        totalAmountPaid:totalAmountPaid,
        timeLine : [{
            status : "Payment Received",
            dateOccured:  new Date()
        }],
        logisticId : "",
        isConfirmed : false
      });
            
                
                      

               try{
              

                  await delay();
            
                const emailFrom = 'Oyap   <noreply@oyap.com.ng>';
                 const subject = 'New order alert';                      
                 const hostUrl = "oyap.netlify.app"
                 const hostUrl2 = "https://oyap.netlify.app" 
                 const username =  cartDetails.firstName
                 const   text = "An new order from "+buyer.firstName+" "+buyer.lastName+" has been placed, Login to the dashboard to view and" 
               const emailTo = cartDetails.sellerEmail
               const link = `${hostUrl}`;
                 const link2 = `${hostUrl2}`;
                 processEmail(emailFrom, emailTo, subject, link, link2, text, username);

                //  const findadmin = await Members.findOne({isAdmin: 'true'} )
                 
            //      const notify = new Notifications({
            //     messageTo: findadmin.id,              
            //     read: false,
            //     messageFrom: req.user.id,
            //     messageFromFirstname: req.user.firstName,
            //     messageFromLastname: req.user.lastName,
            //     message: 'A new order request from '+req.user.firstName+' '+req.user.lastName+''
                
          
            //   });
            
               
                const makeorder = await  orders.save()
                
                console.log(makeorder)
                return "done"
                
              

            }catch(err){
                console.log(err)
                //console.log("eror")
            }

}
function delay() {
    return new Promise(resolve => setTimeout(resolve, 300));
  }