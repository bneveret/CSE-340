// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities")
const invController = require("../controllers/invController")
const invValidate = require("../utilities/inventory-validation")


router.get('/management', utilities.checkLogin, utilities.requireEmployeeOrAdmin, invController.showManagement);

router.get('/edit/:inventoryId', utilities.checkLogin, utilities.requireEmployeeOrAdmin, invController.showEditInventory);
router.post("/update/", 
  invValidate.inventoryRules(),
  invValidate.checkUpdateData, 
  invController.updateInventory)

router.get('/delete/:inventoryId', utilities.checkLogin, utilities.requireEmployeeOrAdmin, invController.showDeleteInventory)
router.post('/delete', invController.deleteInventory)

router.get("/getInventory/:classification_id", utilities.checkLogin, utilities.handleErrors(invController.getInventoryJSON))

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

router.get('/add-classification', utilities.checkLogin, utilities.requireEmployeeOrAdmin, invController.showAddClassificationForm);
// Post route with server-side validation
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  invController.processAddClassification
);

// Route to build inventory by inventory view
router.get("/detail/:inventoryId", invController.buildByInventoryId);

router.get('/add-inventory', utilities.checkLogin, utilities.requireEmployeeOrAdmin, invController.showAddInventoryForm);

// Post route with validation
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  invController.processAddInventory
)

module.exports = router;