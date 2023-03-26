import mysql from 'mysql2'

const sql= mysql.createPool({
    host: '127.0.0.1',
    user: 'alexluca06',
    password: 'password',
    database: 'info_world_pharmacy'
}).promise()

async function getUsers() { 
   try {
        const [result] = await sql.query("SELECT * FROM users")
        return result
   } catch (error) {
        console.log(error)
   }
}

async function getUser(userId) { 
    try {
        const [result] = await sql.query(
            `SELECT * 
            FROM users
            WHERE userID = ?`
        , [userId])
        return result[0]
    } catch(error) {
        console.log(error)
    }
}

async function createUser(userInfo) {
    try {
        const [result] = await sql.query(`
            INSERT INTO users 
            (username, password, firstName, lastName, cnp, phone, email, address, secondAddress)
            VALUES (?)
        `,[Object.values(userInfo)])
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

console.log(await updateUser(6, {firstname: "Andreea", lastname:"Maria", email: null}))

/* const result = await createUser({
    username: 'alexluca06',
    password: '1234',
    firstName: 'Alexandru', 
    lastName: 'Luca',
    cnp: '1990406046266', 
    phone: '0743568097', 
    email: 'luca',
    address: 'Bucuresti, Romania',
    secondAddress: null}) 
 */
/* const deletedUser = await deleteUser(1)
console.log(deletedUser) */
const users = await getUsers()
console.log(users)

const user = await getUser('alexluca0')
console.log(user)