const db = require("../mongoose");
const Orders = db.orders;
const Members = db.profiles;
const Withdrawrequest = db.withdrawrequests
const Carts = db.carts;
const Products = db.products;
const Transactions = db.transactions;
const mongoose = require("mongoose");
  const sendemail = require('../helpers/emailhelper.js');

  // Count order dashboard admin 
 exports.adminLogisticsDashboardCount = async (req, res) => {
    try{
      
        const countNewDelivery = await Orders.countDocuments({  status : "Pending", inTransit : false})
        const countInTransit = await Orders.countDocuments({ status : "Pending", inTransit : true})
        const countCompletedDelivery = await Orders.countDocuments({ status : "Completed", isConfirmed : true,})
        const countCancelledDelivery = await Orders.countDocuments({ isCancelled: true , status : "Cancelled"})
       
          res.status(200).send({countNewDelivery:countNewDelivery,countInTransit:countInTransit,countCompletedDelivery:countCompletedDelivery,countCancelledDelivery: countCancelledDelivery})
     }catch(err){ 
           console.log(err)
           res.status(500).send({message:"Error while getting admin dashboard details "})
       }
};


//find  order
exports.getLogisticsByAdmin = async (req, res) => {
    console.log("i enter")
    try{
        const resultsPerPage =  parseInt(req.query.limit);
        const offset1 = parseInt(req.query.offset);
        let status = req.query.status


        if(status === "Intransit"){
            stat = "Pending"
          if(offset1 === 1){ 
              const findOrderByStatus = await Orders.find({  inTransit : true, status : stat}).sort({ _id: "desc" })
              .limit(resultsPerPage)
                  res.status(200).send(findOrderByStatus)
          }else{
              const page = offset1 -1;
              const findOrderByStatus = await Orders.find({  inTransit : true, status : stat}).sort({ _id: "desc" })
              .limit(resultsPerPage)
              .skip(resultsPerPage * page)
          
              res.status(200).send(findOrderByStatus)      
           }  
       }else if(status === "Pending"){
          if(offset1 === 1){
              const findOrderByStatus = await Orders.find({ inTransit : false, status : status}).sort({ _id: "desc" })
              .limit(resultsPerPage)
                  res.status(200).send(findOrderByStatus)
          }else{
              const page = offset1 -1;
              const findOrderByStatus = await Orders.find({ inTransit : false, status : status}).sort({ _id: "desc" })
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

