-- Create the issues table if it doesn't exist
CREATE TABLE IF NOT EXISTS issues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  issue_title VARCHAR(255) NOT NULL,
  time_issued DATETIME NOT NULL,
  description TEXT NOT NULL,
  solution TEXT,
  time_start DATETIME,
  time_finish DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
