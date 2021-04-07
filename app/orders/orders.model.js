module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        status: String,
        buyerId: String,
        sellerId: String,
        cartItems: Array,
        paymentResponse: Object,
        billingDetails: Object,
        shippingFee: String,
        totalAmountPaid: String,
        timeLine : Array,
        logisticId : String
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
  
