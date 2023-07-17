const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

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

const app = express();

// Define a secret token for authentication
const secretToken = "hellokhorshed";

// Middleware to authenticate requests
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token || token !== `Bearer ${secretToken}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
};

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

// Route handler for GET /data
app.get("/data", authenticate, async (req, res) => {
  try {
    // Fetch 20 random documents
    const data = await Word.aggregate([{ $sample: { size: 20 } }]);

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
const port = 3000 || process.env.PORT;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
