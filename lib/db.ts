import mysql from "mysql2/promise"

// Create a connection pool with proper configuration
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  port: Number.parseInt(process.env.MYSQL_PORT || "33066"), // Use the new port
  user: process.env.MYSQL_USER || "issueuser",
  password: process.env.MYSQL_PASSWORD || "issuepassword",
  database: process.env.MYSQL_DATABASE || "issue_tracker",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Enable connection timeouts
  connectTimeout: 10000, // 10 seconds
  // Enable keep-alive
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000, // 10 seconds
})

// Helper function to execute queries using the connection pool
export async function query(sql: string, params: any[] = []) {
  try {
    console.log("Executing query:", sql)
    console.log("With params:", params)

    const [results] = await pool.execute(sql, params)
    console.log("Query results:", results)

    return results
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// For backward compatibility - wraps the connection to use release instead of end
export async function createConnection() {
  try {
    console.log("Creating database connection")
    const connection = await pool.getConnection()
    console.log("Connection created successfully")

    // Store the original end method
    const originalEnd = connection.end.bind(connection)

    // Override the end method to use release instead
    connection.end = () => {
      console.log("Releasing connection back to pool")
      connection.release()
      return Promise.resolve()
    }

    return connection
  } catch (error) {
    console.error("Failed to create database connection:", error)
    throw error
  }
}
