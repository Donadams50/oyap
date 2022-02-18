
const db = require("../mongoose");
const Members = db.profiles;
const Products = db.products;
const Auths = db.auths;
const passwordUtils =require('../helpers/passwordUtils');
const jwtTokenUtils = require('../helpers/jwtTokenUtils.js');
const sendemail = require('../helpers/emailhelper.js');
const cron = require('node-cron');

const { v4: uuidv4 } = require('uuid');


const { signToken } = jwtTokenUtils;

// Create and Save a new User

exports.create = async(req,res)=>{
    if (!req.body){
        res.status(400).send({message:"Content cannot be empty"});
    }
    
    const codeGenerated =  getCode();
    const { firstName,role,lastName,email,password,phoneNumber  } = req.body;
  
    if ( firstName && role  && lastName && email && password && phoneNumber ){
          if ( firstName==="" ||  role==="" || lastName==="" || password===""  || email==="" || phoneNumber===  ""  ){
                res.status(400).send({
                    message:"Incorrect entry format"
                });
           }else{  
               
            if (role === "Admin" || role === "Buyer" ) {
              
                 members = new Members({
                    firstName: req.body.firstName,
                    role: req.body.role,
                    lastName: req.body.lastName,
                    phoneNumber:req.body.phoneNumber || '',
                    email: req.body.email,
                    forgotPasswordCode: '',
                    isVerified: false,
                    walletBalance: 0.00,
                    verificationCode: codeGenerated,
                    pickUpDetails: {}, 
                    billingDetails: {},
                    isEnabled: true,
                    forgotPasswordCodeStatus: false,
                    profilePic : ""
                    
                    });
               }else if (role === "Seller" || role === "Logistics" ){
                 members = new Members({
                    firstName: req.body.firstName,
                    role: req.body.role,
                    lastName: req.body.lastName,
                    phoneNumber:req.body.phoneNumber || '',
                    email: req.body.email,
                    forgotPasswordCode: '',
                    isVerified: false,
                    walletBalance: 0.00,
                    verificationCode: codeGenerated,
                    pickUpDetails: {}, 
                    billingDetails: {},
                    isEnabled: false,
                    forgotPasswordCodeStatus: false,
                    profilePic : ""
                    
                    });
                 
               }
                
                  const auths = new Auths({ 
                    email: req.body.email               
                });
       
            try{
                  const isUserExist = await Members.findOne({email: email} )
                            if(isUserExist){
                                res.status(400).send({message:" Email already exists"})
                                }else{
                                 auths.password = await passwordUtils.hashPassword(password.toLowerCase());
                                 const emailFrom = process.env.user;
                                 const subject = 'Verificaton link';                      
                                 const hostUrl = ""+process.env.hostUrl+"/verify-code"
                                 const hostUrl2 = ""+process.env.hostUrl2+"/verify-code" 
                                 const firstName = req.body.firstName
                                 const   text = `Welcome to oyap, verify your account by using this code : ${codeGenerated}`
                                 const emailTo = req.body.email.toLowerCase();
                                 const link = `${hostUrl}`;
                                 const link2 = `${hostUrl2}`;
                                  processEmail(emailFrom, emailTo, subject, link, link2, text, firstName);
                                  const saveauth = await  auths.save()
                                   console.log(saveauth)
                                  if(saveauth._id){
                                          const savemember = await  members.save()
                                          console.log(savemember)
                                         if( savemember._id){
                                                                  
                                                   res.status(201).send({message:"User  created"})
                                            
                                        }else{
                                            res.status(400).send({message:"Error while creating profile "})
                                        }
                                    }
            
                               }
                 
                
                  }catch(err){
                        console.log(err)
                        res.status(500).send({message:"Error while creating profile "})
             }
           }
            }else{
                res.status(400).send({
                    message:"Incorrect entry format"
                });
            }
        }

