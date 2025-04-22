import mysql from "mysql2/promise"

export async function createConnection() {
  try {
    // Create a connection to the database
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    })

    return connection
  } catch (error) {
    console.error("Failed to connect to the database:", error)
    throw new Error("Database connection failed")
  }
}
