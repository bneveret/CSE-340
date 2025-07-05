// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities")
const regValidate = require('../utilities/account-validation')
const accountController = require("../controllers/accountController")

// Default Route
router.get("/management", utilities.checkLogin, utilities.handleErrors(accountController.buildManagement));

// Update Route
router.get("/update/:accountId", utilities.checkLogin, utilities.handleErrors(accountController.showUpdateForm))

router.post("/update",
  utilities.checkLogin,
  regValidate.accountUpdateRules(),
  regValidate.checkAccountUpdateData,
  utilities.handleErrors(accountController.updateAccount)
)
router.post("/update-password",
  utilities.checkLogin,
  regValidate.passwordRules(),
  regValidate.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
)

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

// Logout Route
router.get("/logout", accountController.logout)

module.exports = router;