exports.verifyUser = async (req, res) => {
    if (!req.body){
        res.status(400).send({message:"Content cannot be empty"});
    }
    console.log(req.body)
    const { verificationCode  } = req.body;
  
    if ( verificationCode ){
          if ( verificationCode===""  ){
                res.status(400).send({
                    message:"Incorrect entry format"
                });
           }else{   
    
                            try{
                               
                                const findVerificationCode = await Members.findOne({verificationCode: verificationCode})
                                        if(findVerificationCode){
                                             
                                             const _id =  findVerificationCode._id
                                             const verifyUser = await Members.findOneAndUpdate({ _id}, { isVerified: true });
                                                        if(verifyUser){
                                                            const clearCode = await Members.findOneAndUpdate({ _id}, { verificationCode: "" });
                                                            res.status(200).send(" Verified succesfully ")
                                                        }else{
                                                            res.status(400).send({message:" Error while verifying user "})
                                                        }                                         
                                             
                                              }else{
                                                res.status(400).send({message:" Code has been used or Invalid"})
                                            }
                                     
                                    
                                }catch(err){
                                    console.log(err)
                                    res.status(500).send({message:"Error while getting member "})
                                }
              }
          }
        else{
            res.status(400).send({
                message:"Incorrect entry format"
            });
        }
};

// Login user
exports.signIn = async(req, res) => {
  if (!req.body){
    res.status(400).send({message:"Content cannot be empty"});
}
console.log(req.body)
// let {myrefCode} = req.query;
const {   email, password, role  } = req.body;
 const receivedRole = role
if ( email && password && role ){
    if ( email==="" || password==="" || role ==="" ){
        res.status(400).send({
            message:"Incorrect entry format"
        });
    }else{
        
        
        const members = new Members({
            email: req.body.email,
            password: req.body.password
            
          });

     
        try{
            const User = await Members.findOne({email: email} )
             const Auth = await Auths.findOne({email: email} )
               
           if(User){
           // if(User.role === role){
                        const retrievedPassword = Auth.password
                        const retrievedRole =  User.role
                        const id = User._id;
                        const {  firstName,  role, lastName, phoneNumber , email, isVerified, isEnabled, walletBalance,createdAt } = User
                        const profilePic = User.profilePic || ""
                        const billingDetails = User.billingDetails || {}
                        const pickUpDetails = User.pickUpDetails || {}
                        const isMatch = await passwordUtils.comparePassword(password.toLowerCase(), retrievedPassword);
                        console.log(isMatch )
                        if (isMatch){
                            if(retrievedRole === receivedRole){
                                
                        const tokens = signToken( id, firstName,  role, lastName, phoneNumber , email, isVerified, isEnabled, walletBalance, createdAt, profilePic, billingDetails, pickUpDetails) 
                    
                        let user = {}
                        
                            user.profile = { id,firstName,  role, lastName, phoneNumber , email, isVerified, isEnabled, walletBalance,createdAt, profilePic, billingDetails, pickUpDetails} 
                            user.token = tokens;                
                            res.status(200).send(user)  
                            
                          }else{
                                  res.status(400).json({message:"Incorrect role details"})
                                }
                    }else{
                        res.status(400).json({message:"Incorrect Login Details"})
                    }
                
    
           }else{
            res.status(400).send({message:" User does not exists"})
           }
                   
            
        }catch(err){
            console.log(err)
            res.status(500).send({message:"Error while signing in "})
        }
    }
}else{
    res.status(400).send({
        message:"Incorrect entry format"
    });
}
};

// admin forget password
exports.forgotPassword = async(req,res)=>{
    if (!req.body){
        res.status(400).send({message:"Content cannot be empty"});
    }
console.log(req.body)
  // let {myrefCode} = req.query;
    const {   email } = req.body;
  
    if ( email   ){
        if ( email===""   ){
            res.status(400).send({
                message:"Incorrect entry format"
            });
        }else{
            
            

         
            try{
              const isUserExist = await Members.findOne({email: email} )
              const isUserExist2 = await Auths.findOne({email: email} )
                if(isUserExist && isUserExist2){
                const code =  uuidv4();
                            
                //const email = req.body.email.toLowerCase();
                const _id = isUserExist._id;
                const saveCode = await Members.findOneAndUpdate({ _id }, { forgotPasswordCode: code });
                console.log(saveCode)
                if(isUserExist && isUserExist2){
                const username = isUserExist.firstName;
                const emailFrom = process.env.user;
                const subject = 'Reset password link';                      
                const hostUrl = ""+process.env.hostUrl+"/resetpassword?code="+code+"" 
                const hostUrl2 = ""+process.env.hostUrl2+"/resetpassword?code="+code+""   
                const   text = "Your password reset link is shown below. Click on the reset button to change your password"
                const emailTo = req.body.email.toLowerCase();
                const link = `${hostUrl}`;
                const link2 = `${hostUrl2}`;
                 processEmailForgotPassword(emailFrom, emailTo, subject, link, link2, text, username);
                  
                  res.status(201).send({message:"Reset link sent succesfully"})

                }else{
                    res.status(400).send({message:"Error while resetting password"})
                }
                                 
               }
                else{



                     res.status(400).send({message:"User does not exist"})

          }
                       
                
            }catch(err){
                console.log(err)
                res.status(500).send({message:"Error while resetting password   "})
            }
        }
    }else{
        res.status(400).send({
            message:"Incorrect entry format"
        });
    }
}

