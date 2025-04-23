-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO users (username, email, password, role) 
VALUES ('admin', 'admin@example.com', '$2b$10$JqWf4cC7PQHg5S.fpR.5.eAx3KGXo2mxRlw1Qb.KIHRmZHEAXHSAK', 'admin');

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

-- Create the issues table with user references
CREATE TABLE IF NOT EXISTS issues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  issue_title VARCHAR(255) NOT NULL,
  issue_type_id INT,
  time_issued DATETIME NOT NULL,
  description TEXT NOT NULL,
  solution TEXT,
  time_start DATETIME,
  time_finish DATETIME,
  created_by INT NOT NULL,
  assigned_to INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (issue_type_id) REFERENCES issues_type(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id)
);
