const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const Review = require("./Review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image:{
    url: String,
    filename: String,
  },
  price: Number,
  location: String,
  country: String,
  // review ko ham array ki form me rakhenge
  reviews : [
    {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Review"

    }
  ],
  owner:[ {   // jo listing jisne create ki ho vo uss ko hi delete edit kar sakta hai VO OWNER hoga
    type : mongoose.Schema.Types.ObjectId,
    ref: "User",
    required : true,
  }],
});


listingSchema.post("findOneAndDelete", async(listing) => {
  if(listing){

    await Review.deleteMany({_id : {$in: listing.reviews}});
  }
})


const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