exports.resetPassword = async(req,res)=>{
    if (!req.body){
        res.status(400).send({message:"Content cannot be empty"});
    }
console.log(req.body)
  // let {myrefCode} = req.query;
    const { password, code} = req.body;
  
    if (   password && code ){
        if ( password === " " || code === " "  ){
            res.status(400).send({
                message:"One of the entry is empty"
            });
        }else{
            
            

         
            try{
              
              const getuser = await Members.findOne({forgotPasswordCode: req.body.code} )
              
              if(getuser){
              //  console.log(getuser)
              const temporaryPassword = req.body.password
               
                const newpassword = await passwordUtils.hashPassword(temporaryPassword);
               // console.log(newpassword)
                
                const getAuth = await Auths.findOne({email: getuser.email} )
               // const getAuth = await Auths.findOne({email: getuser.email} )
               
                
                const _id =  getAuth._id
                const newForgotPasswordCode = ""
                const updatePassword = await Auths.findOneAndUpdate({ _id}, { password: newpassword });
                if(updatePassword){
                const _id =   getuser._id 
                const updateCode = await Members.findOneAndUpdate({_id}, { forgotPasswordCode: newForgotPasswordCode  });
                const updateCodeStatus = await Members.findOneAndUpdate({_id}, { forgotPasswordCodeStatus: false  });
               
                

                const emailFrom = process.env.user;
                const subject = 'Reset Password Succesful ';                      
                const hostUrl = process.env.hostUrl
                 const hostUrl2 = process.env.hostUrl2    
                const   text = 'Your password has been changed succesfully'
                const emailTo = getuser.email.toLowerCase()
                const link = `${hostUrl}`;
                const link2 = `${hostUrl2}`;
                const fullName = getuser.firstName
                 processEmail(emailFrom, emailTo, subject, link, link2, text, fullName);
                  
                res.status(200).send({message:"Password reset was succesfull"})
                }            
             
            }  else{
                res.status(400).send({
                    message:"This link you selected has already been used. or invalid "
                });
            } 
                
            }catch(err){
                console.log(err)
                res.status(500).send({message:"Error while creating profile "})
            }
        }
    }else{
        res.status(400).send({
            message:"Incorrect entry format"
        });
    }
}


exports.verifyForgotpasswordlink = async(req,res)=>{
    if (!req.body){
        res.status(400).send({message:"Content cannot be empty"});
    }
     console.log(req.body)
  // let {myrefCode} = req.query;
    const { code} = req.body;
  
    if ( code ){
        if (  code === ""  ){
            res.status(400).send({
                message:"One of the entry is empty"
            });
        }else{
            
            

         
            try{
              
              const getcode = await Members.findOne({forgotPasswordCode: req.body.code} )
              
              if(getcode){
               
                if(getcode.forgotPasswordCodeStatus === true){
                    res.status(400).send({
                        message:"This link you selected has been used "
                    });
                
                }else{
                console.log(getcode)
               
                const _id =   getcode._id 
                const updateCode = await Members.findOneAndUpdate({_id}, { forgotPasswordCodeStatus: true  });
                   
                res.status(200).send({message:"Link is valid"})
            }      
             
            }  else{
                res.status(400).send({
                    message:"This link you selected is invalid "
                });
            } 
                
            }catch(err){
                console.log(err)
                res.status(500).send({message:"Error while creating profile "})
            }
        }
    }else{
        res.status(400).send({
            message:"Incorrect entry format"
        });
    }
}


