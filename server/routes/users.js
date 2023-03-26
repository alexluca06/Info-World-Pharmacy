const express = require('express')
const bcrypt = require('bcrypt');
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
       let sqlQuery = `SELECT
                     firstName, lastName, cnp, phone, email, address 
                     FROM users
                     WHERE username = ?`
       const  user = await db.getOne(sqlQuery, userInfo.username );
       res.user = user
       next()
   })
}


// Get all users:
router.get('/', async (req, res) => {
 try {
    const users = await db.getAll('Select * from users')
    return res.status(200).json(users)
 } catch (error) {
    return res.status(500).json({ message: error.message })
 }
});

// Get an user:
router.get('/:username', authenticateToken, async (req, res) => {
   res.json(res.user);
  });

// SignUp users with all necessary information about them
router.post('/signup', async (req, res) => {
   // Hash the password:
   const hashedPassword =  await bcrypt.hash(req.body.password, 10)
   // Extract user info from request body:
   const userInfo = {
      username: req.body.username,
      password: hashedPassword,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      cnp: req.body.cnp,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      secondAdress: req.body.secondAdress
   }

   // Save the new user into our database
   let sqlQuery = ` INSERT INTO users 
               (username, password, firstName, lastName, cnp, phone, email, address, secondAddress)
               VALUES (?) `
   const newUser = await db.create(sqlQuery, userInfo)
   newUser ? res.status(201).json({ message: "Successfully creating a new user!" }) : res.status(400).json({ message: "Cannot create the new user!" })
   
});

// Update the information(eg. username, first name, last name...) about an user
router.patch('/:username', authenticateToken, async (req, res) => {
   try {
      let sqlQuery = `UPDATE users
                  SET ?
                  WHERE username = ?`
      await db.update(sqlQuery, req.body, req.params.username);
      res.status(200).json({message: "User updates success!"});
   } catch (error) {
       res.status(400).json({ message: error.message });
   }
});

// Delete an user already created
router.delete('/:username', authenticateToken, async (req, res) => {
   try {
         let sqlQuery = `DELETE FROM users WHERE username = ?`
         const result = await db.delete(sqlQuery ,req.params.username);
         return res.status(200).json({ message: 'Deleted User' });
   } catch (error) {
         return res.status(500).json({ message: error.message });
   }
});

module.exports = router;