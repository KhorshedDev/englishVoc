// Import necessary dependencies
const mongoose = require("mongoose");
require("dotenv").config();

// Define your MongoDB connection URL
const mongoUrl = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@ac-7scb7do-shard-00-00.nbieto6.mongodb.net:27017,ac-7scb7do-shard-00-01.nbieto6.mongodb.net:27017,ac-7scb7do-shard-00-02.nbieto6.mongodb.net:27017/Vocabulary?ssl=true&replicaSet=atlas-od4hp9-shard-0&authSource=admin&retryWrites=true&w=majority`;

// Connect to MongoDB
mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB Atlas");
    // Start your server or perform other actions here
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB Atlas:", error);
  });

// Define a secret token for authentication
const secretToken = process.env.SECRET_KEY;

// Middleware to authenticate requests
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token || token !== `Bearer ${secretToken}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
};

// Import your Word model and other necessary dependencies

const wordSchema = new mongoose.Schema({
  term: {
    type: String,
    required: true,
    unique: true,
  },
  definition: {
    type: String,
    required: false,
  },
});

const Word = mongoose.model("Word", wordSchema);

// Define the main handler function
exports.handler = async (event, context) => {
  try {
    if (event.httpMethod !== "GET") {
      // Return an error response for non-GET requests
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method Not Allowed" }),
      };
    }

    // Use the authenticate middleware to check the authorization header
    const authHeader = event.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${secretToken}`) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Unauthorized" }),
      };
    }

    // Fetch 20 random documents
    const data = await Word.aggregate([{ $sample: { size: 20 } }]);

    // Return the data as the response
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error(error);
    // Return an error response for internal server errors
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
