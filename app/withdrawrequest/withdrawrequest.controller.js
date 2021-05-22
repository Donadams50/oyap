
const db = require("../mongoose");
const Transactions = db.transactions;
const Withdrawrequest = db.withdrawrequests
const Members = db.profiles;
const mongoose = require("mongoose");
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
                  sellerId: req.user.id,
                  bankName: bankName,
                  accountName: accountName,
                  accountNumber: accountNumber,
                  amount:amount
        
                });     
                
                const transactions = new Transactions({      
                  status: "PENDING",
                  sellerId: req.user.id,              
                  amount: amount, 
                  type : "Debit",
                  initialBalance : walletBalance,
                  finalBalance: finalBalance,
                  bankName: bankName,
                  accountName: accountName,
                  accountNumber: accountNumber,
                  
              });
  
                  
                      const sess = await mongoose.startSession()
                      sess.startTransaction()
                      
                       
                    if(walletBalance >= transAmount && transAmount > mimimumWithdrawer){
                              
                              const _id = req.user.id
                              const saveTransaction = await  transactions.save({ session: sess })
                              const saveWithdreawerRequest = await withdrawrequest.save({ session: sess }) 
                              const updateUserWallet = await Members.findOneAndUpdate({ _id }, { walletBalance: finalBalance }, { session: sess });  
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