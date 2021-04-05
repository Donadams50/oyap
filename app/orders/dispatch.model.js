module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        fullName: String,
        companyName: String,
        phoneNumber: Number,
        dispatcherId:String,
        orderId: String
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Dispatch = mongoose.model("dispatch", schema);
    return Dispatch;
  };
  
