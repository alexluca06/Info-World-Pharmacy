import mysql from 'mysql2'

const sql = mysql.createPool({
    host: '127.0.0.1',
    user: 'alexluca06',
    password: 'password',
    database: 'info_world_pharmacy'
}).promise()


async function getProducts() { 
    try {
         const [result] = await sql.query("SELECT * FROM products")
         return result
    } catch (error) {
         console.log(error)
    }
 }
 
 async function getProduct(productId) { 
     try {
         const [result] = await sql.query(
             `SELECT * 
             FROM users
             WHERE productID = ?`
         , [productId])
         return result[0]
     } catch(error) {
         console.log(error)
     }
 }
 
 async function addProduct(productInfo) {
     try {
         const [result] = await sql.query(`
             INSERT INTO users 
             (username, password, firstName, lastName, cnp, phone, email, address, secondAddress)
             VALUES (?)
         `,[Object.values(productInfo)])
         return result
     } catch (error) {
         console.log(error)
     }
 }
 
 async function deleteUser(userId) {
     const result = await sql.query(`
         DELETE FROM users
         WHERE userID = ?
     `, [userId])
     return result
 }
 
 async function updateUser(userId, newInfo) {
     const result = await sql.query(`
         UPDATE users
         SET ?
         WHERE userID = ?
     `, [newInfo, userId])
     return result
 }
 
