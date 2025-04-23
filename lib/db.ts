import mysql from "mysql2/promise"

// Create a connection pool instead of individual connections
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
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
    const [results] = await pool.execute(sql, params)
    return results
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// For backward compatibility
export async function createConnection() {
  try {
    return await pool.getConnection()
  } catch (error) {
    console.error("Failed to get database connection:", error)
    throw new Error("Database connection failed")
  }
}
