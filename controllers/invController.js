const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    mainClass: "classification-main"
  })
}

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
    mainClass: "specific-main"
  })
}

module.exports = invCont