const db = require("../mongoose");
const Orders = db.orders;
const Members = db.profiles;
const Products = db.products;
const Dispatchs = db.dispatchs;
const Notifications = db.notifications;

  const sendemail = require('../helpers/emailhelper.js');

// Add new product to database
exports.create = async(req, res) => {
  console.log(req.body)
  const {    paymentId  , amountPaid } = req.body;
  
  if ( amountPaid && paymentId  ){
      if ( amountPaid==="" || paymentId===""  ){
          res.status(400).send({
              message:"Incorrect entry format"
          });
      }else{
    
        const shippingaddress = JSON.parse(req.body.shippingDetails)
          const orders = new Orders({
             
            
              
              status: "Pending",
              buyerId: req.user.id,
              sellerId: "String",
              cartItems: req.body.cartItems,
              paymentResponse: req.body.paymentResponse,
              billingDetails: req.body.billingDetails,
              shippingFee: req.body.shippingFee,
              totalAmountPaid: req.body.totalAmountPaid,
              timeLine : "Pay",
              logisticId : "string",
              shippinDetails: "shippingaddress"
            

        
            });
  
       
          try{
             const emailFrom = 'Ahiajara Skin care    <noreply@Ahiajara.com>';
                const subject = 'New order alert';                      
                const hostUrl = "ahiajara.netlify.app/dashboard"
                 const hostUrl2 = "https://ahiajara.netlify.app/dashboard" 
              const admin = "Admin"
                const   text = "An new order from "+req.user.firstName+" "+req.user.lastName+" has been placed, Login to the dashboard to view" 
               const emailTo = 'tomiczilla@gmail.com'
               const link = `${hostUrl}`;
                 const link2 = `${hostUrl2}`;
                 processEmail(emailFrom, emailTo, subject, link, link2, text, admin);

                 const findadmin = await Members.findOne({isAdmin: 'true'} )
                 console.log(findadmin)
                  console.log(findadmin.id)
                 const notify = new Notifications({
                messageTo: findadmin.id,              
                read: false,
                messageFrom: req.user.id,
                messageFromFirstname: req.user.firstName,
                messageFromLastname: req.user.lastName,
                message: 'A new order request from '+req.user.firstName+' '+req.user.lastName+''
                
          
              });
            
               
                const makeorder = await  orders.save()
                const  requestOrder = await  notify.save()
                console.log(makeorder)
               res.status(201).send({message:"Order Succesful the admin will attend to it shortly"})
              
       
                     
              
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

// dispatch order
exports.dispatchOrder = async(req, res) => {
    console.log(req.body)
    const {   fullName, companyName  , phoneNumber,  orderId} = req.body;
    
    if (  fullName && companyName && phoneNumber &&  orderId ){
        if ( fullName==="" || companyName==="" || phoneNumber==="" || orderId=== "" ){
            res.status(400).send({
                message:"Incorrect entry format"
            });
        }else{
      // console.log(req.file)
      // console.log( JSON.stringify( req.file.url ) ) 
          
            const dispatchs = new Dispatchs({
                fullName: req.body.fullName,
                companyName: req.body.companyName,
                phoneNumber: req.body.phoneNumber,
                orderId: req.body.orderId,
                dispatcherId: req.body.dispatcherId   
              });
    
         
            try{
            //    const emailFrom = 'Ahiajara Skin care    <noreply@Ahiajara.com>';
            //       const subject = 'Dispatch alert';                      
            //       const hostUrl = "ahiajara.netlify.app/dashboard"
            //        const hostUrl2 = "https://ahiajara.netlify.app/dashboard" 
            //     const admin = "Admin"
            //       const   text = "An new order from "+req.user.firstName+" "+req.user.lastName+" has been placed, Login to the dashboard to view" 
            //      const emailTo = 'tomiczilla@gmail.com'
            //      const link = `${hostUrl}`;
            //        const link2 = `${hostUrl2}`;
            //        processEmail(emailFrom, emailTo, subject, link, link2, text, admin);
              
                 
                  const makedispatch = await  dispatchs.save()
                  console.log(makedispatch)
                
                    const _id = req.body.orderId;

                const updateProduct = await Orders.findOneAndUpdate({ _id }, { status: 'Dispatched' });
    
                  console.log(updateProduct)

                 res.status(201).send({message:"Order dispatched succesfully"})
                
         
                       
        
            }catch(err){
                console.log(err)
                res.status(500).send({message:"Error while dispatching order "})
            }
        }
    }else{
        res.status(400).send({
            message:"Incorrect entry format"
        });
    }
    };

// complete order
exports.completeOrder = async(req, res) => {
       
            try{
                          
              console.log(req.body)
              console.log(req.params)  
                    const _id = req.params.orderId;
                    getOrder = await Orders.findOne({_id: _id})
                  if(getOrder.status === "Dispatched"){
                const updateOrder = await Orders.findOneAndUpdate({ _id }, { status: 'Completed' });
                        if(updateOrder){
                  console.log(updateOrder)

                 res.status(200).send({message:"Order mark completed succesfully"})

                }else{
                    res.status(400).send({message:"Order not found "})
                }
            } else{
                res.status(400).send({message:"Order as not been dispatched "})
            }             
        
            }catch(err){
                console.log(err)
                res.status(500).send({message:"Error while completing order "})
            }
     
    };


  // process email one






exports.findPendingOrder = async (req, res) => {
    try{
        
            let status = "Pending"
        const findPendingOrder = await Orders.find({status: status}).sort({ _id: "desc" })
        // .limit(resultsPerPage)
        // .skip(resultsPerPage * page)
        console.log(findPendingOrder)
        res.status(200).send(findPendingOrder)
    // }        
       }catch(err){
           console.log(err)
           res.status(500).send({message:"Error while getting orders "})
       }
};

exports.findOrder = async (req, res) => {
    try{
        // console.log(req.query)
      
        // const resultsPerPage =  parseInt(req.query.limit);
        // const offset1 = parseInt(req.query.offset);
        // console.log(resultsPerPage)
        // console.log(offset1)
        // if(offset1 === 1){
            // const findAllProduct = await Products.find().sort({ _id: "desc" })
            // .limit(resultsPerPage)
            // console.log(findAllProduct)
            // res.status(200).send(findAllProduct)
        // }else{
            // const page = offset1 -1;
            let status = req.params.status
        const findOrder = await Orders.find({status: status}).sort({ _id: "desc" })
        // .limit(resultsPerPage)
        // .skip(resultsPerPage * page)
        console.log(findOrder)
        res.status(200).send(findOrder)
    // }        
       }catch(err){
           console.log(err)
           res.status(500).send({message:"Error while getting orders "})
       }
};

exports.findOrderById = async (req, res) => {
    try{
        // console.log(req.params.id)
         let orderDetails = {}
            let id = req.params.id
        const findOrder = await Orders.findOne({_id: id})
       console.log(findOrder.userId)
        console.log(findOrder.productId)
        console.log(findOrder.firstName)
        console.log(findOrder.lastName)
        console.log(findOrder.imgUrl)
        console.log(findOrder.price)
        console.log(findOrder.status)
        console.log(findOrder.name)
        const findDispatchDetails = await Dispatchs.findOne({orderId: id})
        
        const findMemberById = await Members.findOne({_id: findOrder.userId})
        const findProduct = await Products.findOne({_id:  findOrder.productId})
        
      //  console.log(findMemberById)
       // console.log(findProduct)
        orderDetails.order = findOrder
        orderDetails.userDetails = findMemberById
        orderDetails.productDetails = findProduct
        orderDetails.dispatchDetails = findDispatchDetails
     //   console.log(orderDetails)
        res.status(200).send(orderDetails)
    // }        
       }catch(err){
           console.log(err)
           res.status(500).send({message:"Error while getting orders "})
       }
};
exports.count = async (req, res) => {
    try{
const status = "Pending"
const status1 = "Completed"
allCount ={}
        const countPending = await Orders.countDocuments({status: status})
         const countCompleted = await Orders.countDocuments({status: status1})
         console.log(countPending)
         console.log(countCompleted)
        allCount.pendingOrder = countPending;
        allCount.completedOrder = countCompleted;
          res.status(200).send({countOfAllOrder:allCount})
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

exports.completedOrderByUserId = async (req, res) => {
    try{
      
            let status = "Completed"
            let userId = req.params.userId
        const findOrder = await Orders.find({status: status, userId: userId} ).sort({ _id: "desc" })
        
        console.log(findOrder)
        res.status(200).send(findOrder)
    // }        
       }catch(err){
           console.log(err)
           res.status(500).send({message:"Error while getting orders "})
       }
};

exports.inCompletedOrderByUserId = async (req, res) => {
    try{
      
            let status = "Pending"
             let status1 = "Dispatched"
              let userId = req.params.userId
        const findOrder = await Orders.find({$or:[{status: status1, userId: userId},{status: status, userId: userId}]} ).sort({ _id: "desc" })
   
        console.log(findOrder)
        res.status(200).send(findOrder)
    // }        
       }catch(err){
           console.log(err)
           res.status(500).send({message:"Error while getting orders "})
       }
};