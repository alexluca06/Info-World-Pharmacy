const jwt = require('jsonwebtoken')
const Database = require('../../databases/DatabaseOperations')

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
module.exports={authenticateToken} 