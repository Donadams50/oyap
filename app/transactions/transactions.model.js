module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        status: String,
        buyerId: String,
        sellerId: String,
        logisticsId: String,
        orderId: String,
        amount: Number,
        type : String,
        initialBalance : Number,
        finalBalance: Number,
        productDetails : Object,
        accountName: String,
        accountNumber: String,
        bankName : String,
        charges: String,
        narration : String,
        flutterPaymentId:String,
        reference: String

      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Transaction = mongoose.model("transaction", schema);
    return Transaction;
  };
  
