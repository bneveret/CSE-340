const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}


async function insertClassification(classification_name){
  try {
    const sql = `
      INSERT INTO classification (classification_name)
      VALUES ($1)
      RETURNING *;
    `;
    const result = await pool.query(sql, [classification_name]);
    return result.rows[0]; // returns inserted record
  } catch (err) {
    console.error('DB insert error:', err);
    return null;
  }
};


async function insertInventory({
  classification_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color
}){
  try {
    const sql = `
      INSERT INTO inventory
      (classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail,
       inv_price, inv_year, inv_miles, inv_color)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *;
    `;
    const values = [
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color
    ];
    const result = await pool.query(sql, values);
    return result.rows[0];
  } catch (err) {
    console.error('DB insert error:', err);
    return null;
  }
};

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***************************
 *  Get specific inventory item by inv_id
 * ************************** */
async function getSpecificByInventoryId(inv_id) {
  try {
    const data = await pool.query(
      "SELECT * FROM public.inventory where inv_id = $1",
      [inv_id]
    )
    return data.rows
  } catch (error) {
    console.error("getinventorybyid error " + error)
  }
}

module.exports = {getClassifications, insertClassification, insertInventory, getInventoryByClassificationId, getSpecificByInventoryId}