module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        productName: String,
        productType:String,
        productCategory:String,
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
        sellerProfilePic: String
      },
      { timestamps: true }
    );
  
    
 

   schema.path('productPrice').get(function(num) {
     console.log(num)
    return (num / 100).toFixed(2);
   });

// Setter
  schema.path('productPrice').set(function(num) {
    return num * 100;
 });
  schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
    const Product = mongoose.model("product", schema);
    return Product;
  };
  
