const mysql = require('mysql2')

class Database {
    constructor() {
        this.sqlConnection = mysql.createPool({
            host: '127.0.0.1',
            user: 'alexluca06',
            password: 'password',
            database: 'info_world_pharmacy'
        }).promise()  // gets the connection to the db
    }

    async getAll(sqlQuery) { 
        try {
            const [result] = await this.sqlConnection.query(sqlQuery)
            return result
        } catch (error) {
             console.log(error)
        }
    }

    async getOne(sqlQuery, id) { 
        try {
            const [result] = await this.sqlConnection.query(sqlQuery, [id])
            return result[0]
        } catch(error) {
            console.log(error)
        }
    }

    async create(sqlQuery, info) {
        try {
            const [result] = await this.sqlConnection.query(sqlQuery,[Object.values(info)])
            return result
        } catch (error) {
            console.log(error)
        }
    }


    async update(sqlQuery, newInfo, id) {
        const result = await this.sqlConnection.query(sqlQuery, [newInfo, id])
        return result
    }

    async delete(sqlQuery, id) {
        const result = await this.sqlConnection.query(sqlQuery, [id])
        return result
    }
}

module.exports=Database