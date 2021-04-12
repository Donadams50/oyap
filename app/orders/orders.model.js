module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        status: String,
        buyerId: String,
        sellerId: String,
        cartItem: Object,
        paymentResponse: Object,
        billingDetails: Object,
        shippingFee: String,
        totalAmountPaid: String,
        subTotal : String,
        timeLine : Array,
        logisticId : String,
        isConfirmed: Boolean,
        inTransit : Boolean
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
  
