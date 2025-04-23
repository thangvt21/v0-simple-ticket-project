# Issue Tracker API Documentation

This document provides information about the API endpoints available in the Issue Tracker application.

## Authentication

### Login

**URL:** `/api/auth/login`
**Method:** `POST`
**Description:** Authenticates a user and returns a JWT token

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "password123"
}
\`\`\`

**Success Response:**
\`\`\`json
{
  "user": {
    "id": 1,
    "username": "username",
    "email": "user@example.com",
    "role": "admin"
  }
}
\`\`\`

**Error Response:**
\`\`\`json
{
  "error": "Invalid email or password"
}
\`\`\`

### Register

**URL:** `/api/auth/register`
**Method:** `POST`
**Description:** Creates a new user account

**Request Body:**
\`\`\`json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123"
}
\`\`\`

**Success Response:**
\`\`\`json
{
  "success": true,
  "user": {
    "id": 2,
    "username": "newuser",
    "email": "newuser@example.com",
    "role": "user"
  }
}
\`\`\`

**Error Response:**
\`\`\`json
{
  "error": "Username already exists"
}
\`\`\`

### Logout

**URL:** `/api/auth/logout`
**Method:** `POST`
**Description:** Logs out the current user by clearing the auth token

**Success Response:**
\`\`\`json
{
  "success": true
}
\`\`\`

## Issues

### Get Issues

**URL:** `/api/issues`
**Method:** `GET`
**Description:** Retrieves a list of issues with pagination and filtering
**Authentication:** Required

**Query Parameters:**
- `page`: Page number (default: 1)
- `pageSize`: Number of items per page (default: 10)
- `search`: Search term for issue title and description
- `typeId`: Filter by issue type ID
- `assignedTo`: Filter by assigned user ID
- `startDate`: Filter by issues created after this date
- `endDate`: Filter by issues created before this date

**Success Response:**
\`\`\`json
{
  "issues": [
    {
      "id": 1,
      "issue_title": "Example Issue",
      "issue_type_id": 1,
      "type_name": "Bug",
      "time_issued": "2023-01-01T12:00:00Z",
      "description": "Description of the issue",
      "solution": null,
      "time_start": null,
      "time_finish": null,
      "created_by": 1,
      "creator_username": "admin",
      "assigned_to": null,
      "assignee_username": null,
      "created_at": "2023-01-01T12:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 10,
  "totalPages": 1
}
\`\`\`

### Create Issue

**URL:** `/api/issues`
**Method:** `POST`
**Description:** Creates a new issue
**Authentication:** Required

**Request Body:**
\`\`\`json
{
  "issueTitle": "New Issue",
  "issueTypeId": "1",
  "timeIssued": "2023-01-01T12:00:00",
  "description": "Description of the new issue",
  "solution": null,
  "timeStart": null,
  "timeFinish": null,
  "assignedTo": null
}
\`\`\`

**Success Response:**
\`\`\`json
{
  "success": true,
  "issueId": 2
}
\`\`\`

### Get Issue by ID

**URL:** `/api/issues/:id`
**Method:** `GET`
**Description:** Retrieves a specific issue by ID
**Authentication:** Required

**Success Response:**
\`\`\`json
{
  "issue": {
    "id": 1,
    "issue_title": "Example Issue",
    "issue_type_id": 1,
    "type_name": "Bug",
    "time_issued": "2023-01-01T12:00:00Z",
    "description": "Description of the issue",
    "solution": null,
    "time_start": null,
    "time_finish": null,
    "created_by": 1,
    "creator_username": "admin",
    "assigned_to": null,
    "assignee_username": null,
    "created_at": "2023-01-01T12:00:00Z"
  }
}
\`\`\`

### Update Issue

**URL:** `/api/issues/:id`
**Method:** `PUT`
**Description:** Updates an existing issue
**Authentication:** Required
**Authorization:** Admin or issue creator

**Request Body:**
\`\`\`json
{
  "issueTitle": "Updated Issue",
  "issueTypeId": "1",
  "timeIssued": "2023-01-01T12:00:00",
  "description": "Updated description",
  "solution": "Solution to the issue",
  "timeStart": "2023-01-02T10:00:00",
  "timeFinish": "2023-01-03T15:00:00",
  "assignedTo": "2"
}
\`\`\`

**Success Response:**
\`\`\`json
{
  "success": true
}
\`\`\`

### Delete Issue

**URL:** `/api/issues/:id`
**Method:** `DELETE`
**Description:** Deletes an issue
**Authentication:** Required
**Authorization:** Admin or issue creator

**Success Response:**
\`\`\`json
{
  "success": true
}
\`\`\`

## Issue Types

### Get Issue Types

**URL:** `/api/issue-types`
**Method:** `GET`
**Description:** Retrieves all issue types
**Authentication:** Required

**Success Response:**
\`\`\`json
{
  "types": [
    {
      "id": 1,
      "type_name": "Bug",
      "created_at": "2023-01-01T00:00:00Z"
    },
    {
      "id": 2,
      "type_name": "Feature Request",
      "created_at": "2023-01-01T00:00:00Z"
    }
  ]
}
\`\`\`

### Create Issue Type

**URL:** `/api/issue-types`
**Method:** `POST`
**Description:** Creates a new issue type
**Authentication:** Required

**Request Body:**
\`\`\`json
{
  "typeName": "New Type"
}
\`\`\`

**Success Response:**
\`\`\`json
{
  "success": true,
  "type": {
    "id": 3,
    "type_name": "New Type",
    "created_at": "2023-01-10T00:00:00Z"
  }
}
\`\`\`

## Users

### Get Users

**URL:** `/api/users`
**Method:** `GET`
**Description:** Retrieves all users
**Authentication:** Required
**Authorization:** Admin only

**Success Response:**
\`\`\`json
{
  "users": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin",
      "created_at": "2023-01-01T00:00:00Z"
    }
  ]
}
\`\`\`

### Create User

**URL:** `/api/users`
**Method:** `POST`
**Description:** Creates a new user
**Authentication:** Required
**Authorization:** Admin only

**Request Body:**
\`\`\`json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "user"
}
\`\`\`

**Success Response:**
\`\`\`json
{
  "success": true,
  "userId": 2
}
\`\`\`

### Get User by ID

**URL:** `/api/users/:id`
**Method:** `GET`
**Description:** Retrieves a specific user by ID
**Authentication:** Required
**Authorization:** Admin only

**Success Response:**
\`\`\`json
{
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "created_at": "2023-01-01T00:00:00Z"
  }
}
\`\`\`

### Update User

**URL:** `/api/users/:id`
**Method:** `PUT`
**Description:** Updates an existing user
**Authentication:** Required
**Authorization:** Admin only

**Request Body:**
\`\`\`json
{
  "username": "updateduser",
  "email": "updated@example.com",
  "password": "newpassword",
  "role": "admin"
}
\`\`\`

**Success Response:**
\`\`\`json
{
  "success": true
}
\`\`\`

### Delete User

**URL:** `/api/users/:id`
**Method:** `DELETE`
**Description:** Deletes a user
**Authentication:** Required
**Authorization:** Admin only

**Success Response:**
\`\`\`json
{
  "success": true
}
\`\`\`

## Health Check

### Get Health Status

**URL:** `/api/health`
**Method:** `GET`
**Description:** Checks the health of the application

**Success Response:**
\`\`\`json
{
  "status": "ok",
  "message": "Service is healthy"
}
\`\`\`

**Error Response:**
\`\`\`json
{
  "status": "error",
  "message": "Service is unhealthy",
  "error": "Database connection failed"
}
\`\`\`

\`\`\`

### Create README.md
