// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const invValidate = require("../utilities/inventory-validation")


router.get('/management', invController.showManagement);

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

router.get('/add-classification', invController.showAddClassificationForm);
// Post route with server-side validation
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  invController.processAddClassification
);

// Route to build inventory by inventory view
router.get("/detail/:inventoryId", invController.buildByInventoryId);

router.get('/add-inventory', invController.showAddInventoryForm);

// Post route with validation
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  invController.processAddInventory
)

module.exports = router;