exports.enableUser = async (req, res) => {
    if (!req.body){
        res.status(400).send({message:"Content cannot be empty"});
    }
    console.log(req.body)
    const { email  } = req.body;
  
    if ( email ){
          if ( email===""  ){
                res.status(400).send({
                    message:"Incorrect entry format"
                });
           }else{   
    
                            try{
                               
                                const isUserExist = await Members.findOne({email: email})
                                        if(isUserExist){
                                             
                                             const _id =  isUserExist._id
                                             const enableUser = await Members.findOneAndUpdate({ _id}, { isEnabled: true });
                                                        if(enableUser){
                                                           
                                                            res.status(200).send(" User Enabled succesfully ")
                                                        }else{
                                                            res.status(400).send({message:" Error while enabling user "})
                                                        }                                         
                                             
                                              }else{
                                                res.status(400).send({message:"  Invalid user"})
                                            }
                                     
                                    
                                }catch(err){
                                    console.log(err)
                                    res.status(500).send({message:"Error while enabling user "})
                                }
              }
          }
        else{
            res.status(400).send({
                message:"Incorrect entry format"
            });
        }
         };

exports.disableUser = async (req, res) => {
            if (!req.body){
                res.status(400).send({message:"Content cannot be empty"});
            }
            console.log(req.body)
            const { email  } = req.body;
          
            if ( email ){
                  if ( email===""  ){
                        res.status(400).send({
                            message:"Incorrect entry format"
                        });
                   }else{   
            
                                    try{
                                       
                                        const isUserExist = await Members.findOne({email: email})
                                                if(isUserExist){
                                                     
                                                     const _id =  isUserExist._id
                                                     const enableUser = await Members.findOneAndUpdate({ _id}, { isEnabled: false });
                                                                if(enableUser){
                                                                   
                                                                    res.status(200).send(" User Disabled succesfully ")
                                                                }else{
                                                                    res.status(400).send({message:" Error while enabling user "})
                                                                }                                         
                                                     
                                                      }else{
                                                        res.status(400).send({message:"  Invalid user"})
                                                    }
                                             
                                            
                                        }catch(err){
                                            console.log(err)
                                            res.status(500).send({message:"Error while enabling user "})
                                        }
                      }
                  }
                else{
                    res.status(400).send({
                        message:"Incorrect entry format"
                    });
                }
                 };

// Update members details
 
exports.updateMember = async(req, res) => {
    const _id = req.params.id;
    console.log(req.body)

    const { firstName,role,lastName,email,isEnabled,phoneNumber, isVerified } = req.body;
  
    if ( firstName && role   && lastName && email  && phoneNumber ){
          if ( firstName==="" ||  role==="" || lastName===""   || email==="" || phoneNumber===  ""  ){
            res.status(400).send({
                message:"Incorrect entry format5"
            });
        }else{
           
                  
            const member = new Members({
                _id : req.params.id,
                firstName: req.body.firstName,
                role: req.body.role,
                lastName: req.body.lastName,
                phoneNumber:req.body.phoneNumber || '',
                email: req.body.email,
                forgotPasswordCode: req.body.forgotPasswordCode || '',
                isVerified: req.body.isVerified,
                walletBalance: req.body.walletBalance ,
                verificationCode: req.body.verificationCode || '',
                pickUpDetails: req.body.pickUpDetails || {}, 
                billingDetails: req.body.billingDetails || {},
                isEnabled:  req.body.isEnabled,
                forgotPasswordCodeStatus: req.body.forgotPasswordCodeStatus,
                profilePic : req.body.profilePic
              });
             
    
         
            try{
                const updateProfile = await Members.updateOne( {_id}, member)
                   //  console.log(updateProfile)                       
                 res.status(201).send({message:"Profile updated  succesfully"})
                
                
            }catch(err){
                console.log(err)
                res.status(500).send({message:"Error while updating profile "})
            }
          
          
   
          
        }
    }else{
        res.status(400).send({
            message:"Incorrect entry format6"
        });
    }
                   
};

// Find all members
exports.findAllMembers = async (req, res) => {
    try{
        
        const{ limit}= req.query
        console.log(limit)
      const  lim = parseInt(limit)
      console.log(lim)
        if(limit){
            const findAllMembers = await Members.find().sort({"_id": -1}).limit(lim)
        console.log(findAllMembers)
        res.status(200).send(findAllMembers)
         }else{
            const findAllMembers = await Members.find().sort({"_id": -1})    
           console.log(findAllMembers)
        res.status(200).send(findAllMembers)
         }
        
         
        //    const findAllMembers = await Members.find().sort({"_id": -1})  
        //    console.log(findAllMembers)
        //     res.status(200).send(findAllMembers)  
       }catch(err){
           console.log(err)
           res.status(500).send({message:"Error while getting all users "})
       }
};

