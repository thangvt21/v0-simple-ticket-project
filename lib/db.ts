import mysql from "mysql2/promise"

export async function createConnection() {
  try {
    // Create a connection to the database
    // Fill in your MySQL connection details below
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || "localhost", // Replace with your MySQL host
      user: process.env.MYSQL_USER || "", // Replace with your MySQL username
      password: process.env.MYSQL_PASSWORD || "", // Replace with your MySQL password
      database: process.env.MYSQL_DATABASE || "", // Replace with your MySQL database name
    })

    return connection
  } catch (error) {
    console.error("Failed to connect to the database:", error)
    throw new Error("Database connection failed")
  }
}
