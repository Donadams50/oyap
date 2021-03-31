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
        productImages: Array
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
    // Getter
    schema.path('productQuantity').get(function(num) {
      return (num / 100).toFixed(2);
     });
 
 // Setter
    schema.path('productQuantity').set(function(num) {
      return num * 100;
   });
   schema.path('productPrice').get(function(num) {
    return (num / 100).toFixed(2);
   });

// Setter
  schema.path('productPrice').set(function(num) {
    return num * 100;
 });
  
    const Product = mongoose.model("product", schema);
    return Product;
  };
  