// find member by the id 
exports.findMembeById = async (req, res) => {
   try{
       
            let id = req.params.id
        const findMemberById = await Members.findOne({_id: id})
       
        res.status(200).send(findMemberById)
           
       }catch(err){
           console.log(err)
           res.status(500).send({message:"Error while getting member "})
       }

};

exports.updateBillingDetails = async(req,res)=>{
    if (!req.body){
        res.status(400).send({message:"Content cannot be empty"});
    }
console.log(req.body)
  // let {myrefCode} = req.query;
    const { billingDetails} = req.body;
  
    if ( billingDetails  ){
        if ( billingDetails===""  ){
            res.status(400).send({
                message:"Incorrect entry format"
            });
        }else{
                    
            try{
            
                const _id  = req.params.id
                const updateBillingDetails= await Members.findOneAndUpdate({ _id }, { billingDetails: billingDetails });
                console.log(updateBillingDetails)                              
                res.status(200).send({message:"Billing details updated succesfully"})           
                
            }catch(err){
                console.log(err)
                res.status(500).send({message:"Error while updating billing details "})
            }
        }
    }else{
        res.status(400).send({
            message:"Incorrect entry format"
        });
    }
}



// delete a user
exports.deleteMember = async (req, res) => {
    try{
        const id = req.params.id;
        const deletemember = await Members.findByIdAndRemove(id)
        console.log(deletemember)
        res.status(200).send({message:"Deleted succesfully"})
         
       }catch(err){
           console.log(err)
           res.status(500).send({message:"Error while deleting member "})
       }
}

// count all user
 exports.countUsers = async (req, res) => {
    try{

        const countUsers = await Members.countDocuments()
        console.log(countUsers)
        res.status(200).send({countUsers:countUsers})
     }catch(err){
           console.log(err)
           res.status(500).send({message:"Error while counting users "})
       }
};


// user change password
exports.changePassword = async(req,res)=>{
    if (!req.body){
        res.status(400).send({message:"Content cannot be empty"});
    }
//console.log(req.body)
  // let {myrefCode} = req.query;
    const { oldPassword, newPassword} = req.body;
  
    if ( oldPassword && newPassword  ){
        if ( newPassword==="" || oldPassword===""  ){
            res.status(400).send({
                message:"Incorrect entry format"
            });
        }else{
                    
            try{
                const email = req.user.email
                console.log(req.user.email)
            //   const isUserExist = await Members.findOne({email: req.user.email} )
              const getpassword = await Auths.findOne({email: email} )
              const retrievedPassword = getpassword.password
              const isMatch = await passwordUtils.comparePassword(oldPassword.toLowerCase(), retrievedPassword);
              console.log(isMatch )
               if (isMatch){ 
                const newpassword = await passwordUtils.hashPassword(req.body.newPassword.toLowerCase());
                console.log("newpassword")
                console.log(newpassword) 
                console.log(getpassword._id)              
                //const email = req.body.email.toLowerCase();
                const _id  = getpassword._id
                const updatePassword = await Auths.findOneAndUpdate({ _id }, { password: newpassword });
                console.log(updatePassword)

                
                  
                res.status(200).send({message:"Password changed succesfully"})
                                 
             
               }else{
                res.status(400).send({message:"Incorrect old password "})
               }        
                
            }catch(err){
                console.log(err)
                res.status(500).send({message:"Error while creating profile "})
            }
        }
    }else{
        res.status(400).send({
            message:"Incorrect entry format"
        });
    }
}


 //find new order
 exports.recentUsersAdmin = async (req, res) => {
    try{
        const limit =  parseInt(req.query.limit);

        let limitDefault = 5
     
        if(limit){
            const findRecentUsers = await Members.find({$or:[{role: "Seller"},{role: "Logistics"},{role:"Buyer"}]}).sort({ _id: "desc" })

            .limit(limit)
              if(findRecentUsers){
                res.status(200).send(findRecentUsers)
              }else{
                res.status(400).send({message:"No new order to fetch"})
              }

        }else{
         
            const findRecentUsers = await Members.find().sort({ _id: "desc" })
            .limit(limitDefault)
         
        if(findRecentUsers){
            res.status(200).send(findRecentUsers)
          }else{
            res.status(400).send({message:"No new order to fetch "})
          }
         }
        
       }catch(err){
           console.log(err)
           res.status(500).send({message:"Error while getting orders "})
       }
};

