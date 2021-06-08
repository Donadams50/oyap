module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
     
        
        categoryName:String,
        categoryId: String,
        subcategoryName: String,
        
      },
      { timestamps: true }
    );
  
    
 


  schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
    const Productsubcategory = mongoose.model("subproductcategory", schema);
    return Productsubcategory;
  };
  
