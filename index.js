const express = require('express');
const app = express();
const bodyparser = require('body-parser');
app.use(bodyparser.json());


const cors = require("cors");

app.use(cors()); 
const path = require('path')


//set static folder
app.use(express.static(path.join(__dirname, 'public')));

const db = require("./app/mongoose");
console.log(db.url)
db.mongoose
  .connect(db.url, { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false , 
    retryWrites : false
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });



require('./app/members/members.routes')(app)
require("./app/products/products.routes.js")(app)
require("./app/files/files.routes.js")(app)
require("./app/cart/cart.routes.js")(app)
require("./app/orders/orders.routes.js")(app)
require("./app/transactions/transactions.routes.js")(app)
//require("./app/withdrawrequest/withdrawrequest.routes.js")(app)

 app.get('/',  (req,res)=>{
    res.status(200).send({message:"Welcome to OYAP"})
         
     })
// Connect to port 
const port = process.env.PORT || 5000     

app.listen(port, ()=> console.log(`listening on port ${port}...`)); 