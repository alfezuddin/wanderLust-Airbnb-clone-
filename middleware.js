// middleware.js

// ⇩ Login check middleware
function isLoggedIn(req, res, next) {
  // ⇩ Agar user login nahi hai
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    // ⇩ Jis URL par user ja raha tha use session me save karo
    req.session.redirectUrl = req.originalUrl;
    // ⇩ Error flash message
    req.flash("error", "You must be logged in to perform this action!");
    // ⇩ Login page par bhej do
    return res.redirect("/login");
  }
  // ⇩ Login hai to aage badho
  next();
}

// ⇩ Redirect URL ko res.locals me daalne wala middleware
function saveRedirectUrl(req, res, next) {
  // ⇩ Agar session me redirectUrl pada hai to locals me copy karo
  if (req.session && req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
    // ⇩ Ek baar use kar liya to optionally hata bhi sakte ho
    // delete req.session.redirectUrl;
  }
  // ⇩ Next middleware/handler
  next();
}

// ⇩ Yahan object ke form me *named exports* kar rahe hain
module.exports = { isLoggedIn, saveRedirectUrl };
