module.exports = mongoose => {
  var Schema = mongoose.Schema;
    var schema = mongoose.Schema(
      {
        // productId: String,
        productId: { type: Schema.Types.ObjectId, ref: 'product' },
        cartQty:Number,
        userId:String,
        subTotal : String,
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
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Cart = mongoose.model("cart", schema);
    return Cart;
  };
  
