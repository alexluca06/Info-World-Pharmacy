const mysql = require('mysql2')
require('dotenv').config({ path: '../.env' })

class Database {
    constructor() {
        this.sqlConnection = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: 'info_world_pharmacy'
        }).promise()  // gets the connection to the db
    }

    // Gets a SELECT statement
    async getAll(sqlQuery) { 
        try {
            const [result] = await this.sqlConnection.query(sqlQuery)
            return result
        } catch (error) {
             console.log(error)
        }
    }
    // Gets a SELECT ... WHERE (id) statement
    async getOne(sqlQuery, id) { 
        try {
            const [result] = await this.sqlConnection.query(sqlQuery, [id])
            return result[0]
        } catch(error) {
            console.log(error)
        }
    }
    // Gets an INSERT ... VALUES (info) statement
    async create(sqlQuery, info) {
        try {
            const [result] = await this.sqlConnection.query(sqlQuery,[Object.values(info)])
            return result
        } catch (error) {
            console.log(error)
        }
    }

    // Gets an UPDATE ... SET (newInfo) ... WHERE (id) statement
    async update(sqlQuery, newInfo, id) {
        const result = await this.sqlConnection.query(sqlQuery, [newInfo, id])
        return result
    }

    // Gets a DELETE ... WHERE IN (ids) statement
    async delete(sqlQuery, ids) {
        const result = await this.sqlConnection.query(sqlQuery, [ids])
        return result
    }
}

module.exports=Database