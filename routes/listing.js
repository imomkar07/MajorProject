const express = require("express");
const wrapAsync = require("../utils/wrapAsync.js");
const router = express.Router();
const {isLoggedIn , isOwner , validateListing} = require("../middleware.js");

const listingsController = require("../controllers/listing.js");

const multer  = require('multer');
const {storage} = require('../cloudConfig.js');
const upload = multer({storage});

router.route("/")
.get(wrapAsync(listingsController.index))
.post(
    isLoggedIn, 
    upload.single("listing[image]"), 
    validateListing,
    wrapAsync(listingsController.createListing)
);


//new route
router.get("/new" ,isLoggedIn, listingsController.renderNewForm);


router.route("/:id")
.get(wrapAsync(listingsController.showListings))
.put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
     wrapAsync(listingsController.updateListing)
)
.delete(  
    isLoggedIn,
    isOwner,
    wrapAsync(listingsController.destroyListing)
);


//edit route
router.get("/:id/edit" , 
    isLoggedIn,
    isOwner,
    wrapAsync(listingsController.renderEditForm)
);

module.exports = router;