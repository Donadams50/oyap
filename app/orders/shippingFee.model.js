module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        location: String,
        minWeight: Number,
        maxWeight: Number,
        fee:Number
        
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Shippingfee = mongoose.model("shippingfee", schema);
    return Shippingfee;
  };
  