// Count user dashboard admin 
exports.adminUserDashboardCount = async (req, res) => {
    try{
      
        const countAdmin = await Members.countDocuments({  role : "SubAdmin"})
        const countBuyer = await Members.countDocuments({ role : "Buyer"})
        const countSeller = await Members.countDocuments({ role : "Seller"})
        const countLogistics = await Members.countDocuments({ role : "Logistics"})
       
          res.status(200).send({countAdmin:countAdmin,countBuyer:countBuyer,countSeller:countSeller, countLogistics: countLogistics})
     }catch(err){ 
           console.log(err)
           res.status(500).send({message:"Error while getting admin dashboard details "})
       }
};



// Find all members
exports.findAllMembers = async (req, res) => {
    try{
        
        const{ limit}= req.query
        const{ role}= req.query
      
        if(role){
        if(limit){
            const findAllMembers = await Members.find({role: role}).sort({"_id": -1}).limit(lim)
         //   console.log(findAllMembers)
        res.status(200).send(findAllMembers)
         }else{
            const findAllMembers = await Members.find({role: role}).sort({"_id": -1})    
         //  console.log(findAllMembers)
        res.status(200).send(findAllMembers)
         } 
        
        }else{
            if(limit){
                const findAllMembers = await Members.find().sort({"_id": -1}).limit(lim)
             //   console.log(findAllMembers)
            res.status(200).send(findAllMembers)
             }else{
                const findAllMembers = await Members.find().sort({"_id": -1})    
             //  console.log(findAllMembers)
            res.status(200).send(findAllMembers)
             } 
        }
 
       }catch(err){
           console.log(err)
           res.status(500).send({message:"Error while getting all users "})
       }
};



// process email one
async function processEmail(emailFrom, emailTo, subject, link, link2, text, fullName){
  try{
      //create org details
      // await delay();
     const sendmail =  await sendemail.emailUtility(emailFrom, emailTo, subject, link, link2, text, fullName);
   //  console.log(sendmail)
      return sendmail
  }catch(err){
      console.log(err)
      return err
  }

}


// process email forgot password
async function processEmailForgotPassword(emailFrom, emailTo, subject, link, link2, text, username){
    try{
        //create org details
        // await delay();
       const sendmail =  await sendemail.emaiforgotPassword(emailFrom, emailTo, subject, link, link2, text, username);
     //  console.log(sendmail)
        return sendmail
    }catch(err){
        console.log(err)
        return err
    }
  
  }


function getCode(){
    var numbers = "0123456789";

    var chars= "abcdefghijklmnopqrstuvwxyz";
  
    var code_length = 6;
    var number_count = 3;
    var letter_count = 3;
  
    var code = '';
  
    for(var i=0; i < code_length; i++) {
       var letterOrNumber = Math.floor(Math.random() * 2);
       if((letterOrNumber == 0 || number_count == 0) && letter_count > 0) {
          letter_count--;
          var rnum = Math.floor(Math.random() * chars.length);
          code += chars[rnum];
       }
       else {
          number_count--;
          var rnum2 = Math.floor(Math.random() * numbers.length);
          code += numbers[rnum2];
       }
    }
return code
}


// Cron Jobs runs Here
// var lowProductNotification = cron.schedule('* * * * *', async function() {
//                     const getAllSeller = await Members.find({role:"Seller"}).sort({ _id: -1 })
//                     console.log(getAllSeller.length)
//                 try {
//                     await Promise.all( getAllSeller.map(async (singleSeller) => {
//                     const emailFrom = process.env.user
//                     const subject = 'Low Product Alert'
//                     const emailTo = singleSeller.email
//                     const hostUrl = process.env.hostUrl
//                     const hostUrl2 = process.env.hostUrl2
//                     const link = `${hostUrl}`
//                     const link2 = `${hostUrl2}`
//                     const firstName = singleSeller.firstName
//                      const sellerId = singleSeller._id
//                      const countProductSkin = await Products.countDocuments({sellerId:sellerId})
//                     const message = `This is to inform you that, your products on OYAP platform is getting low. You have just ${countProductSkin} product left. Login and Add more products. Thank you`      
//                     console.log(countProductSkin)
//                             if(countProductSkin < process.env.minimumProduct){
//                                 console.log("sending mail")
//                              // processEmail(emailFrom, emailTo, subject, link, link2, message,  firstName)

//                             }else{
//                                 console.log("Passed")
//                             }
//                 }))
             
//                 } catch (err) {
//                 console.log(err)
               
// }
 
//  })

