// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities")
const regValidate = require('../utilities/account-validation')
const accountController = require("../controllers/accountController")

// Default Route
router.get("/management", utilities.checkLogin, utilities.handleErrors(accountController.buildManagement));

// Login Route
router.get("/login", utilities.handleErrors(accountController.buildLogin));
// Registration Route
router.get("/register", utilities.handleErrors(accountController.buildRegister));
// Route
router.post('/register',
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount))

// Process the login attempt(temporary)
router.post(
  "/login",
  utilities.handleErrors(accountController.accountLogin)
)

module.exports = router;