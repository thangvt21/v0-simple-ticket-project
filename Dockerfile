# Use Node.js LTS as the base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the port the app will run on
EXPOSE 3000

# Set environment variables (these will be overridden by docker run command)
ENV NODE_ENV=production
ENV MYSQL_HOST=mysql-host
ENV MYSQL_USER=mysql-user
ENV MYSQL_PASSWORD=mysql-password
ENV MYSQL_DATABASE=mysql-database

# Start the application
CMD ["npm", "start"]
