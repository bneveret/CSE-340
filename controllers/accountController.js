const utilities = require("../utilities/")
const bcrypt = require("bcryptjs")
const accountModel = require("../models/account-model")
const accountController = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver account management view
* *************************************** */
accountController.buildManagement = async function(req, res, next) {
  const nav = await utilities.getNav()
  const accountData = res.locals.accountData

  res.render("account/management",
    {
        title: "Account Management",
        nav,
        mainClass: "account-main",
        errors: null,
        accountData
    })
}

/* ****************************************
*  Show account update form
* *************************************** */
accountController.showUpdateForm = async function(req, res) {
  const nav = await utilities.getNav()
  const accountId = parseInt(req.params.accountId)

  if (!res.locals.accountData || res.locals.accountData.account_id !== accountId) {
    req.flash("notice", "Access denied.")
    return res.redirect("/account/login")
  }

  const accountData = res.locals.accountData
  res.render("account/update", {
    title: "Update Account",
    nav,
    mainClass: "account-main",
    accountData,
    errors: null
  })
}

/* ****************************************
*  Process update forms
* *************************************** */
// Update name/email
accountController.updateAccount = async function(req, res) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body
  const updateResult = await accountModel.updateAccountInfo(
    account_id,
    account_firstname,
    account_lastname,
    account_email
  )

  if (updateResult) {
    req.flash("notice", "Account information updated successfully.")
  } else {
    req.flash("notice", "Update failed. Try again.")
  }

  const nav = await utilities.getNav()
  const accountData = await accountModel.getAccountById(account_id)
  res.render("account/management", {
    title: "Account Management",
    nav,
    accountData,
    errors: null
  })
}

// Update password
accountController.updatePassword = async function(req, res) {
  const { account_id, account_password } = req.body

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10)
    const updateResult = await accountModel.updatePassword(account_id, hashedPassword)

    const nav = await utilities.getNav()
    const accountData = await accountModel.getAccountById(account_id)

    if (updateResult && updateResult.account_id) {
      req.flash("notice", "Password updated successfully.")
    } else {
      req.flash("notice", "Password update failed.")
    }

    res.render("account/management", {
      title: "Account Management",
      nav,
      accountData,
      errors: null
    })
  } catch (error) {
    console.error(error)
    req.flash("notice", "Server error during password update.")
    res.redirect("/account/update/" + account_id)
  }
}

/* ****************************************
*  Deliver login view
* *************************************** */
accountController.buildLogin = async function(req, res, next) {
  const nav = await utilities.getNav()
  res.render("account/login",
    {
        title: "Login",
        nav,
        mainClass: "account-main",
        errors: null,
    })
}

/* ****************************************
*  Deliver Register view
* *************************************** */
accountController.buildRegister = async function(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    mainClass: "account-main",
    errors: null
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
accountController.registerAccount = async function(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body
  // Hash the password before storing
    let hashedPassword
      try {
        // regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10)
      } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the registration.')
        res.status(500).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
      })
    }
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      mainClass: "account-main",
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      mainClass: "account-main",
      errors: null,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
accountController.accountLogin = async function (req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/management")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Process logout request
 * ************************************ */
accountController.logout = (req, res) => {
  res.clearCookie("jwt")
  req.flash("notice", "You have successfully logged out.")
  res.redirect("/")
}

module.exports = accountController