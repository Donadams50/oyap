
const db = require("../mongoose");
const Transactions = db.transactions;
const Withdrawrequest = db.withdrawrequests
const Members = db.profiles;
const mongoose = require("mongoose");

 const axios = require('axios')
 
const sendemail = require('../helpers/emailhelper.js');
const dotenv=require('dotenv');
      dotenv.config()

// withdraw  funds
exports.withdrawFunds = async(req, res) => {

    const {    amount  , accountName, accountNumber, bankName } = req.body;
         
    if (  amount  && accountName && accountNumber&& bankName  ){
      if ( amount === ""  || accountName ==="" || accountNumber==="" || bankName===""  ){
          res.status(400).send({
              message:"Incorrect entry format"
          });
      }else{
  
              try{
                getUser = await Members.findOne({_id: req.user.id})
                const walletBalance =  parseFloat(getUser.walletBalance)
                const finalBalance  =  parseFloat(getUser.walletBalance) - parseFloat(amount) 
                const mimimumWithdrawer = parseFloat(process.env.mimimumWithdrawer) 
                const transAmount = parseFloat(amount)
  
                const withdrawrequest = new Withdrawrequest({      
                  status: "PENDING",
                  userDetails: req.user.id,
                  bankName: bankName,
                  accountName: accountName,
                  accountNumber: accountNumber,
                  amount:amount
        
                });     
                
                const transactions = new Transactions({      
                  status: "SUCCESSFUL",
                  sellerId: req.user.id,              
                  amount: amount, 
                  type : "Debit",
                  initialBalance : walletBalance,
                  finalBalance: finalBalance,
                  bankName: bankName,
                  accountName: accountName,
                  accountNumber: accountNumber,
                  narration : "Fund withdrawer"
                  
              });
  
                  
                      const sess = await mongoose.startSession()
                      sess.startTransaction()
                      
                       
                    if(walletBalance >= transAmount && transAmount > mimimumWithdrawer){
                              
                              const _id = req.user.id
                              const saveTransaction = await  transactions.save({ session: sess })
                              const saveWithdreawerRequest = await withdrawrequest.save({ session: sess }) 
                              const withdrawerRequestId = saveWithdreawerRequest._id
                              const updateUserWallet = await Members.findOneAndUpdate({ _id }, { walletBalance: finalBalance }, { session: sess });  
                              const updateWithdrawerRequest = await Withdrawrequest.findOneAndUpdate({ withdrawerRequestId }, { transactionId: saveTransaction._id }, { session: sess });  

                              await sess.commitTransaction()
                              sess.endSession();
  
                              const emailFrom = 'noreply@ioyap.com';
                              const subject = 'New withdrawer request';                      
                              const hostUrl = "oyap.netlify.app"
                              const hostUrl2 = "https://oyap.netlify.app" 
                              const username =  req.user.firstName
                              const   text = "A new payment request from "+req.user.lastName+" "+req.user.firstName+"  Amount: "+amount+" " 
                              //const emailTo = "noreply@ioyap.com"
                              const emailTo = "sumbomatic@gmail.com"
                              const link = `${hostUrl}`;
                              const link2 = `${hostUrl2}`;
                              processEmail(emailFrom, emailTo, subject, link, link2, text, username);
  
                              res.status(200).send({message:"Processing your request"})
                      }else{
                          res.status(400).send({message:"Minimum withdrawer exceeded or insufficient fund"})
                      }
                  
  
            
              }catch(err){
                  console.log(err)
                  res.status(500).send({message:"Error while making withdrawer request "})
              }
  
        }
      }else{
          res.status(400).send({
              message:"Incorrect entry format"
          });
      }
  
  
  };

  
  //find  order
exports.getAllWithdrawer = async (req, res) => {
    console.log("i enter")
    try{
        const resultsPerPage =  parseInt(req.query.limit);
        const offset1 = parseInt(req.query.offset);
        let status = req.query.status


      if(status === "Pending"){
          if(offset1 === 1){
              const findWithdrawerRequest = await Withdrawrequest.find({  status : "PENDING"}).sort({ _id: "desc" }).populate('userDetails')
              .limit(resultsPerPage)
                  res.status(200).send(findWithdrawerRequest)
          }else{
              const page = offset1 -1;
              const findWithdrawerRequest = await Withdrawrequest.find({ status : "PENDING"}).sort({ _id: "desc" }).populate('userDetails')
              .limit(resultsPerPage)
              .skip(resultsPerPage * page)
          
              res.status(200).send(findWithdrawerRequest)      
           } 
       }else if(status === "Completed"){
          if(offset1 === 1){
              const findWithdrawerRequest = await Withdrawrequest.find({  status : "COMPLETED"}).sort({ _id: "desc" }).populate('userDetails')
              .limit(resultsPerPage)
                  res.status(200).send(findWithdrawerRequest)
          }else{
              const page = offset1 -1;
              const findWithdrawerRequest = await Withdrawrequest.find({ status : "COMPLETED"}).sort({ _id: "desc" }).populate('userDetails')
              .limit(resultsPerPage)
              .skip(resultsPerPage * page)
          
              res.status(200).send(findWithdrawerRequest)      
           } 
       }else if(status === "Cancelled"){
        if(offset1 === 1){
            const findWithdrawerRequest = await Withdrawrequest.find({  status : "CANCELLED"}).sort({ _id: "desc" }).populate('userDetails')
            .limit(resultsPerPage)
                res.status(200).send(findWithdrawerRequest)
        }else{
            const page = offset1 -1;
            const findWithdrawerRequest = await Withdrawrequest.find({  status : "CANCELLED"}).sort({ _id: "desc" }).populate('userDetails')
            .limit(resultsPerPage)
            .skip(resultsPerPage * page)
        
            res.status(200).send(findWithdrawerRequest)      
         } 
     }
     
       
         
       
         
        
       }catch(err){
           console.log(err)
           res.status(500).send({message:"Error while getting Withdrawer request "})
       }
};





