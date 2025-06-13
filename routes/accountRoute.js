// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities")
const regValidate = require('../utilities/account-validation')
const accountController = require("../controllers/accountController")

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
  (req, res) => {
    res.status(200).send('login process')
  }
)

module.exports = router;