const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Sequelize, Model, DataTypes } = require("sequelize");

const app = express();
const port = process.env.PORT || 3000;
const secretKey = "your_secret_key"; // Replace this with a secure secret key

// Sequelize setup
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: ":memory:",
});

// Define the User model
class User extends Model {}
User.init(
  {
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    full_name: DataTypes.STRING,
    age: DataTypes.INTEGER,
    gender: DataTypes.STRING,
  },
  { sequelize, modelName: "user" }
);

// Define the Data model
class Data extends Model {}
Data.init(
  {
    key: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    value: DataTypes.STRING,
  },
  { sequelize, modelName: "data" }
);

// Middleware to parse JSON requests
app.use(express.json());

// User Registration API
app.post("/api/register", async (req, res) => {
  const { username, email, password, full_name, age, gender } = req.body;
  if (!username || !email || !password || !full_name) {
    return res.status(400).json({
      status: "error",
      code: "INVALID_REQUEST",
      message:
        "Invalid request. Please provide all required fields: username, email, password, full_name.",
    });
  }

  try {
    // Check if the username or email already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({
        status: "error",
        errors: [
          {
            code: "USERNAME_EXISTS",
            message:
              "The provided username is already taken. Please choose a different username.",
          },
        ],
      });
    }

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({
        status: "error",
        errors: [
          {
            code: "EMAIL_EXISTS",
            message:
              "The provided email is already registered. Please use a different email address.",
          },
        ],
      });
    }

    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      full_name,
      age,
      gender,
    });

    return res.status(201).json({
      status: "success",
      message: "User successfully registered!",
      data: newUser,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      code: "INTERNAL_SERVER_ERROR",
      message: "An internal server error occurred. Please try again later.",
    });
  }
});

// Generate Token API
app.post("/api/token", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({
      status: "error",
      code: "MISSING_FIELDS",
      message: "Missing fields. Please provide both username and password.",
    });
  }

  try {
    // Retrieve the user from the database by username
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({
        status: "error",
        code: "INVALID_CREDENTIALS",
        message:
          "Invalid credentials. The provided username or password is incorrect.",
      });
    }

    // Compare the hashed password with the provided password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        status: "error",
        code: "INVALID_CREDENTIALS",
        message:
          "Invalid credentials. The provided username or password is incorrect.",
      });
    }

    // Generate a new access token
    const accessToken = jwt.sign({ user_id: user.id }, secretKey, {
      expiresIn: "1h",
    });

    return res.json({
      status: "success",
      message: "Access token generated successfully.",
      data: {
        access_token: accessToken,
        expires_in: 3600,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      code: "INTERNAL_SERVER_ERROR",
      message: "An internal server error occurred. Please try again later.",
    });
  }
});

// Store Data API
app.post("/api/data", authenticateToken, async (req, res) => {
  const { key, value } = req.body;
  if (!key || !value) {
    return res.status(400).json({
      status: "error",
      code: "INVALID_REQUEST",
      message: "Invalid request. Please provide both key and value.",
    });
  }

  try {
    // Check if the key already exists
    const existingData = await Data.findByPk(key);
    if (existingData) {
      return res.status(409).json({
        status: "error",
        code: "KEY_EXISTS",
        message:
          "The provided key already exists in the database. To update an existing key, use the update API.",
      });
    }

    // Insert the key-value pair into the database
    await Data.create({ key, value });

    return res.json({
      status: "success",
      message: "Data stored successfully.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      code: "INTERNAL_SERVER_ERROR",
      message: "An internal server error occurred. Please try again later.",
    });
  }
});

// Retrieve Data API
app.get("/api/data/:key", authenticateToken, async (req, res) => {
  const key = req.params.key;
  try {
    // Retrieve the value associated with the key from the database
    const data = await Data.findByPk(key);
    if (!data) {
      return res.status(404).json({
        status: "error",
        code: "KEY_NOT_FOUND",
        message: "The provided key does not exist in the database.",
      });
    }

    return res.json({
      status: "success",
      data: {
        key,
        value: data.value,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      code: "INTERNAL_SERVER_ERROR",
      message: "An internal server error occurred. Please try again later.",
    });
  }
});

// Update Data API
app.put("/api/data/:key", authenticateToken, async (req, res) => {
  const key = req.params.key;
  const { value } = req.body;
  if (!value) {
    return res.status(400).json({
      status: "error",
      code: "INVALID_REQUEST",
      message: "Invalid request. Please provide the value to update.",
    });
  }

  try {
    // Update the value associated with the key in the database
    const [updatedRows] = await Data.update({ value }, { where: { key } });
    if (updatedRows === 0) {
      return res.status(404).json({
        status: "error",
        code: "KEY_NOT_FOUND",
        message: "The provided key does not exist in the database.",
      });
    }

    return res.json({
      status: "success",
      message: "Data updated successfully.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      code: "INTERNAL_SERVER_ERROR",
      message: "An internal server error occurred. Please try again later.",
    });
  }
});

// Delete Data API
app.delete("/api/data/:key", authenticateToken, async (req, res) => {
  const key = req.params.key;
  try {
    // Delete the key-value pair from the database
    const deletedRows = await Data.destroy({ where: { key } });
    if (deletedRows === 0) {
      return res.status(404).json({
        status: "error",
        code: "KEY_NOT_FOUND",
        message: "The provided key does not exist in the database.",
      });
    }

    return res.json({
      status: "success",
      message: "Data deleted successfully.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      code: "INTERNAL_SERVER_ERROR",
      message: "An internal server error occurred. Please try again later.",
    });
  }
});

// Middleware to authenticate the access token
async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      status: "error",
      code: "INVALID_TOKEN",
      message: "Invalid access token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const user = await User.findByPk(decoded.user_id);
    if (!user) {
      return res.status(403).json({
        status: "error",
        code: "INVALID_TOKEN",
        message: "Invalid access token provided.",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({
      status: "error",
      code: "INVALID_TOKEN",
      message: "Invalid access token provided.",
    });
  }
}

app.listen(port, async () => {
  console.log(`Server running on http://localhost:${port}`);
  try {
    // Sync the database models with the actual database
    await sequelize.authenticate();
    console.log("Database connection established successfully.");
    await sequelize.sync({ force: true });
    console.log("Database synchronized successfully.");
  } catch (err) {
    console.error("Unable to connect to the database:", err);
  }
});
