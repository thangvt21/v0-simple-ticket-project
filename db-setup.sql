-- Create the issues_type table
CREATE TABLE IF NOT EXISTS issues_type (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type_name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some default issue types
INSERT IGNORE INTO issues_type (type_name) VALUES 
  ('Bug'), 
  ('Feature Request'), 
  ('Technical Issue'),
  ('Customer Support'),
  ('Documentation');

-- Create the issues table if it doesn't exist
CREATE TABLE IF NOT EXISTS issues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  issue_title VARCHAR(255) NOT NULL,
  issue_type_id INT,
  time_issued DATETIME NOT NULL,
  description TEXT NOT NULL,
  solution TEXT,
  time_start DATETIME,
  time_finish DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (issue_type_id) REFERENCES issues_type(id)
);
