const { stringify } = require("uuid");

module.exports = mongoose => {
  var Schema = mongoose.Schema;
    var schema = mongoose.Schema(
      {
        status: String,
        userDetails: { type: Schema.Types.ObjectId, ref: 'profile' },
        amount: Number,
        accountName: String,
        accountNumber: String,
        bankName : String,
        narration : String,
        transactionId : { type: Schema.Types.ObjectId, ref: 'transaction' },
        reference: String,
        currency: String,
        debitCurrency:String,
        flutterPaymentId: String,
        reference: String

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
  
