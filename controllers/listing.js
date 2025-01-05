const Listing = require("../models/listing");

//index route
module.exports.index = async (req,res) =>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs" , {allListings});
};

//new route
module.exports.renderNewForm = (req,res) =>{
    res.render("listings/new.ejs");
};

//show route
module.exports.showListings = async (req,res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path : "reviews", 
        populate : {
        path: "author",
        }
    })
    .populate("owner");

    if(!listing){
        req.flash("error" , "Listing you requested for does not exist!");
        res.redirect("/listings");    
    }
    res.render("listings/show.ejs" , {listing});
};

//Create route
module.exports.createListing = async (req,res) =>{
    let url = req.file.path;
    let filename = req.file.filename;
    
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url , filename};
    await newListing.save();
    req.flash("success" , "New Listing Created");
    res.redirect("/listings");
};

//edit route
module.exports.renderEditForm = async (req,res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error" , "Listing you requested for does not exist!");
        res.redirect("/listings");    
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload" , "/upload/h_300,w_250");
    res.render("listings/edit.ejs" , {listing , originalImageUrl});
};

//Update route
module.exports.updateListing = async (req,res) =>{
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id , { ...req.body.listing } );

    if(typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url , filename};
    await listing.save();
    }

    req.flash("success" , "Listing Updated");
    res.redirect(`/listings/${id}`);
};

//Delete route
module.exports.destroyListing = async (req,res) =>{
    let {id} = req.params;
    let d = await Listing.findByIdAndDelete(id);
    console.log(d);
    req.flash("success" , "Listing Deleted");
    res.redirect("/listings");
};