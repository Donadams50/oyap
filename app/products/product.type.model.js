module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
     
        productType:String,
        productCategory:String
        
      },
      { timestamps: true }
    );
  
    
 


  schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
    const Producttype = mongoose.model("producttype", schema);
    return Producttype;
  };
  
