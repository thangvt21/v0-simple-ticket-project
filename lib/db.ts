import mysql from "mysql2/promise"

export async function createConnection() {
  try {
    // Create a connection to the database
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || "localhost",
      user: process.env.MYSQL_USER || "issueuser",
      password: process.env.MYSQL_PASSWORD || "issuepassword",
      database: process.env.MYSQL_DATABASE || "issue_tracker",
      // Add connection pool settings for better performance
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })

    return connection
  } catch (error) {
    console.error("Failed to connect to the database:", error)
    throw new Error("Database connection failed")
  }
}
