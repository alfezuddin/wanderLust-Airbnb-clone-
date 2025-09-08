if(process.env.NODE_ENV != "production"){

  require('dotenv').config()
  
}


const express = require("express");
const app = express();

const mongoose = require("mongoose");

const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate"); //ejs require

const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const {isLoggedIn} = require("./middleware.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderLust2";
const dbUrl = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate); //ejs-mate use ke liye
app.use(express.static(path.join(__dirname, "/public"))); //public folder ko link kar rhe hai


const store =  MongoStore.create({
  mongoUrl: dbUrl,
  crypto : {
    secret :  "mysupersecretcode",
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("ERROR in MONGO SESSION STORE", err)
});


const sessionOptions = {
  store,
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true ,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24,
    maxAge: 1000 * 60 * 60 * 24,
  },
};

// app.get("/", (req, res) => {
//   res.send("Hi, I am root");
// });



app.use(session(sessionOptions));

// ------------------------------
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// ---------------------------------------

app.use((req, res, next) => {
  res.locals.success = req.flash("success"); // success message ko locals me dal rahe
  res.locals.error = req.flash("error"); // agar error message ho to
  res.locals.currUser = req.user;
  next();
});

// // demouser
// app.get("/demouser", async (req,res) => {
//   let fakeUser = new User({
//     email : "student@gmail.com",
//     username : "delta-student",
//   });

//   let registeredUser = await User.register(fakeUser, "helloworld");
//   res.send(registeredUser);
// })


// app.get("/allusers", async (req, res) => {
//   const users = await User.find({});
//   res.send(users);
// });

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// console.log("DB URL:", dbUrl);


app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not Found"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
