const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const dotenv=require('dotenv');
dotenv.config();

const db = {};
db.mongoose = mongoose;
db.url = process.env.url;


db.profiles = require("../members/members.model.js")(mongoose);
db.auths = require("../members/auth.model.js")(mongoose);
db.products = require("../products/products.model.js")(mongoose);
db.productcategories = require("../products/product.category.model.js")(mongoose);
db.productsubcategories = require("../products/product.subcategory.model.js")(mongoose);
db.carts = require("../cart/cart.model.js")(mongoose);
db.orders = require("../orders/orders.model.js")(mongoose);
db.transactions = require("../transactions/transactions.model.js")(mongoose);
db.withdrawrequests = require("../withdrawrequest/withdrawrequest.model.js")(mongoose);
db.shippingfees = require("../orders/shippingFee.model")(mongoose);


module.exports = db;
