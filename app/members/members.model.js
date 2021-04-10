module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        firstName: String,
        lastName: String,
        role: String,
        email:String,
        phoneNumber:String,
        forgotPasswordCode: String,
        forgotPasswordCodeStatus: Boolean,
        verificationCode: String,
       isVerified: Boolean,
       isEnabled: Boolean, 
       walletBalance: Number,
        pickUpDetails: Object,
       billingDetails: Object,
       profilePic: String
      },

      { timestamps: true }
    );

    // Getter
    schema.path('walletBalance').get(function(num) {
     return (num / 100).toFixed(2);
    });

// Setter
   schema.path('walletBalance').set(function(num) {
     return num * 100;
  });
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Profile = mongoose.model("profile", schema);
    return Profile;
  };
  
  