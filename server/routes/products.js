const express = require('express')
const router = express.Router()
const Database = require('../databases/DatabaseOperations')
const { authenticateToken } = require('../auth/utils/authenticateToken')

// Connect and access the database:
const db = new Database()

// Get all products:
router.get('/', authenticateToken, async (req, res) => {
   try {
      let sqlQuery = 'SELECT * FROM products' 
      const products = await db.getAll(sqlQuery)
      return res.status(200).json(products)
   } catch (error) {
      res.status(500).json({ message: error.message })
   }
});

// Get a product based on its id:
router.get('/:productId', authenticateToken,async (req, res) => {
   try {
      let sqlQuery = 'SELECT * FROM products WHERE productID = ?' 
      const product = await db.getOne(sqlQuery, req.params.productId)
      if (!product) return res.status(404).json({ message: "Product ID not found!" })
      return res.status(200).json(product)
   } catch (error) {
      return res.status(500).json({ message: error.message })
   }
  })

// Add a product:
router.post('/add', authenticateToken, async (req, res) => {
   if (res.user.role != 'ADMIN') return res.status(403).json({ message: "Access denied! No rights!" })
   // Extract product info from request body:
   const productInfo = {
      name: req.body.name,
      price: req.body.price,
      quantity: req.body.quantity,
      pillShape: req.body.pillShape,
      description: req.body.description,
      prescription: req.body.prescription,
      expirationDate: req.body.expirationDate,
      supply: req.body.supply
   }

   // Save the new product into our database:
  
   let sqlQuery = ` INSERT INTO products 
               (name, price, quantity, pillShape,
               description, prescription, expirationDate, supply)
               VALUES (?) `
   const newProduct = await db.create(sqlQuery, productInfo)
   newProduct ? 
      res.status(201).json({ message: "Successfully adding a new product!" }): 
      res.status(500).json({ message: "Cannot adding the new product!" })
})

// Update the information(eg. name, description, supply...) about a product:
router.patch('/:productId', authenticateToken, async (req, res) => {
   if (res.user.role != 'ADMIN') return res.status(403).json({ message: "Access denied! No rights!" })
   try {
      let sqlQuery = `UPDATE products
                  SET ?
                  WHERE productID = ?`
      const result = await db.update(sqlQuery, req.body, req.params.productId);
      return res.status(200).json(result);
   } catch (error) {
       res.status(500).json({ message: error.message });
   }
})

// Delete one or multiple products:
router.delete('/:remove', authenticateToken , async (req, res) => {
   if (res.user.role != 'ADMIN') return res.status(403).json({ message: "Access denied! No rights!" })
   try {
      let sqlQuery = `DELETE FROM products WHERE productID IN (?)`
      const result = await db.delete(sqlQuery ,req.body.productsID)
      return res.status(200).json(result)
   } catch(error) {
      res.status(500).json({ message: error.message})
   }
})

module.exports = router;