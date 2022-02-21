module.exports = mongoose => {
  var Schema = mongoose.Schema;
    var schema = mongoose.Schema(
      {
        productName: String,
        productSubcategory:{ type: Schema.Types.ObjectId, ref: 'subproductcategory' },
        productCategory:{ type: Schema.Types.ObjectId, ref: 'productcategory' },
        productPrice:Number,
        productQuantity: Number,
        productDescription: String,
        productInStock:Boolean,
        productImages: Array,
        sellerId: String,
        sellerphoneNumber: String,
        sellerFirstName: String,
        sellerLastName: String,
        sellerRegDate: Date,
        sellerEmail: String,
        sellerpickUpDetails: String,
        sellerProfilePic: String,
        isLogistics: Boolean,
        productWeight: Number,
        feedback: Array,
        numberOfPurchase:Number,
        displayPrice: Number
      },
      { timestamps: true }
    );
  
    
 

//    schema.path('productPrice').get(function(num) {
     
//     return (num / 100).toFixed(2);
//    });

// // Setter
//   schema.path('productPrice').set(function(num) {
//     return num * 100;
//  });
  schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
    const Product = mongoose.model("product", schema);
    return Product;
  };
  
