const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}


invCont.showManagement = async function (req, res) {
  const message = req.flash('message');
  let nav = await utilities.getNav()
  res.render('./inventory/management', { 
    title: "Management",
    nav,
    message,
  errors: null,
});
};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const rawId = req.params.classificationId;
  const classification_id = parseInt(rawId, 10);
  if (isNaN(classification_id)) {
    const nav = await utilities.getNav();
    req.flash("notice", "Invalid classification ID.");
    return res.status(400).render("./", {
      title: "Welcome to CSE Motors!",
      nav,
      errors: null,
    });
  }
  try {
    const data = await invModel.getInventoryByClassificationId(classification_id)
    if (!data || data.length === 0) {
      const nav = await utilities.getNav();
      req.flash("notice", "No vehicles found for this classification.");
      return res.status(404).render("./", {
        title: "Welcome to CSE Motors!",
        nav,
        errors: null,
      });
  }
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    mainClass: "classification-main",
    errors: null,
  });

  } catch (err) {
    console.error("Error building classification page:", err);
    const nav = await utilities.getNav();
    req.flash("notice", "Unexpected server error.");
    return res.status(500).render("./", {
      title: "Welcome to CSE Motors!",
      nav,
      errors: null,
    });
  }
};

/* ***************************
 *  Add classification
 * ************************** */
invCont.showAddClassificationForm = async function (req, res) {
  const message = req.flash('message');
  let nav = await utilities.getNav()
  res.render('./inventory/add-classification', {
    title: "Add Classification",
    nav,
    message,
    classification_name: "",
    errors: null,
  });
};

invCont.processAddClassification = async (req, res) => {
  const { classification_name } = req.body;

  try {
    const result = await invModel.insertClassification(classification_name);

    if (result) {
      const nav = await utilities.getNav();
      req.flash("notice", "New classification added successfully.");

      return res.render("./inventory/management", {
        title: "Management",
        nav,
        errors: null,
      });
    } else {
      req.flash("notice", "Failed to add classification.");
      return res.status(500).render("./inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: null,
        classification_name,
      });
    }
  } catch (err) {
    console.error(err);
    req.flash("notice", "Server error. Please try again.");
    return res.status(500).render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
      classification_name,
    });
  }
};

/* ***************************
 * Build inventory by inventory view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const inv_id = req.params.inventoryId
  const data = await invModel.getSpecificByInventoryId(inv_id)
  const grid = await utilities.buildSpecificGrid(data)
  let nav = await utilities.getNav()
  const modelName = data[0].inv_make +' '+ data[0].inv_model +' '+ data[0].inv_year
  res.render("./inventory/specific", {
    title: modelName,
    nav,
    grid,
    mainClass: "specific-main",
    errors: null,
  })
}

/* ***************************
 *  Add inventory
 * ************************** */
invCont.showAddInventoryForm = async function (req, res) {
  const classificationList = await utilities.buildClassificationList();
  const message = req.flash('message');
  let nav = await utilities.getNav()
  res.render('./inventory/add-inventory', {
    title: "Add Inventory",
    nav,
    message,
    errors: null,
    classificationList,
    classification_id: "",
    inv_make: "",
    inv_model: "",
    inv_description: "",
    inv_image: "",
    inv_thumbnail: "",
    inv_price: "",
    inv_year: "",
    inv_miles: "",
    inv_color: "",
    ...req.body
  });
};

invCont.processAddInventory = async function (req, res) {
  const formData = req.body;

  try {
    const result = await invModel.insertInventory(formData);

    if (result) {
      const nav = await utilities.getNav();
      req.flash('notice', 'Inventory item successfully added.');
      return res.render('./inventory/management', {
        title: "Management",
        nav,
        errors: null,
      });
    } else {
      req.flash('notice', 'Failed to add inventory item.');
      const classificationList = await utilities.buildClassificationList(formData.classification_id);
      return res.status(500).render('./inventory/add-inventory', {
        title: "Add Inventory",
        nav,
        errors: null,
        classificationList,
        ...formData
      });
    }
  } catch (err) {
    console.error(err);
    req.flash('notice', 'Server error. Try again.');
    const classificationList = await utilities.buildClassificationList(formData.classification_id);
    return res.status(500).render('./inventory/add-inventory', {
      title: "Add Inventory",
      nav,
      errors: null,
      classificationList,
      ...formData
    });
  }
};

module.exports = invCont