const express = require("express");
const fs = require("fs");
const memjs = require("memjs");
require("dotenv").config(); // For environment variables
const app = express();
const port = 4500;
const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

// Debug: Check environment variable
console.log("MEMCACHED_SERVERS:", process.env.MEMCACHED_SERVERS);
console.log("DB_SERVERS:", process.env.DB_HOST);

// Initialize Memcached client
const servers = process.env.MEMCACHED_SERVERS || "127.0.0.1:11211"; // Default server if none is set
const mc = memjs.Client.create(servers);

app.get("/image/:id", async (req, res) => {
  console.log("img");

  const imageId = req.params.id;
  const imagePath = `./activate/photos/questionpaper/images/${imageId}.jpg`; // Replace with actual path
  console.log("memcache");
  try {
    console.log(`Request received for image: ${imageId}`);
    // Check Memcached for the image
    const cachedImage = await mc.get(imageId);

    if (cachedImage.value) {
      console.log(`Serving image ${imageId} from Memcached`);
      res.setHeader("Content-Type", "image/jpeg");
      res.send(cachedImage.value);
    } else {
      // Read from disk if not in cache
      if (fs.existsSync(imagePath)) {
        console.log(`Image ${imageId} not in cache, reading from disk`);
        const imageData = fs.readFileSync(imagePath);

        // Cache the image in Memcached
        await mc.set(imageId, imageData, { expires: 3600 });

        console.log(`Serving image ${imageId} from disk and caching it`);
        res.setHeader("Content-Type", "image/jpeg");
        res.send(imageData);
      } else {
        console.log(`Image ${imageId} not found`);
        res.status(404).send("Image not found");
      }
    }
  } catch (error) {
    console.error(`Error handling image ${imageId}:`, error);
    res.status(500).send("Internal server error");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
