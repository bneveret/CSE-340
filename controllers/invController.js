const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}


invCont.showManagement = async function (req, res) {
  const message = req.flash('message');
  let nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()
  res.render('./inventory/management', { 
    title: "Management",
    nav,
    message,
    classificationSelect,
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
      res.redirect("/inv/management")
      
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

/* ***************************
 * Add Inventory Data
 * ************************** */
invCont.processAddInventory = async function (req, res) {
  const formData = req.body;

  try {
    const result = await invModel.insertInventory(formData);
    const nav = await utilities.getNav();

    if (result) {
      req.flash('notice', 'Inventory item successfully added.');
      res.redirect("/inv/management")
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 * Build Edit Inventory
 * ************************** */
invCont.showEditInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.inventoryId)
  const data = await invModel.getSpecificByInventoryId(inv_id)
  const classificationList = await utilities.buildClassificationList(data[0].classification_id);
  const name = data[0].inv_make +' '+ data[0].inv_model +' '+ data[0].inv_year
  const message = req.flash('message');
  let nav = await utilities.getNav()
  res.render('./inventory/edit-inventory', {
    title: "Edit " + name,
    nav,
    message,
    classificationList: classificationList,
    errors: null,
    inv_id: data[0].inv_id,
    inv_make: data[0].inv_make,
    inv_model: data[0].inv_model,
    inv_description: data[0].inv_description,
    inv_image: data[0].inv_image,
    inv_thumbnail: data[0].inv_thumbnail,
    inv_price: data[0].inv_price,
    inv_year: data[0].inv_year,
    inv_miles: data[0].inv_miles,
    inv_color: data[0].inv_color,
    classification_id: data[0].classification_id
  });
};

/* ***************************
 * Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/management")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

/* ***************************
 * Build Delete Inventory
 * ************************** */
invCont.showDeleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.inventoryId)
  const data = await invModel.getSpecificByInventoryId(inv_id)
  const classificationList = await utilities.buildClassificationList(data[0].classification_id);
  const name = data[0].inv_make +' '+ data[0].inv_model +' '+ data[0].inv_year
  const message = req.flash('message');
  let nav = await utilities.getNav()
  res.render('./inventory/delete-confirm', {
    title: "Edit " + name,
    nav,
    message,
    errors: null,
    inv_id: data[0].inv_id,
    inv_make: data[0].inv_make,
    inv_model: data[0].inv_model,
    inv_price: data[0].inv_price,
    inv_year: data[0].inv_year,
    classification_id: data[0].classification_id
  });
};

/* ***************************
 * Delete Inventory Data
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const deleteResult = await invModel.deleteInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (deleteResult) {
    req.flash("notice", `The vehicle was successfully deleted.`)
    res.redirect("/inv/management")
  } else {
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the deletion failed.")
    res.status(501).render("inventory/delete-inventory", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_price
    })
  }
}

module.exports = invCont