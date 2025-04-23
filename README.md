# Issue Tracker

A comprehensive issue tracking application built with Next.js, MySQL, and Docker.

## Features

- **Authentication System**: User registration, login, and role-based access control
- **Issue Management**: Create, view, edit, and delete issues
- **User Management**: Admin interface for managing users
- **Advanced Filtering**: Search and filter issues by various criteria
- **Responsive Design**: Works on desktop and mobile devices
- **Docker Integration**: Easy deployment with Docker and Docker Compose

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Containerization**: Docker, Docker Compose

## Getting Started

### Prerequisites

- Node.js 18+ (for local development)
- Docker and Docker Compose (for containerized deployment)
- MySQL (if running without Docker)

### Installation

#### Using Docker (Recommended)

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/issue-tracker.git
   cd issue-tracker
   \`\`\`

2. Create a `.env` file from the example:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

3. Update the environment variables in the `.env` file with your preferred settings.

4. Start the application with Docker Compose:
   \`\`\`bash
   docker-compose up -d
   \`\`\`

5. Access the application at http://localhost:3000

#### Local Development

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/issue-tracker.git
   cd issue-tracker
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create a `.env` file from the example:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

4. Update the environment variables in the `.env` file with your MySQL connection details.

5. Set up the database:
   \`\`\`bash
   mysql -u yourusername -p yourdatabase < db-setup.sql
   \`\`\`

6. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

7. Access the application at http://localhost:3000

## Environment Variables

- `MYSQL_HOST`: MySQL host (default: "localhost")
- `MYSQL_USER`: MySQL username
- `MYSQL_PASSWORD`: MySQL password
- `MYSQL_DATABASE`: MySQL database name
- `JWT_SECRET`: Secret key for JWT token generation
- `NEXT_PUBLIC_SITE_URL`: Public URL of the application (for SEO)

## Docker Deployment

### Production

\`\`\`bash
docker-compose up -d
\`\`\`

### Development

\`\`\`bash
docker-compose -f docker-compose.dev.yml up -d
\`\`\`

## Testing

\`\`\`bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
\`\`\`

## API Documentation

See [API.md](API.md) for detailed API documentation.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
