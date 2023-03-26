const Database = require('../databases/DatabaseOperations')
require('dotenv').config({ path: '../.env' })
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const app = express();


// Connect and access the database:
const db = new Database()

// Resolve CORS politics
app.use(cors({origin: '*'}));

// Enable JSON packages
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Middleware that gets an user/ verifies if a user already exists by his username
const getUser = async (req, res, next) => {
   
    try {
        const username = req.params.username || req.body.username
        let sqlQuery = `SELECT * FROM users WHERE username = ?`
        let user = await db.getOne(sqlQuery, username)
        if (user == null) {
            return res.status(404).json({ message: 'Cannot find user!'})
        }
        res.user = user
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
    next();
}

// Function that generates an access token based on user info: username etc
const generateAccessToken = (userInfo, expiresIn='3600s') => {
   return jwt.sign(userInfo, process.env.ACCESS_TOKEN_SECRET, { expiresIn: expiresIn })
}

 // Login a user using the username and password
app.post('/login', getUser, async (req, res) => {
    try {
         if (await bcrypt.compare(req.body.password, res.user.password)) { 
            const userLoginInfo = { username: req.body.username }
            const accessToken = generateAccessToken(userLoginInfo)
            const refreshToken = jwt.sign(userLoginInfo, process.env.REFRESH_TOKEN_SECRET)
            
            // Add a new refresh token to database   
            try {
                let sqlQuery = `INSERT INTO tokens
                        (userID, refreshToken)
                        VALUES (?)`
                await db.create(sqlQuery, {userID: res.user.userID, refreshToken: refreshToken})
            } catch (error) {
                return res.status(400).json({ message: error.message })
            }
            
           return res.json( {accessToken: accessToken, refreshToken: refreshToken, message: "Success Login!" } )
        } else {
            return res.json({ message: "Wrong password!" })
        }
    } catch (error) {
        return res.status(500).json({ message: error.message }) 
    }
});


// Create a new access token based on refresh token
app.post('/token', async (req, res) => {
    const refreshToken = req.body.refreshToken
    if (refreshToken == null) return res.sendStatus(401).json({ message: "You must have a refresh token!" })
    let sqlQuery = `SELECT refreshToken FROM tokens WHERE refreshToken = ?`
    const isRefreshTokenValid = await db.getOne(sqlQuery, refreshToken )
    if (isRefreshTokenValid == null) return res.status(403).json({ message: "Your refresh token is invalid!" }) 
    // Is the refreshToken valid?
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, userInfo) => {
        if (err) return res.status(403).json({ message: 'The token is not valid!' })
        const accessToken = generateAccessToken({ username: userInfo.username })
        return res.json({ accessToken: accessToken })
    })

});

// Logout: delete the refresh token
app.delete('/logout', async (req, res) => {
    const refreshToken = req.body.refreshToken
    if(refreshToken) {
        try {
            let sqlQuery = `DELETE FROM tokens WHERE refreshToken = ?`
            await db.delete(sqlQuery, refreshToken);
            return res.status(204).json({ message: "Deleted Refresh Token!" })
        } catch (error) {
            return res.status(500).json({ message: error.message })
        }
    } else {
        return res.status(403).json({ message: "You must have a refresh token!"})
    }
}); 


const PORT = Number(process.env.AUTH_PORT) || 4000
app.listen(PORT, () => {
    console.log(`Server is working on PORT ${PORT}!`)
});