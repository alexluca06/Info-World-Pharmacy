const express = require('express')
const router = express.Router()
const { DateTime } = require("luxon");
const Database = require('../databases/DatabaseOperations')
const { authenticateToken } = require('../auth/utils/authenticateToken')

// Connect and access the database:
const db = new Database()

// Get all orders:
router.get('/', authenticateToken, async (req, res) => {
   if (res.user.role !== 'ADMIN') return res.status(403).json({ message: "Access denied! No rights!" })
   try {
      const sqlQuery = 'SELECT * FROM orders' 
      const orders = await db.getAll(sqlQuery)
      return res.status(200).json(orders)
   } catch (error) {
      res.status(500).json({ message: error.message })
   }
})

// Get orders of a customer based on his username:
router.get('/:username', authenticateToken,async (req, res) => {
   try {
      const sqlQuery = `SELECT products.name, orders.quantity, orders.totalPrice,
                  orders.orderDate  
                  FROM 
                  ((orders INNER JOIN users ON orders.customerID = users.userID
                  AND users.username = ? )
                  INNER JOIN products ON orders.productID = products.productID)` 
      const orders = await db.getOne(sqlQuery, res.user.username)
      if (!orders) return res.status(404).json({ message: "Product ID not found!" })
      return res.status(200).json(orders)
   } catch (error) {
      return res.status(500).json({ message: error.message })
   }
  })


// Make an order for a product:
router.post('/new-order', authenticateToken, async (req, res) => {
   let userID = -1
   if (res.user.role === 'ADMIN') {
      userID = req.body.customerID  // as the ADMIN to can place an order for a user
   } else {
      userID = res.user.userID  // prevent user to use another user id for a order
   }
   // Extract order info from request body:
   const orderInfo = {
      customerID: userID,
      productID: req.body.productID,
      quantity: req.body.quantity,
      totalPrice: req.body.totalPrice,
      orderDate: DateTime.now().toSQLDate(),
      orderState: false
   }

   // Save the new order into our database
   const sqlQuery = `INSERT INTO orders 
               (customerID, productID, quantity, totalPrice, orderDate, orderState)
               VALUES (?) `
   const newOrder = await db.create(sqlQuery, orderInfo)
   newOrder ? 
      res.status(201).json({ message: "Successfully adding a new order!" }): 
      res.status(500).json({ message: "Cannot adding the new order!" })
})

// Update the information(eg. quantity or products) about an order:
router.patch('/update', authenticateToken, async (req, res) => {
   let userID = -1
   if (res.user.role === 'ADMIN') {
      userID = req.body.customerID  // as the ADMIN to can place an order for a user
   } else {
      userID = res.user.userID  // prevent user to use another user id for a order
   }

   try {
      const sqlQuery = `UPDATE orders
                  SET ?
                  WHERE customerID = ?`
      await db.update(sqlQuery, req.body, userID);
      return res.status(200).json({message: "Product updates success!"});
   } catch (error) {
       res.status(500).json({ message: error.message });
   }
})

router.post('/confirmed', authenticateToken, async (req, res) => {
   if (res.user.role !== 'ADMIN') return res.status(403).json({ message: "Access denied! No rights!" })
   // Get suplly value for a product by its productID:
   const sqlQuery = `SELECT products.supply
               FROM products
               JOIN orders
               ON orders.productID = products.productID
               WHERE orders.productID = ?`
   
   const response = await db.getOne(sqlQuery, req.body.productID)
   if (!response) return res.status(404).json({ message: "Product ID not found!" })
   if (response.supply < req.body.quantity) {
      return res.status(400).json({ message: "This product is sold out!" })
   } else {
      try {
          // Update the supply value of the product:
         const newSupplyValue = response.supply - req.body.quantity
         const sqlQuery = `UPDATE products
                        SET ?
                        WHERE productID = ?`
         await db.update(sqlQuery, { supply: newSupplyValue }, req.body.productID)
         
         // Update the order status:
         const sqlQuery1 = `UPDATE orders
                        SET ?
                        WHERE orderID = ?`
         await db.update(sqlQuery1, { orderState: true }, req.body.orderID)
         return res.status(200).json({ message: "Order Confirmed!" })
      } catch (error) {
         return res.status(500).json({ message: error.message })
      }
   }
   
})

// Delete one or multiple orders:
router.delete('/:remove', async (req, res) => {
   try {
      const sqlQuery = `DELETE FROM orders WHERE orderID IN (?)`
      const result = await db.delete(sqlQuery, req.body.ordersID)
      return res.status(200).json(result)
   } catch(error) {
      res.status(500).json({ message: error.message})
   }
   
})

module.exports = router;