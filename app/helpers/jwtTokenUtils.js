const  jwt =require('jsonwebtoken');
const dotenv=require('dotenv');

dotenv.config();
  

exports.signToken= (id, fullname,  Role, roleID, Branch, branchID,   OfficeTitle, Email, OfficeId, GroupId)=> {
    const key = process.env.SECRET_KEY;
    const token = jwt.sign({ id: id, fullName:fullname ,  role: Role, roleId:roleID , branch:Branch, branchId:branchID , officeTitle: OfficeTitle, email:Email, officeId: OfficeId , groupId: GroupId}, key, { expiresIn: '1h' });
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
    const token = req.headers.authorization || req.params.token;
  
        if (req.user.roleId === 1) {
         console.log(req.user.role) 
          next();
          
        }else{
          console.log(req.user.role) 
          res.status(401).json({ status: 401, error: 'Unauthorized to access this resource' });
          
        }
    
  }

  
  

  
 

