const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const Database = require('../databases/DatabaseOperations')

// Connect and access the database:
const db = new Database()

// Middleware that authenticate a token got from an user
const authenticateToken = (req, res, next) => {
   const authHeader = req.headers['authorization'];
   const token = authHeader && authHeader.split(' ')[1];
   if (token == null)  return res.status(401).json({ message: 'Access denied! You must have a token!' })
   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, userInfo) => {
       if (err) return res.status(403).json({ message: 'The current token is not valid!' })
       const sqlQuery = `SELECT
                     userID, username, role 
                     FROM users
                     WHERE username = ?`
       const user = await db.getOne(sqlQuery, userInfo.username);
       res.user = user
       next()
   })
}


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
   if (res.role != 'ADMIN') return res.status(403).json({ message: "Access denied! No rights!" })
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
   if (res.role != 'ADMIN') return res.status(403).json({ message: "Access denied! No rights!" })
   try {
      let sqlQuery = `UPDATE products
                  SET ?
                  WHERE productID = ?`
      await db.update(sqlQuery, req.body, req.params.productId);
      res.status(200).json({message: "Product updates success!"});
   } catch (error) {
       res.status(500).json({ message: error.message });
   }
})

// Delete one or multiple products:
router.delete('/:remove', authenticateToken , async (req, res) => {
   if (res.role != 'ADMIN') return res.status(403).json({ message: "Access denied! No rights!" })
   let sqlQuery = `DELETE FROM orders WHERE productID IN (?)`
   const result = await db.delete(sqlQuery ,req.body.productsID)
   result ?
      res.status(200).json({ message: 'Deleted product' }):
      res.status(500).json({ message: 'Delete operation failed!'})
})

module.exports = router;