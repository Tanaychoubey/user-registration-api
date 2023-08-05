# User Registration API

The User Registration API is a backend system that allows users to register for a new account. It provides an HTTP POST endpoint for user registration and returns a JSON response with the registered user's information and a success message.

## Getting Started

To use this API, you need to have Node.js and npm (Node Package Manager) installed on your machine.

1. Clone the repository or download the project files.
2. Install the required dependencies by running `npm install` in the project directory.
3. Start the server by running `npm start`.

The server will start running on `http://localhost:3000`.

## API Endpoints

### 1. User Registration

This endpoint is used for registering a new user.

- **Endpoint**: `POST /api/register`

#### Request

```json
{
  "username": "example_user",
  "email": "user@example.com",
  "password": "secure_password123",
  "full_name": "John Doe",
  "age": 30,
  "gender": "male"
}
```

#### Success Response

```json
{
  "status": "success",
  "message": "User successfully registered!",
  "data": {
    "user_id": "12345",
    "username": "example_user",
    "email": "user@example.com",
    "full_name": "John Doe",
    "age": 30,
    "gender": "male"
  }
}
```

#### Error Response

```json
{
  "status": "error",
  "code": "INVALID_REQUEST",
  "message": "Invalid request. Please provide all required fields: username, email, password, full_name."
}
```

#### Error Codes

| Error Code         | Description                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------- |
| INVALID_REQUEST    | Invalid request. Please provide all required fields: username, email, password, full_name. |
| USERNAME_EXISTS    | The provided username is already taken. Please choose a different username.               |
| EMAIL_EXISTS       | The provided email is already registered. Please use a different email address.           |
| INVALID_PASSWORD   | The provided password does not meet the requirements.                                    |
| INVALID_AGE        | Invalid age value. Age must be a positive integer.                                       |
| GENDER_REQUIRED    | Gender field is required. Please specify the gender (e.g., male, female, non-binary).     |
| INTERNAL_ERROR     | An internal server error occurred. Please try again later.                                |

### 2. Generate Token

This endpoint is used for generating a new access token for authentication.

- **Endpoint**: `POST /api/token`

#### Request

```json
{
  "username": "example_user",
  "password": "secure_password123"
}
```

#### Response

```json
{
  "status": "success",
  "message": "Access token generated successfully.",
  "data": {
    "access_token": "<TOKEN>",
    "expires_in": 3600
  }
}
```

#### Error Codes

| Error Code         | Description                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------- |
| INVALID_CREDENTIALS | Invalid credentials. The provided username or password is incorrect.                       |
| MISSING_FIELDS     | Missing fields. Please provide both username and password.                                 |
| INTERNAL_ERROR     | Internal server error occurred. Please try again later.                                    |

### 3. Store Data

This endpoint is used to store a key-value pair in the database.

- **Endpoint**: `POST /api/data`

#### Request

**Request Headers**:

- **`Authorization`**: Bearer **`access_token`**

```json
{
  "key": "unique_key",
  "value": "data_value"
}
```

#### Response

```json
{
  "status": "success",
  "message": "Data stored successfully."
}
```

#### Error Codes

| Error Code      | Description                                                  |
| --------------- | ------------------------------------------------------------ |
| INVALID_KEY     | The provided key is not valid or missing.                   |
| INVALID_VALUE   | The provided value is not valid or missing.                 |
| KEY_EXISTS      | The provided key already exists in the database.            |
| INVALID_TOKEN   | Invalid access token provided.                              |

### 4. Retrieve Data

This endpoint is used to retrieve the value associated with a specific key.

- **Endpoint**: `GET /api/data/{key}`

**Request Headers**:

- **`Authorization`**: Bearer **`access_token`**

#### Response

```json
{
  "status": "success",
  "data": {
    "key": "unique_key",
    "value": "data_value"
  }
}
```

#### Error Codes

| Error Code      | Description                                                  |
| --------------- | ------------------------------------------------------------ |
| KEY_NOT_FOUND   | The provided key does not exist in the database.             |
| INVALID_TOKEN   | Invalid access token provided.                              |

### 5. Update Data

This endpoint is used to update the value associated with an existing key.

- **Endpoint**: `PUT /api/data/{key}`

**Request Headers**:

- **`Authorization`**: Bearer **`access_token`**

#### Request

```json
{
  "value": "new_data_value"
}
```

#### Response

```json
{
  "status": "success",
  "message": "Data updated successfully."
}
```

#### Error Codes

| Error Code      | Description                                                  |
| --------------- | ------------------------------------------------------------ |
| KEY_NOT_FOUND   | The provided key does not exist in the database.             |
| INVALID_TOKEN   | Invalid access token provided.                              |

### 6. Delete Data

This endpoint is used to delete a key-value pair from the database.

- **Endpoint**: `DELETE /api/data/{key}`

**Request Headers**:

- **`Authorization`**: Bearer **`access_token`**

#### Response

```json
{
  "status": "success",
  "message": "Data deleted successfully."
}
```

#### Error Codes

| Error Code      | Description                                                  |
| --------------- | ------------------------------------------------------------ |
| KEY_NOT_FOUND   | The provided key does not exist in the database.             |
| INVALID_TOKEN   | Invalid access token provided.                              |

## Authentication

For protected endpoints (Store Data, Retrieve Data, Update Data, and Delete Data), you need to pass the access token obtained during user registration in the request headers as follows:

```http
Authorization: Bearer <ACCESS_TOKEN>
```

Replace `<ACCESS_TOKEN>` with the actual access token received during user registration.

## Technologies Used

- Node.js
- Express.js
- SQLite (for demonstration purposes; you can use other databases)
- Sequelize (ORM)
- JSON Web Tokens (JWT) for authentication

---
