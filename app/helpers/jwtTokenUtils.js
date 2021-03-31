const  jwt =require('jsonwebtoken');
const dotenv=require('dotenv');

dotenv.config();
  

exports.signToken= (id, firstName,  role, lastName, phoneNumber , email, isVerified, isEnabled, walletBalance)=> {
    const key = process.env.SECRET_KEY;
    const token = jwt.sign({ id: id, firstName:firstName ,  role: role, lastName:lastName , phoneNumber:phoneNumber, email:email , isVerified: isVerified, walletBalance:walletBalance, isEnabled: isEnabled }, key, { expiresIn: '1h' });
    return token;
  }

  exports.verifyToken= (req, res, next)=> { 
    const key = process.env.SECRET_KEY;
    const token = req.headers.authorization || req.params.token;
    if (!token) {
      res.status(403).json({ status: 403, error: 'No token provided' }); 
    }else{
      jwt.verify(token, key, (error, decoded) => {
        if (error) {
          console.log(error)
          res.status(401).json({ status: 401, error: 'Unauthorized' });
        }else{
         console.log(decoded)
           req.user = decoded;
          next();
        }
       
      });
    }
    
  }

  
  exports.isAdmin= (req, res, next)=> { 
  
  
        if (req.user.role === "Admin") {
         console.log(req.user.role) 
          next();
          
        }else{
          console.log(req.user.role) 
          res.status(401).json({ status: 401, error: 'Unauthorized to access this resource' });
          
        }
    
  }

  
  exports.isSeller= (req, res, next)=> { 
   
  
        if (req.user.role === "Seller") {
         console.log(req.user.role) 
          next();
          
        }else{
          console.log(req.user.role) 
          res.status(401).json({ status: 401, error: 'Unauthorized to access this resource' });
          
        }
    
  }

  
  exports.isBuyer= (req, res, next)=> { 
   
  
        if (req.user.role === "Buyer") {
         console.log(req.user.role) 
          next();
          
        }else{
          console.log(req.user.role) 
          res.status(401).json({ status: 401, error: 'Unauthorized to access this resource' });
          
        }
    
  }
  
  exports.isLogistics= (req, res, next)=> { 
   
  
        if (req.user.role === "Logistics") {
         console.log(req.user.role) 
          next();
          
        }else{
          console.log(req.user.role) 
          res.status(401).json({ status: 401, error: 'Unauthorized to access this resource' });
          
        }
    
  }

  
 