exports.completeRequest = async(req, res) => {
       
    try{
        const sess = await mongoose.startSession()
        sess.startTransaction()
              
              const _id = req.params.withdrawerrequestId;
            getWithdrawerRequest = await Withdrawrequest.findOne({_id: _id})
            console.log(getWithdrawerRequest)
            getUserDetails = await Members.findOne({_id:getWithdrawerRequest.userDetails})
            console.log(getUserDetails)
            if(getWithdrawerRequest.status === "COMPLETED" || getWithdrawerRequest.status === "CANCELLED" ){
                res.status(400).send({message:"This order withdrawer has been completed or cancelled"})

             }else{     

                const updateWithdrawerrequest= await Withdrawrequest.findOneAndUpdate({ _id }, { status: "COMPLETED" }, { session: sess });    

                await sess.commitTransaction()
                    sess.endSession(); 
                const emailFrom = 'noreply@ioyap.com';; 
                const subject = 'Funds Disbursed!!!';                      
                const hostUrl = "oyap.netlify.app"
                const hostUrl2 = "https://oyap.netlify.app" 
                const username =  getUserDetails.firstName
                const   text = "Your withdrawer request has been Approved and your funds has been sent" 
                const emailTo = getUserDetails.email
                const link = `${hostUrl}`;
                const link2 = `${hostUrl2}`;
                processEmail(emailFrom, emailTo, subject, link, link2, text, username);

                res.status(200).send({message:"Withdrawer approved  succesfully"})
              

    }
    }catch(err){
        console.log(err)
        res.status(500).send({message:"Error while cancelling order "})
    }

};



                
exports.cancelRequest = async(req, res) => {
       
                    try{
                        const sess = await mongoose.startSession()
                        sess.startTransaction()
                              
                              const _id = req.params.withdrawerrequestId;
                            getWithdrawerRequest = await Withdrawrequest.findOne({_id: _id})
                             
                            getUserDetails = await Members.findOne({_id:getWithdrawerRequest.userDetails})
                             const userId = getUserDetails._id
                            if(getWithdrawerRequest.status === "COMPLETED" || getWithdrawerRequest.status === "CANCELLED" ){
                                res.status(400).send({message:"This order withdrawer has been completed or cancelled"})
                
                             }else{    
                                const amount =  getWithdrawerRequest.amount
                                const walletBalance =  parseFloat(getUserDetails.walletBalance)
                                const finalBalance  =  parseFloat(getUserDetails.walletBalance) + parseFloat(amount) 
                                const transAmount = parseFloat(amount)
                
                                const updateWithdrawerrequest= await Withdrawrequest.findOneAndUpdate({ _id }, { status: "CANCELLED" }, { session: sess });    
                              
                                const transactions = new Transactions({      
                                    status: "SUCCESSFUL",
                                    sellerId: getUserDetails._id,              
                                    amount: amount, 
                                    type : "Credit",
                                    initialBalance : walletBalance,
                                    finalBalance: finalBalance,
                                    bankName: getWithdrawerRequest.bankName,
                                    accountName: getWithdrawerRequest.accountName,
                                    accountNumber: getWithdrawerRequest.accountNumber,
                                    narration : "Transaction Reversed"
                                    
                                });
                                const saveTransaction = await  transactions.save({ session: sess })      
                                const updateUserWallet = await Members.findOneAndUpdate({ userId }, { walletBalance: finalBalance }, { session: sess });  
                         
                                await sess.commitTransaction()
                                    sess.endSession(); 
                                const emailFrom = 'noreply@ioyap.com';; 
                                const subject = 'Fund Reversed';                      
                                const hostUrl = "oyap.netlify.app"
                                const hostUrl2 = "https://oyap.netlify.app" 
                                const username =  getUserDetails.firstName
                                const   text = "Your withdrawer request has been rejected and you funds has been reversed" 
                                const emailTo = getUserDetails.email
                                const link = `${hostUrl}`;
                                const link2 = `${hostUrl2}`;
                                processEmail(emailFrom, emailTo, subject, link, link2, text, username);
                
                                res.status(200).send({message:"Withdrawer approved  succesfully"})
                              
                
                    }
                    }catch(err){
                        console.log(err)
                        res.status(500).send({message:"Error while cancelling order "})
                    }
                
};



exports.getBankCode = async (req, res) => {
    try{
        console.log("getBankCode")
        const headers = {
            'Authorization': process.env.flutterToken,
            'Content-Type': 'application/json'      
            }
        
        const  getBankCode = await axios.get('https://api.flutterwave.com/v3/banks/NG', {headers: headers}) 
            //console.log(getBankCode)
            res.status(200).send({bankCode:getBankCode.data})
      
       }catch(err){
           console.log(err)
           res.status(500).send({message:"Error while getting bank code "})
       }
};


                
async function processEmail(emailFrom, emailTo, subject, link, link2, text, fName){
    try{
        
        // await delay();
       const sendmail =  await sendemail.emailUtility(emailFrom, emailTo, subject, link, link2, text, fName);
     //  console.log(sendmail)
        return sendmail
    }catch(err){
        console.log(err)
        return err
    }
  
  }