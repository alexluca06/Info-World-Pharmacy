const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const { DateTime } = require("luxon");
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
       let sqlQuery = `SELECT
                     role
                     FROM users
                     WHERE username = ?`
       const role = await db.getOne(sqlQuery, userInfo.username );
       res.role = role
       next()
   })
}

// Get all orders:
router.get('/', authenticateToken, async (req, res) => {
   if (!res.role == 'ADMIN') return res.status(403).json({ message: "Access denied! No rights!" })
   try {
      let sqlQuery = 'SELECT * FROM orders' 
      const orders = await db.getAll(sqlQuery)
      return res.status(200).json(orders)
   } catch (error) {
      res.status(500).json({ message: error.message })
   }
});

// Get orders of a customer based on his username:
router.get('/:username', authenticateToken,async (req, res) => {
   try {
      let sqlQuery = `SELECT products.name, orders.quantity, orders.totalPrice,
                  orders.orderDate  
                  FROM 
                  ((orders INNER JOIN users ON orders.customerID = users.userID
                  AND users.username = ? )
                  INNER JOIN products ON orders.productID = products.productID)` 
      const orders = await db.getOne(sqlQuery, req.params.username)
      if (!orders) return res.status(404).json({ message: "Product ID not found!" })
      return res.status(200).json(orders)
   } catch (error) {
      return res.status(500).json({ message: error.message })
   }
  });

// Make an order for a product:
router.post('/new-order', authenticateToken, async (req, res) => {
   // Extract order info from request body:
   const orderInfo = {
      customerID: req.body.userID,
      productID: req.body.productID,
      quantity: req.body.quantity,
      totalPrice: req.body.totalPrice,
      orderDate: DateTime.now().toSQLDate()
   }

   // Save the new product into our database
  
   let sqlQuery = ` INSERT INTO orders 
               (customerID, productID, quantity, totalPrice, orderDate)
               VALUES (?) `
   const newOrder = await db.create(sqlQuery, orderInfo)
   newOrder ? 
      res.status(201).json({ message: "Successfully adding a new order!" }): 
      res.status(500).json({ message: "Cannot adding the new order!" })
});

// Update the information(eg. quantity or products) about an order:
router.patch('/:username', authenticateToken, async (req, res) => {
   try {
      let userId = await db.getOne(`SELECT userID 
                                 FROM users WHERE username = ?`,
                                 req.params.username)
      let sqlQuery = `UPDATE orders
                  SET ?
                  WHERE userID = ?`
      await db.update(sqlQuery, req.body, userId.userID);
      res.status(200).json({message: "Product updates success!"});
   } catch (error) {
       res.status(500).json({ message: error.message });
   }
});

// Delete an order already made it:
router.delete('/:username', authenticateToken , async (req, res) => {
   let userId = await db.getOne(`SELECT userID 
                              FROM users WHERE username = ?`,
                              req.params.username)
   let sqlQuery = `DELETE FROM orders WHERE userID = ?`
   const result = await db.delete(sqlQuery, userId.userID)
   result ?
      res.status(200).json({ message: 'Deleted order!' }):
      res.status(500).json({ message: 'Delete operation failed!'})
   
});
module.exports = router;