const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

  /* **************************************
* Build the specific view HTML
* ************************************ */
Util.buildSpecificGrid = async function(data) {
  let grid
  if(data.length > 0){
    grid = '<ul id="specific-display">'
    data.forEach(specific => { 
      grid += '<li>'
      grid += '<img src="' + specific.inv_image + '" alt="Image of ' + specific.inv_make + ' ' + specific.inv_model
      +' on CSE Motors" /></li>'
      grid += '<li><p>' + specific.inv_description + '</p>'
      grid += '<p>Price: $' 
      + new Intl.NumberFormat('en-US').format(specific.inv_price) + '</p>'
      grid += '<p>Color: ' + specific.inv_color + '</p>'
      grid += '<p>Mileage: ' + specific.inv_miles + '</p>'
      grid += '</li>'
  })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

  /* **************************************
* Build the dropdown list
* ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications()
    let classificationList =
      '<select name="classification_id" id="classificationList" required>'
    classificationList += "<option value=''>Choose a Classification</option>"
    data.rows.forEach((row) => {
      classificationList += '<option value="' + row.classification_id + '"'
      if (
        classification_id != null &&
        row.classification_id == classification_id
      ) {
        classificationList += " selected "
      }
      classificationList += ">" + row.classification_name + "</option>"
    })
    classificationList += "</select>"
    return classificationList
  }

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  const token = req.cookies.jwt
 if (token) {
  jwt.verify(
   token,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("notice", "Please log in")
     res.clearCookie("jwt")
     res.locals.loggedin = false
     res.locals.accountData = null
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = true
    next()
   })
 } else {
  res.locals.loggedin = false
  res.locals.accountData = null
  next()
 }
}

/* ****************************************
 * Middleware to restrict inventory admin access to Employee or Admin
**************************************** */
Util.requireEmployeeOrAdmin = (req, res, next) => {
  const account = res.locals.accountData

  if (res.locals.loggedin && account && (account.account_type === "Employee" || account.account_type === "Admin")) {
    return next()
  } else {
    req.flash("notice", "You must be logged in with appropriate permissions to view that page.")
    return res.redirect("/")
  }
}


/* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

module.exports = Util