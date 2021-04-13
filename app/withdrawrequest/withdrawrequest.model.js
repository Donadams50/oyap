module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        status: String,
        sellerId: String,
        amount: String,
        accountName: String,
        accountNumber: String,
        bankName : String,

      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });

    const Withdrawrequest = mongoose.model("withdrawrequest", schema);
    return Withdrawrequest;
  };
  
