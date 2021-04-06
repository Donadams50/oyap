module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        
        totalPrice:String,
        status: String,
        userId: String,
        sellerId: String,
        products: Array,
        paymentId: String,
       
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Order = mongoose.model("order", schema);
    return Order;
  };
  
