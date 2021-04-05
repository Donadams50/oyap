module.exports = mongoose => {
  var Schema = mongoose.Schema;
    var schema = mongoose.Schema(
      {
        // productId: String,
        productId: { type: Schema.Types.ObjectId, ref: 'product' },
        quantitySelected:Number,
        userId:String,
        productCategory:String,
        productPrice:String,
        productImgUrl:Array,
        productName:String,
        productType: String,
        sellerId : String

        
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
  
