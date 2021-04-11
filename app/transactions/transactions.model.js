module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        status: String,
        buyerId: String,
        sellerId: String,
        orderId: String,
        amount: String,
        type : String,
        initialBalance : String,
        finalBalance: String
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
  
