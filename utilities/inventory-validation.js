const { body, validationResult } = require("express-validator")
const utilities = require(".")
const invModel = require("../models/inventory-model");


const invValidate = {}

/* ***************************
 * Add Controller Rules
 * ************************** */
const classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .isLength({ min: 1 }).withMessage("Classification name is required.")
      .isAlphanumeric().withMessage("Classification name must not contain spaces or special characters.")
      .isLength({ max: 30 }).withMessage("Classification name must be no more than 30 characters."),
  ];
};

const checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render("./inventory/add-classification", {
      errors: errors.array(),
      message: null,
      classification_name, // sticky value
    });
  }
  next();
};

/* ***************************
 * Inventory Validation Rules
 * ************************** */
const inventoryRules = () => {
  return [
    body("classification_id")
      .trim()
      .notEmpty()
      .withMessage("Classification is required."),

    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Make is required."),

    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Model is required."),

    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Description is required."),

    body("inv_image")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Image path is required."),

    body("inv_thumbnail")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Thumbnail path is required."),

    body("inv_price")
      .trim()
      .notEmpty()
      .withMessage("Price is required.")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number."),

    body("inv_year")
      .trim()
      .notEmpty()
      .withMessage("Year is required.")
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage("Enter a valid year."),

    body("inv_miles")
      .trim()
      .notEmpty()
      .withMessage("Mileage is required.")
      .isInt({ min: 0 })
      .withMessage("Mileage must be a positive number."),

    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Color is required."),
  ]
}

/* ***************************
 * Check Inventory Data
 * ************************** */
const checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  const formData = req.body
  const classificationList = await utilities.buildClassificationList(formData.classification_id)

  if (!errors.isEmpty()) {
    return res.render("./inventory/add-inventory", {
      errors: errors.array(),
      message: null,
      classificationList,
      ...formData,
    })
  }

  next()
}

module.exports = {classificationRules, checkClassificationData, inventoryRules, checkInventoryData};