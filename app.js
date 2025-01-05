if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

//Packages require
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOveride = require("method-override");
const ejsMate = require("ejs-mate");


//utils require
const ExpressError = require("./utils/ExpressError.js");

//routes require
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

//session cookies
const session = require("express-session");
const flash = require("connect-flash");
const MongoStore = require('connect-mongo');

//authentication
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


//setup
const app = express();
const port = 8080;

app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname , "views"));
app.use(express.urlencoded({extended :true}));
app.use(methodOveride("_method"));
app.engine("ejs" , ejsMate);
app.use(express.static(path.join(__dirname , "/public")));

//mongo atlas setup
const dbURL = process.env.ATLASDB_URL;

const store = MongoStore.create({
    mongoUrl: dbURL,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter:24*3600,
});

store.on("error" , () =>{
    console.log("ERROR IN MONGO SESSION STORE", err);
})

const sessionOption = {
    store: store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookies: {
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
    }
};

//mongo setup

main().then(()=>{
    console.log("Connected to DB");
}).catch((err) => {
    console.log(err)
});

async function main() {
  await mongoose.connect(dbURL);
};

/* //home route
app.get("/" , (req,res) =>{
    res.send("This is root site");
}); */


//session implementation
app.use(session(sessionOption));
app.use(flash());

//authentication 
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//local variables
app.use((req,res,next) =>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})


//Listings Routes
app.use("/listings" , listingsRouter);

//Reviews Routes
app.use("/listings/:id/reviews" , reviewsRouter);

//User Routes
app.use("/",userRouter);


//Error
app.all("*" ,(req,res,next)=>{
    next(new ExpressError(404,"Page not found"));
});

app.use((err,req,res,next) =>{
    let {statusCode = 500 , message = "Something went wrong !"} = err;
    res.status(statusCode).render("error.ejs" ,{message});
});

//start server
app.listen(port , ()=>{
    console.log(`Port is listening on port : ${port}`);
});