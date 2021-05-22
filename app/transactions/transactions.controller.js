const db = require("../mongoose");
const Transactions = db.transactions;
const mongoose = require("mongoose");
const sendemail = require('../helpers/emailhelper.js');
const dotenv=require('dotenv');
      dotenv.config()
  //find new order
exports.getTransactionHistory = async (req, res) => {
    try{
        const resultsPerPage =  parseInt(req.query.limit);
        const offset1 = parseInt(req.query.offset);

        let id = req.user.id
     
        if(offset1 === 1){
            const findTransaction = await Transactions.find({sellerId: id }).sort({ _id: "desc" })
            .limit(resultsPerPage)
              if(findTransaction){
                res.status(200).send(findOrder)
              }else{
                res.status(400).send({message:"No transaction to fetch "})
              }

        }else{
            const page = offset1 -1;
            const findTransaction = await Transactions.find({sellerId: id }).sort({ _id: "desc" })
            .limit(resultsPerPage)
            .skip(resultsPerPage * page)
        if(findTransaction){
            res.status(200).send(findTransaction)
          }else{
            res.status(400).send({message:"No new order to fetch "})
          }
         }
        
       }catch(err){
           console.log(err)
           res.status(500).send({message:"Error while getting orders "})
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

