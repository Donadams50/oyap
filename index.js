const express = require('express');
const app = express();
const bodyparser = require('body-parser');
app.use(bodyparser.json());

const cors = require("cors");

app.use(cors()); 
const path = require('path')


//set static folder
app.use(express.static(path.join(__dirname, 'public')));




  

 app.get('/',  (req,res)=>{
    res.status(200).send({message:"Welcome to OYAP"})
         
     })
// Connect to port 
const port = process.env.PORT || 5000     

app.listen(port, ()=> console.log(`listening on port ${port}...`)); 