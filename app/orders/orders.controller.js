const db = require("../mongoose");
const Orders = db.orders;
const Members = db.profiles;
const Withdrawrequest = db.withdrawrequests
const Carts = db.carts;
const Products = db.products;
const Shippingfee = db.shippingfees
const Transactions = db.transactions;
const mongoose = require("mongoose");
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
        // console.log(emptyUserCart)
       
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
                                const emailFrom = 'noreply@ioyap.com';;
                                const subject = 'Order Confirmed';                      
                                const hostUrl = "oyap.netlify.app"
                                const hostUrl2 = "https://oyap.netlify.app" 
                                const username =  getBuyerDetails.firstName
                                const   text = "This order has been confirmed by the farmer" 
                                const emailTo = getBuyerDetails.email
                                const adminEmail = process.env.user
                                const adminUserName = "Admin"
                                const textAdmin = " A farmer just confirmed an order, please login to start the logistics process"
                                const subjectAdmin = "New order alert"
                                const link = `${hostUrl}`;
                                const link2 = `${hostUrl2}`;
                                processEmail(emailFrom, emailTo, subject, link, link2, text, username);
                                processEmail(emailFrom, adminEmail, subjectAdmin, link, link2, textAdmin, adminUserName);

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

//cancel order

exports.cancelOrder = async(req, res) => {
       
    try{
        const sess = await mongoose.startSession()
        sess.startTransaction()
              const reason = req.body.reason
              const _id = req.params.orderId;
            getOrder = await Orders.findOne({_id: _id})
            console.log(getOrder)
            getBuyerDetails = await Members.findOne({_id:getOrder.buyerId})
            if(getOrder.status === "Completed" ){
                res.status(400).send({message:"This order cannot be cancelled, it has been confirmed already"})

                }else{
                    

                    const timeline = {
                        "status" : " Order Cancelled",
                        "dateOccured":  new Date()
                    }
            const updateOrder = await Orders.updateOne({_id: _id}, { $addToSet: { timeLine: [timeline] } }, { session: sess } );

              if(updateOrder){
                const updatecancellationReason= await Orders.findOneAndUpdate({ _id }, { cancellationReason: reason }, { session: sess });    
                const updateIsCancelledStatus = await Orders.findOneAndUpdate({ _id }, { isCancelled: true }, { session: sess });     
                const updateIsStatus = await Orders.findOneAndUpdate({ _id }, { status: "Cancelled" }, { session: sess }); 

                await sess.commitTransaction()
                    sess.endSession();
                const emailFrom = 'noreply@ioyap.com';;
                const subject = 'Order Cancelled';                      
                const hostUrl = "oyap.netlify.app"
                const hostUrl2 = "https://oyap.netlify.app" 
                const username =  getBuyerDetails.firstName
                const   text = "This order has been cancelled  by the Administrator, contact the admin for refund" 
                const emailTo = getBuyerDetails.email
                const link = `${hostUrl}`;
                const link2 = `${hostUrl2}`;
                processEmail(emailFrom, emailTo, subject, link, link2, text, username);

                res.status(200).send({message:"Order cancelled succesfully"})

            }else{
                res.status(400).send({message:"Order not found "})
            }

    }
    }catch(err){
        console.log(err)
        res.status(500).send({message:"Error while cancelling order "})
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

// find order by id
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

// find all confirmed id  
 exports.getAllConfirmedOrder = async (req, res) => {
        try{
            
           
            const findOrderByStatus = await Orders.find({  isConfirmed : true, status : "Pending", inTransit: false}).sort({ _id: "desc" })
           
           
            res.status(200).send(findOrderByStatus)
              
           }catch(err){
               console.log(err)
               res.status(500).send({message:"Error while getting orders "})
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

// confirm order delivered logistics
exports.confirmOrderLogistics = async(req, res) => {
       
    try{
                  
  
              const _id = req.params.orderId;
              const sess = await mongoose.startSession()
                    sess.startTransaction()
                  getOrder = await Orders.findOne({_id: _id})
                               // if(getOrder.status === "Pending"  ){
                                  if(getOrder.status === "Pending" && getOrder.logisticId === req.user.id && getOrder.isConfirmed === true && getOrder.inTransit === true ){
                                console.log(getOrder)
                                getSellerDetails = await Members.findOne({_id:getOrder.sellerId})
                            
                                    const timeline = {
                                        "status" : "Order Delivered",
                                        "dateOccured":  new Date()
                                    }
                                const updateOrder = await Orders.updateOne({_id: _id}, { $addToSet: { timeLine: [timeline] } } , { session: sess });

                        
                                const selId = getOrder.sellerId
                                const postIsComplete = await Orders.findOneAndUpdate({ _id }, { status: 'Completed' }, { session: sess });   
                                const postLogistics = await Orders.findOneAndUpdate({ _id }, { logisticId: req.user.id }, { session: sess });  
                                const finalAmount = parseFloat(getSellerDetails.walletBalance) + parseFloat( getOrder.subTotal)
                                    
                                const transactions = new Transactions({      
                                    status: "SUCCESSFUL",
                                    buyerId: getOrder.buyerId,
                                    sellerId: getOrder.sellerId,
                                    orderId: req.params.orderId,
                                    amount: getOrder.subTotal, 
                                    type : "Credit",
                                    initialBalance : parseFloat(getSellerDetails.walletBalance),
                                    finalBalance: finalAmount,
                                    productDetails : getOrder
                                });
                    
                                
                                const posttransaction = await  transactions.save({ session: sess })
                                const updateWallet = await Members.updateOne({ _id: selId}, { walletBalance: finalAmount });
                                await sess.commitTransaction()
                                sess.endSession();
                                const emailFrom = 'noreply@ioyap.com';;
                                const subject = 'Order Delivered';                      
                                const hostUrl = "oyap.netlify.app"
                                const hostUrl2 = "https://oyap.netlify.app" 
                                const username =  getSellerDetails.firstName
                                const   text = "This order has been delivered to the buyer and your wallet has been credited" 
                                const emailTo = getSellerDetails.email
                                const link = `${hostUrl}`;
                                const link2 = `${hostUrl2}`;
                                processEmail(emailFrom, emailTo, subject, link, link2, text, username);
  
                                res.status(200).send({message:"Order confirmed succesfully"})

                                
                                
                                

                            }else{
                                res.status(400).send({message:"This order is not on transit or has not been confirmed by the seller"})
                            }

  
                }catch(err){
                    console.log(err)
                    res.status(500).send({message:"Error while confirming order "})
                }

};


// confirm order on transit
exports.makeOrderOnTransit = async(req, res) => {
       
    try{
                  
  
              const _id = req.params.orderId;
              const sess = await mongoose.startSession()
              sess.startTransaction()
            getOrder = await Orders.findOne({_id: _id})
           if(getOrder.status === "Pending" && getOrder.inTransit === false && getOrder.isConfirmed === true ){
            getBuyerDetails = await Members.findOne({_id:getOrder.buyerId}, )
            
                const timeline = {
                    "status" : " Order in transit",
                    "dateOccured":  new Date()
                }
        const updateOrder = await Orders.updateOne({_id: _id}, { $addToSet: { timeLine: [timeline] } }, { session: sess } );
        const postIsComplete = await Orders.findOneAndUpdate({ _id }, { inTransit: true },  { session: sess });  
        const postLogistics = await Orders.findOneAndUpdate({ _id }, { logisticId: req.user.id }, { session: sess });  
        await sess.commitTransaction()
        sess.endSession();
          const emailFrom = 'Oyap   <noreply@oyap.com.ng>';
         const subject = 'Order in transit';                      
         const hostUrl = "oyap.netlify.app"
         const hostUrl2 = "https://oyap.netlify.app" 
         const username =  getBuyerDetails.firstName
         const   text = "Your order is on transit" 
       const emailTo = getBuyerDetails.email
       const link = `${hostUrl}`;
         const link2 = `${hostUrl2}`;
         processEmail(emailFrom, emailTo, subject, link, link2, text, username);

         res.status(200).send({message:"Order on transit"})
            }else{
                res.status(400).send({message:"This order is not in transit or has been completed"})
            }
        

   
    }catch(err){
        console.log(err)
        res.status(500).send({message:"Error while making order on transit "})
    }

};


 // Count order dashboard admin 
 exports.adminOrderDashboardCount = async (req, res) => {
    try{
      
        const countPendingOrder = await Orders.countDocuments({  status : "Pending", isConfirmed : false})
        const countCompletedOrder = await Orders.countDocuments({ status : "Completed", isConfirmed : true})
        const countPendingDelivery = await Orders.countDocuments({ status : "Pending", isConfirmed : true,})
        const countPendingPayment = await Withdrawrequest.countDocuments({ status : "PENDING"})
        const countCancelledOrder = await Orders.countDocuments({ status : "Cancelled"})
       
          res.status(200).send({countPendingOrder:countPendingOrder,countCompletedOrder:countCompletedOrder,countPendingDelivery:countPendingDelivery, countPendingPayment: countPendingPayment, countCancelledOrder: countCancelledOrder})
     }catch(err){ 
           console.log(err)
           res.status(500).send({message:"Error while getting admin dashboard details "})
       }
};

 //find new order
 exports.recentOrdersAdmin = async (req, res) => {
    try{
        const limit =  parseInt(req.query.limit);

        let limitDefault = 5
     
        if(limit){
            const findRecentOrder = await Orders.find({status: "Pending", isConfirmed : false }).sort({ _id: "desc" })
            .limit(limit)
              if(findRecentOrder){
                res.status(200).send(findRecentOrder)
              }else{
                res.status(400).send({message:"No new order to fetch"})
              }

        }else{
         
            const findRecentOrder = await Orders.find({status: "Pending", isConfirmed : false }).sort({ _id: "desc" })
            .limit(limitDefault)
         
        if(findRecentOrder){
            res.status(200).send(findRecentOrder)
          }else{
            res.status(400).send({message:"No new order to fetch "})
          }
         }
        
       }catch(err){
           console.log(err)
           res.status(500).send({message:"Error while getting orders "})
       }
};



 //find all order
 exports.getAllOrders = async (req, res) => {
    try{
        const resultsPerPage =  parseInt(req.query.limit);
        const offset1 = parseInt(req.query.offset);
        let status = req.query.status


        if(status === "Confirmed"){
            stat = "Pending"
          if(offset1 === 1){ 
              const findOrderByStatus = await Orders.find({  isConfirmed : true, status : stat}).sort({ _id: "desc" })
              .limit(resultsPerPage)
                  res.status(200).send(findOrderByStatus)
          }else{
              const page = offset1 -1;
              const findOrderByStatus = await Orders.find({  isConfirmed : true, status : stat}).sort({ _id: "desc" })
              .limit(resultsPerPage)
              .skip(resultsPerPage * page)
          
              res.status(200).send(findOrderByStatus)      
           }  
       }else if(status === "Pending"){
          if(offset1 === 1){
              const findOrderByStatus = await Orders.find({ isConfirmed : false, status : status}).sort({ _id: "desc" })
              .limit(resultsPerPage)
                  res.status(200).send(findOrderByStatus)
          }else{
              const page = offset1 -1;
              const findOrderByStatus = await Orders.find({ isConfirmed : false, status : status}).sort({ _id: "desc" })
              .limit(resultsPerPage)
              .skip(resultsPerPage * page)
          
              res.status(200).send(findOrderByStatus)      
           } 
       }else if(status === "Completed"){
          if(offset1 === 1){
              const findOrderByStatus = await Orders.find({ isConfirmed : true, status : status}).sort({ _id: "desc" })
              .limit(resultsPerPage)
                  res.status(200).send(findOrderByStatus)
          }else{
              const page = offset1 -1;
              const findOrderByStatus = await Orders.find({ isConfirmed : true, status : status}).sort({ _id: "desc" })
              .limit(resultsPerPage)
              .skip(resultsPerPage * page)
          
              res.status(200).send(findOrderByStatus)      
           } 
       }else if(status === "Cancelled"){
        if(offset1 === 1){
            const findOrderByStatus = await Orders.find({ isCancelled : true, status : status}).sort({ _id: "desc" })
            .limit(resultsPerPage)
                res.status(200).send(findOrderByStatus)
        }else{
            const page = offset1 -1;
            const findOrderByStatus = await Orders.find({ isCancelled : true, status : status}).sort({ _id: "desc" })
            .limit(resultsPerPage)
            .skip(resultsPerPage * page)
        
            res.status(200).send(findOrderByStatus)      
         } 
     }
     
       
         
       
         
        
       }catch(err){
           console.log(err)
           res.status(500).send({message:"Error while getting orders "})
       }
};



 // Count dashboard count 
 exports.getUserDashboardCountByAdmin = async (req, res) => {
    try{
      

             let userId = req.params.userId
             const findMemberById = await Members.findOne({_id: userId})

            if(findMemberById){



                if(findMemberById.role === "Seller"){
                    const countConfirmedOrder = await Orders.countDocuments({ sellerId:userId, isConfirmed : true, status : "Pending"})
                    const countCompletedOrder = await Orders.countDocuments({sellerId:userId, isConfirmed : true, status : "Completed"})
                    const countNewOrder = await Orders.countDocuments({sellerId:userId, isConfirmed : false, status : "Pending"})
                    const countAllProductSeller = await Products.countDocuments({sellerId:userId})
                    res.status(200).send({countConfirmedOrder:countConfirmedOrder,countCompletedOrder:countCompletedOrder,countNewOrder:countNewOrder, countAllProductSeller: countAllProductSeller})


                }else if(findMemberById.role === "Buyer"){
                    const countConfirmedOrder = await Orders.countDocuments({ buyerId:userId, isConfirmed : true, status : "Pending"})
                    const countCompletedOrder = await Orders.countDocuments({buyerId:userId, isConfirmed : true, status : "Completed"})
                    const countNewOrder = await Orders.countDocuments({buyerId:userId, isConfirmed : false, status : "Pending"})
                    res.status(200).send({countConfirmedOrder:countConfirmedOrder,countCompletedOrder:countCompletedOrder,countNewOrder:countNewOrder})

                }else if(findMemberById.role === "Logistics"){
                    const countConfirmedOrder = await Orders.countDocuments({ logisticId:userId, isConfirmed : true, status : "Pending"})
                    const countCompletedOrder = await Orders.countDocuments({logisticId:userId, isConfirmed : true, status : "Completed"})
                    res.status(200).send({countConfirmedOrder:countConfirmedOrder,countCompletedOrder:countCompletedOrder})

                }

                
        

            }else{
                res.status(400).send({message:"Invalid user id"})
            }
            }catch(err){
           console.log(err)
           res.status(500).send({message:"Error while counting orders "})
       }
};



   // get orders of a particular seller by admin
exports.getUserOrdersByAdmin = async (req, res) => {
    try{
        const resultsPerPage =  parseInt(req.query.limit);
        const offset1 = parseInt(req.query.offset);
        let status = req.query.status


        let userId = req.params.userId
        const findMemberById = await Members.findOne({_id: userId})
        console.log("err")
       if(findMemberById){
        if(findMemberById.role === "Seller"){
            
            if(status === "Confirmed"){
                stat = "Pending"
              if(offset1 === 1){ 
                  const findOrderByStatus = await Orders.find({ sellerId:userId, isConfirmed : true, status : stat}).sort({ _id: "desc" })
                  .limit(resultsPerPage)
                      res.status(200).send(findOrderByStatus)
              }else{
                  const page = offset1 -1;
                  const findOrderByStatus = await Orders.find({ sellerId:userId, isConfirmed : true, status : stat}).sort({ _id: "desc" })
                  .limit(resultsPerPage)
                  .skip(resultsPerPage * page)
              
                  res.status(200).send(findOrderByStatus)      
               }  
           }else if(status === "Pending"){
              if(offset1 === 1){
                  const findOrderByStatus = await Orders.find({ sellerId:userId, isConfirmed : false, status : status}).sort({ _id: "desc" })
                  .limit(resultsPerPage)
                      res.status(200).send(findOrderByStatus)
              }else{
                  const page = offset1 -1;
                  const findOrderByStatus = await Orders.find({ sellerId:userId, isConfirmed : false, status : status}).sort({ _id: "desc" })
                  .limit(resultsPerPage)
                  .skip(resultsPerPage * page)
              
                  res.status(200).send(findOrderByStatus)      
               } 
           }else if(status === "Completed"){
              if(offset1 === 1){
                  const findOrderByStatus = await Orders.find({ sellerId:userId, isConfirmed : true, status : status}).sort({ _id: "desc" })
                  .limit(resultsPerPage)
                      res.status(200).send(findOrderByStatus)
              }else{
                  const page = offset1 -1;
                  const findOrderByStatus = await Orders.find({ sellerId:userId, isConfirmed : true, status : status}).sort({ _id: "desc" })
                  .limit(resultsPerPage)
                  .skip(resultsPerPage * page)
              
                  res.status(200).send(findOrderByStatus)      
               } 
           }


        }else if(findMemberById.role === "Buyer"){
            if(status === "Confirmed"){
                stat = "Pending"
              if(offset1 === 1){ 
                  const findOrderByStatus = await Orders.find({ buyerId:userId, isConfirmed : true, status : stat}).sort({ _id: "desc" })
                  .limit(resultsPerPage)
                      res.status(200).send(findOrderByStatus)
              }else{
                  const page = offset1 -1;
                  const findOrderByStatus = await Orders.find({ buyerId:userId, isConfirmed : true, status : stat}).sort({ _id: "desc" })
                  .limit(resultsPerPage)
                  .skip(resultsPerPage * page)
              
                  res.status(200).send(findOrderByStatus)      
               }  
           }else if(status === "Pending"){
              if(offset1 === 1){
                  const findOrderByStatus = await Orders.find({ buyerId:userId, isConfirmed : false, status : status}).sort({ _id: "desc" })
                  .limit(resultsPerPage)
                      res.status(200).send(findOrderByStatus)
              }else{
                  const page = offset1 -1;
                  const findOrderByStatus = await Orders.find({ buyerId:userId, isConfirmed : false, status : status}).sort({ _id: "desc" })
                  .limit(resultsPerPage)
                  .skip(resultsPerPage * page)
              
                  res.status(200).send(findOrderByStatus)      
               } 
           }else if(status === "Completed"){
              if(offset1 === 1){
                  const findOrderByStatus = await Orders.find({ buyerId:userId, isConfirmed : true, status : status}).sort({ _id: "desc" })
                  .limit(resultsPerPage)
                      res.status(200).send(findOrderByStatus)
              }else{
                  const page = offset1 -1;
                  const findOrderByStatus = await Orders.find({ buyerId:userId, isConfirmed : true, status : status}).sort({ _id: "desc" })
                  .limit(resultsPerPage)
                  .skip(resultsPerPage * page)
              
                  res.status(200).send(findOrderByStatus)      
               } 
          }

        }else if(findMemberById.role === "Logistics"){
            if(status === "Confirmed"){
                stat = "Pending"
              if(offset1 === 1){ 
                  const findOrderByStatus = await Orders.find({ logisticId:userId, isConfirmed : true, status : stat}).sort({ _id: "desc" })
                  .limit(resultsPerPage)
                      res.status(200).send(findOrderByStatus)
              }else{
                  const page = offset1 -1;
                  const findOrderByStatus = await Orders.find({ logisticId:userId, isConfirmed : true, status : stat}).sort({ _id: "desc" })
                  .limit(resultsPerPage)
                  .skip(resultsPerPage * page)
              
                  res.status(200).send(findOrderByStatus)      
               }  
           }else if(status === "Pending"){
              if(offset1 === 1){
                  const findOrderByStatus = await Orders.find({ logisticId:userId, isConfirmed : false, status : status}).sort({ _id: "desc" })
                  .limit(resultsPerPage)
                      res.status(200).send(findOrderByStatus)
              }else{
                  const page = offset1 -1;
                  const findOrderByStatus = await Orders.find({ logisticId:userId, isConfirmed : false, status : status}).sort({ _id: "desc" })
                  .limit(resultsPerPage)
                  .skip(resultsPerPage * page)
              
                  res.status(200).send(findOrderByStatus)      
               } 
           }else if(status === "Completed"){
              if(offset1 === 1){
                  const findOrderByStatus = await Orders.find({ logisticId:userId, isConfirmed : true, status : status}).sort({ _id: "desc" })
                  .limit(resultsPerPage)
                      res.status(200).send(findOrderByStatus)
              }else{
                  const page = offset1 -1;
                  const findOrderByStatus = await Orders.find({ logisticId:userId, isConfirmed : true, status : status}).sort({ _id: "desc" })
                  .limit(resultsPerPage)
                  .skip(resultsPerPage * page)
              
                  res.status(200).send(findOrderByStatus)      
               } 
          }

        }



       }else{
        res.status(400).send({message:"Invalid user id"})
       }
         

         
           
       }catch(err){
           console.log(err)
           res.status(500).send({message:"Error while getting orders "})
       }
};


// Add new product to database
exports.postShippingFee = async(req, res) => {
 
    const {   location, maxWeight  , minWeight, fee } = req.body;
    
    if ( location&& maxWeight  && minWeight&& fee  ){
        if ( minWeight==="" || fee==="" || maxWeight==="" || location===""  ){
            res.status(400).send({
                message:"Incorrect entry format"
            });
        }else{
            const shipfee = new Shippingfee({
                location : req.body.location,
                maxWeight: req.body.maxWeight,
                minWeight: req.body.minWeight,
                fee: req.body.fee
              });
         
            try{
                const saveshippingfee = await  shipfee.save()
                res.status(201).send({message:"shipping fee posted Succesfully"})
            }catch(err){
                console.log(err)
                res.status(500).send({message:"Error while creating shipping fee "})
            }
        }
    }else{
        res.status(400).send({
            message:"Incorrect entry format"
        });
    }
};

exports.getShippingFee = async (req, res) => {
    try{
        
        const findShippingFees= await Shippingfee.find().sort({ _id: "desc" })
        if(findShippingFees){
            res.status(200).send(findShippingFees)
          }else{
            res.status(400).send({message:"No shipping to fetch "})
          }
         
       }catch(err){
           console.log(err)
           res.status(500).send({message:"Error while getting shipping fee "})
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
        subTotal: cartDetails.subTotal,
        timeLine : [{
            status : "Payment Received",
            dateOccured:  new Date()
        }],
        logisticId : "",
        isConfirmed : false,
        inTransit : false,
        cancellationReason: "",
        isCancelled: false,
        isFeedbackGiven: false
        
      });
            
                
                      

               try{
              

                  await delay();
            
                const emailFrom = 'noreply@ioyap.com';
                 const subject = 'New order alert';                      
                 const hostUrl = "oyap.netlify.app"
                 const hostUrl2 = "https://oyap.netlify.app" 
                 const username =  cartDetails.sellerFirstName
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