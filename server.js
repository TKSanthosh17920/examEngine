const axios = require("axios");
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const express = require("express");
const mysql = require("mysql");
const mysqldump = require("mysqldump");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const { exec } = require("child_process");
const { spawn } = require("child_process");
const Memcached = require("memcached");
const cron = require("node-cron");
const FormData = require("form-data");
const bcrypt = require("bcrypt");
const archiver = require("archiver");
const { decode } = require("html-entities");
const fetch = require("node-fetch");
require("dotenv").config(); // For environment variables
const utils = require("./utils");
const { arValue, timeValue, biometricValue } = require("./Constants");

const app = express();
const port = 5000;
// const mysqlPath = '"C:/mysql5/bin/mysql.exe"';
const mysqlPath = "C:/xampp/mysql/bin/mysql.exe";

// List of tables to export
const tablesToExport = [
  "autofeed",
  "biometric_report_api",
  "descriptive_answer",
  "exam_skip_biometricvalidation",
  "iib_candidate_iway",
  "iib_candidate_scores",
  "iib_candidate_test",
  "iib_candidate_tracking",
  "iib_feedback",
  "iib_response",
  "iib_section_test",
  "netboot_ip_mapping",
  "timelog",
];

// Directory to save feed files
const feedDir = "C:\\pro\\itest\\feed";

// Create directory if it doesn't exist
if (!fs.existsSync(feedDir)) {
  fs.mkdirSync(feedDir, { recursive: true });
}

// Create a Memcached connection
const memcached = new Memcached("localhost:11211"); // Update with your Memcached server details

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = ".dmp"; // Use .sql if no extension provided
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// MySQL Connection Configuration
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const client = process.env.CLIENT;
// Define the paths to the photo and sign directories
const photoDir = "C:\\pro\\itest\\activate\\photo";
const signDir = "C:\\pro\\itest\\activate\\sign";

db.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
    throw err;
  }
  console.log("Connected to MySQL database");
});

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);
app.use(bodyParser.json());

// Mock user data (in a real application, this should come from a database)
const users = [
  { username: "admin", password: "password123", serialnumber: "6CD338GLL1" },
  { username: "110086D", password: "admin", serialnumber: "5CD311G1F5" },
  { username: "854306A", password: "admin", serialnumber: "5CD311G1F5" },
];

// Set a value in Memcached
memcached.set("my_key", "Hello, Memcached!", 10000, (err) => {
  // 10000 seconds TTL
  if (err) {
    console.error("Error setting value in Memcached:", err);
    return;
  }
  console.log("Value set in Memcached");
});

// Format Date
const formatDate = (inputDate) => {
  const date = new Date(inputDate);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatDateTimeStamp = () => {
  const currentDate = new Date();

  const pad = (num) => num.toString().padStart(2, "0"); // Ensures 2 digits for day, month, hours, etc.

  const day = pad(currentDate.getDate());
  const month = pad(currentDate.getMonth() + 1); // Months are zero-indexed, so add 1
  const year = currentDate.getFullYear();
  const hours = pad(currentDate.getHours());
  const minutes = pad(currentDate.getMinutes());
  const seconds = pad(currentDate.getSeconds());

  return `${day}${month}${year}${hours}${minutes}${seconds}`;
};

// Define the directories to be removed
const directoriesToClear = [
  path.join("C:", "pro", "itest", "activate", "photo"),
  path.join("C:", "pro", "itest", "activate", "sign"),
];
const directoriesToRemove = [
  path.join("C:", "pro", "itest", "activate", "photos"),
  path.join("C:", "pro", "itest", "feed"),
];

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "Server is up and running" });
});

// Endpoint to check the health of the Memcached server
app.get("/api/memcache-health", (req, res) => {
  memcached.stats((err, stats) => {
    if (err) {
      console.error("Memcached server is down:", err);
      return res.status(500).send("Memcached server is down");
    }
    res.status(200).send("Memcached server is running");
  });
});

// Endpoint to check the health of the MySQL server
app.get("/api/mysql-health", (req, res) => {
  db.ping((err) => {
    if (err) {
      console.error("MySQL server is down:", err);
      return res.status(500).send("MySQL server is down");
    }
    res.status(200).send("MySQL server is running");
  });
});

// Define the endpoint to fetch exam settings
app.get("/api/exam-settings", (req, res) => {
  const query = "SELECT variable_name, variable_value FROM exam_settings";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching exam settings:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Transform results into an object with variable_name as keys
    const settings = results.reduce((acc, row) => {
      acc[row.variable_name] = row.variable_value;
      return acc;
    }, {});

    res.json(settings);
  });
});

app.get("/count-files", (req, res) => {
  try {
    const photoFiles = fs
      .readdirSync(photoDir)
      .filter((file) => fs.statSync(path.join(photoDir, file)).isFile());
    const signFiles = fs
      .readdirSync(signDir)
      .filter((file) => fs.statSync(path.join(signDir, file)).isFile());
    const feedFiles = fs
      .readdirSync(feedDir)
      .filter((file) => fs.statSync(path.join(feedDir, file)).isFile());

    const photoCount = photoFiles.length;
    const signCount = signFiles.length;
    const feedCount = feedFiles.length;

    res.json({
      photoCount,
      signCount,
      feedCount,
    });
  } catch (error) {
    console.error("Error reading directories:", error);
    res.status(500).json({ error: "Failed to retrieve file counts" });
  }
});

app.get("/api/feed-sync", (req, res) => {
  const countQuery = `SELECT COUNT(*) AS count FROM feed_filenames WHERE status = 'Y'`;

  db.query(countQuery, (err, result) => {
    if (err) {
      console.error("Error fetching count:", err);
      return res.status(500).json({ error: "Database query error" });
    }

    const count = result[0].count;
    res.json({ statusYCount: count });
  });
});

// Function to remove all files in a directory but keep the directory itself
function clearDirectoryFiles(dir) {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach((file) => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath); // Remove file
      }
    });
  }
}

function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = path.join(dirPath, file);
      if (fs.statSync(curPath).isDirectory()) {
        removeDirectory(curPath); // Recurse
      } else {
        fs.unlinkSync(curPath); // Delete file
      }
    });
    fs.rmdirSync(dirPath); // Remove directory
  }
}
// Login route
app.post("/clientlogin", (req, res) => {
  const { username, password, serialnumber } = req.body;
  // console.log('username -- ', username, 'pass -- ', password, 'serial -- ', serialnumber);

  // Find the user with the matching username, password, and serialnumber
  const user = users.find(
    (u) =>
      u.username === username &&
      u.password === password &&
      u.serialnumber === serialnumber
  );

  if (user) {
    // Get the current time of the server
    const currenttime = new Date();
    const formattedTime = currenttime
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    // SQL query to check if the record already exists
    const sqlCheck =
      "SELECT * FROM qp_download WHERE centre_code = ? AND download_status = ?";

    db.query(sqlCheck, [username, "D"], (err, results) => {
      if (err) {
        console.error("MySQL select error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      if (results.length > 0) {
        // Record already exists, no need to insert
        res.status(200).json({ message: "Record already exists" });
      } else {
        // Record doesn't exist, proceed with insertion
        const sqlInsert =
          "INSERT INTO qp_download (centre_code, serverno, download_sec, download_status, download_time) VALUES (?, ?, ?, ?, ?)";

        db.query(
          sqlInsert,
          [username, "a", "Mac Address", "D", formattedTime],
          (err, result) => {
            if (err) {
              console.error("MySQL insert error:", err);
              return res.status(500).json({ message: "Internal Server Error" });
            } else {
              res.status(200).json({
                message: "Login successful and record inserted",
                username: user.username,
              });
            }
          }
        );
      }
    });
  } else {
    // Failed login
    res
      .status(401)
      .json({ message: "Invalid username, password, or serial number" });
  }
});

// Assuming you're using Express.js
app.get("/qp-status", (req, res) => {
  const sql = "SELECT COUNT(*) as count FROM qp_download";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error querying qp_download:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json({ count: result[0].count });
  });
});

app.get("/download-zip/:status/:batch", async (req, res) => {
  const status = req.params.status;
  const batch = req.params.batch;
  console.log("Gop:", batch);

  // let file = status === 'Base' ? process.env.CLIENT : status;
  // const file =
  //   status === "Base"
  //     ? process.env.CLIENT
  //     : status === "Act"
  //       ? batch == "11:00:00"
  //         ? "bac7a-110000"
  //         : "78192-150000"
  //       : status;

  const file =
    status === "Base"
      ? process.env.CLIENT
      : status === "Act"
        ? batch == "10:00:00"
          ? "90e6e-100000"
          : "3b62f-150000"
        : status;
  const url = `https://demo70.sifyitest.com/livedata/${file}.zip`;

  console.log("URL:", url);

  // Define directories
  const tempDir = path.join("C:", "pro", "itest", "activate", "temp");
  const extractDir = path.join("C:", "pro", "itest", "activate");
  const photoDir = path.join("C:", "pro", "itest", "activate", "photo");
  const signDir = path.join("C:", "pro", "itest", "activate", "sign");
  const zipFilePath = path.join(tempDir, `${file}.zip`);

  // Create the temp directory if it doesn't exist
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  try {
    // Step 1: Download the file
    const response = await axios.get(url, { responseType: "stream" });
    const writer = fs.createWriteStream(zipFilePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    console.log("File downloaded successfully");

    // Step 2: Unzip the file
    const zip = new AdmZip(zipFilePath);
    if (!status.endsWith("_photo") && !status.endsWith("_sign")) {
      zip.extractAllTo(extractDir, true);
      console.log(`File extracted successfully to ${extractDir}`);
    } else {
      if (status.endsWith("_photo")) {
        zip.extractAllTo(photoDir, true);
        console.log(`Photo File extracted successfully to ${photoDir}`);
      }
      if (status.endsWith("_sign")) {
        zip.extractAllTo(signDir, true);
        console.log(`Sign File extracted successfully to ${signDir}`);
      }
    }

    // Step 3: Modify content of .sql files if qpStatus is not 'Base'
    if (status !== "Base") {
      fs.readdirSync(extractDir).forEach((file) => {
        const filePath = path.join(extractDir, file);

        if (
          fs.lstatSync(filePath).isFile() &&
          path.extname(filePath) === ".sql"
        ) {
          // Read the file contents
          let fileContent = fs.readFileSync(filePath, "utf8");

          // Replace '_temp' with an empty string
          fileContent = fileContent.replace(/_temp/g, "");

          // Write the modified content back to the file
          fs.writeFileSync(filePath, fileContent, "utf8");
          console.log(`File content modified: ${filePath}`);
        }
      });
    }

    // Optionally delete the zip file after extraction
    fs.unlinkSync(zipFilePath);

    res.send("File downloaded, extracted, and content modified successfully");
  } catch (error) {
    console.error("Error during download or extraction:", error);
    res.status(500).send("Error during the process");
  }
});

app.get("/serial-number", (req, res) => {
  const command = spawn("wmic", ["bios", "get", "serialnumber"], {
    stdio: "pipe", // Keep the output in the pipe, no terminal window should open
    shell: true, // Use the shell to execute the command
    windowsHide: true, // Hide the terminal window
  });

  let output = "";

  command.stdout.on("data", (data) => {
    output += data.toString();
  });

  command.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  command.on("close", (code) => {
    if (code !== 0) {
      return res.status(500).send("Error retrieving serial number");
    }

    const lines = output.trim().split("\n");
    const serialNumber = lines[1]?.trim();

    if (serialNumber) {
      res.send({ serialNumber });
    } else {
      res.status(404).send("Serial number not found");
    }
  });
});

// Define a GET route for starting PM2
app.get("/start-pm2", (req, res) => {
  // Start pm2 restart in the background
  const pm2 = spawn("pm2", ["restart", "itest"], {
    detached: true, // Run in a separate process
    stdio: "ignore", // Ignore the output (optional)
  });

  // Unref the process so that the parent can exit independently
  pm2.unref();
  res.send("PM2 process started successfully");
});

// Upload and import route
app.post("/upload", upload.single("file"), (req, res) => {
  const dumpFilePath = path.join(__dirname, "uploads", req.file.filename);

  // const mysqlPath = "C:/mysql5/bin/mysql.exe";
  // const mysqlPath = "C:/mysql5/bin/mysql.exe";

  // Escape special characters in the password if needed
  const escapedPassword = process.env.DB_PASSWORD.replace(/"/g, '\\"');

  // Construct the command
  const command = `"${mysqlPath}" -u ${process.env.DB_USER} --password="${escapedPassword}"  ${process.env.DB_NAME} < "${dumpFilePath}"`;
  console.log(command);
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      console.error(`stderr: ${stderr}`);
      return res.status(500).send("Error importing dump file");
    }
    // console.log(`stdout: ${stdout}`);
    res.send("Dump file imported successfully");
  });
});

// Activate
app.post("/activate/:status/:batch", (req, res) => {
  const status = req.params.status;
  const batch = req.params.batch;
  // console.log('staus',status);
  // const file =
  //   status === "Base"
  //     ? process.env.CLIENT
  //     : status === "Act"
  //       ? batch == "11:00:00"
  //         ? "bac7a-110000"
  //         : "78192-150000"
  //       : status;
  const file =
    status === "Base"
      ? process.env.CLIENT
      : status === "Act"
        ? batch == "10:00:00"
          ? "90e6e-100000"
          : "3b62f-150000"
        : status;
  console.log("File:", file);
  // Define the dumpFilePath based on the status
  let dumpFilePath;
  if (status === "Act") {
    dumpFilePath = path.join(
      "C:",
      "pro",
      "itest",
      "activate",
      "photos",
      "questionpaper",
      "images",
      `${file}.txt`
    );
    //Newly added code

    dumpFilePath = dumpFilePath.replace(/\\/g, "/");

    //Newly added code
  } else {
    dumpFilePath = path.join("C:", "pro", "itest", "activate", `${file}.sql`);
  }

  // const mysqlPath = "C:/mysql5/bin/mysql.exe";

  // Log paths for debugging
  console.log("MySQL Path:", mysqlPath);
  // console.log('Dump File Path:', dumpFilePath);

  // Check if files exist
  if (!fs.existsSync(mysqlPath)) {
    return res.status(500).send("MySQL executable not found.");
  }
  if (!fs.existsSync(dumpFilePath)) {
    return res.status(500).send("SQL dump file not found.");
  }

  // Escape special characters in the password if needed
  const escapedPassword = process.env.DB_PASSWORD.replace(/"/g, '\\"');

  // Construct the MySQL command
  const command = `"${mysqlPath}" -u ${process.env.DB_USER} --password="${escapedPassword}"  ${process.env.DB_NAME} < "${dumpFilePath}"`;
  console.log("Executing command:", command);

  // Execute the command
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      console.error(`stderr: ${stderr}`);
      return res.status(500).send("Error importing dump file");
    }
    console.log(`stdout: ${stdout}`);

    res.send("Dump file imported successfully");
  });
});

app.post("/insert-base", (req, res) => {
  const { centre_code, serverno, download_sec } = req.body;

  // Get the current time of the server
  const currenttime = new Date();
  const formattedTime = currenttime
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  // Validate input data
  if (!centre_code || !serverno || !download_sec) {
    return res.status(400).send("All fields are required.");
  }

  // Check if the record already exists
  const checkSql =
    "SELECT COUNT(*) AS count FROM qp_download WHERE centre_code = ? AND serverno = ? AND download_sec = ?";
  const checkValues = [centre_code, serverno, download_sec];

  db.query(checkSql, checkValues, (err, result) => {
    if (err) {
      console.error("MySQL select error:", err);
      return res.status(500).send("Error checking data in the database.");
    }

    // If record already exists, skip insertion
    if (result[0].count > 0) {
      return res.status(409).send("Record already exists.");
    }

    // Insert data into the qp_download table
    const sql =
      "INSERT INTO qp_download (centre_code, serverno, download_sec, download_status, download_time) VALUES (?, ?, ?, ?, ?)";
    const values = [centre_code, serverno, download_sec, "D", formattedTime];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("MySQL insert error:", err);
        return res.status(500).send("Error inserting data into the database.");
      }
      res.status(200).send("Data inserted successfully.");
    });
  });
});

// Endpoint to get exam slot count
app.get("/exam-slot-count", (req, res) => {
  const query = `SELECT COUNT(*) as slotCount FROM iib_exam_slots`;

  db.query(query, (error, results) => {
    if (error) {
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json({ slotCount: results[0].slotCount });
  });
});

// Route to clear data
app.get("/clear", (req, res) => {
  const queries = ["DROP DATABASE ITEST", "CREATE DATABASE ITEST"];

  // Remove the directories
  directoriesToClear.forEach(clearDirectoryFiles);
  directoriesToRemove.forEach(removeDirectory);

  db.beginTransaction((err) => {
    if (err) {
      console.error("Error starting transaction:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Function to execute queries within a transaction
    const executeQueriesInTransaction = (index) => {
      if (index >= queries.length) {
        return db.commit((err) => {
          if (err) {
            console.error("Error committing transaction:", err);
            return db.rollback(() => {
              res.status(500).json({ error: "Internal Server Error" });
            });
          }
          res.send("All queries executed and committed successfully");

          const dumpFilePath = "C:/pro/itest/activate/db.dmp";
          // const mysqlPath = "C:/mysql5/bin/mysql.exe";

          // Escape special characters in the password if needed
          const escapedPassword = process.env.DB_PASSWORD.replace(/"/g, '\\"');

          // Construct the command
          const command = `"${mysqlPath}" -u ${process.env.DB_USER} --password="${escapedPassword}" ${process.env.DB_NAME} < "${dumpFilePath}"`;

          exec(command, (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`);
              console.error(`stderr: ${stderr}`);
              return res.status(500).send("Error importing dump file");
            }
            // console.log(`stdout: ${stdout}`);
            res.send("Dump file imported successfully");
          });
        });
      }

      db.query(queries[index], (err) => {
        if (err) {
          console.error("Error executing query:", err);
          return db.rollback(() => {
            insertIntoXmlFeed;
            res.status(500).json({ error: "Internal Server Error" });
          });
        }
        executeQueriesInTransaction(index + 1); // Execute the next query
      });
    };

    executeQueriesInTransaction(0); // Start executing queries
  });
});

// Define a route to fetch the data
app.get("/exam-data/:centrecode", (req, res) => {
  // SQL query to join the tables
  const centrecode = req.params.centrecode;
  //  console.log(centrecode);
  const query = `SELECT  DATE_FORMAT(slot.exam_date, '%Y-%m-%d') AS exam_date,slot.zone_code,COUNT(distinct(slot.membership_no)) AS totalScheduled, COUNT(CASE WHEN test.test_status = "C" THEN 1 END) AS totalComplete,COUNT(CASE WHEN test.test_status = "IC" THEN 1 END) AS totalIncomplete FROM  iib_candidate_iway slot LEFT JOIN  iib_candidate_test test ON slot.membership_no = test.membership_no and slot.centre_code = ? group by slot.exam_time`;
  db.query(query, [centrecode], (err, results) => {
    if (err) {
      console.error("Error querying the database:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    res.json(results);
  });
});

// Route to handle response submissions
app.post("/response", (req, res) => {
  const {
    questionId,
    answer,
    qpno,
    displayorder,
    tag,
    hostip,
    updatedtime,
    clienttime,
    totalTime,
  } = req.body;

  if (!questionId || !answer || !qpno || !displayorder || !tag || !hostip) {
    return res
      .status(400)
      .json({ status: "400", message: "All fields are required" });
  }
  const time_taken = totalTime - clienttime;
  db.beginTransaction((err) => {
    if (err) {
      console.error("Transaction error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    // Format the insert query
    const insertResponseSql =
      "INSERT INTO iib_response (question_paper_no, question_id, answer, display_order, tag, host_ip, updatedtime, clienttime) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const formattedInsertResponseSql = db.format(insertResponseSql, [
      qpno,
      questionId,
      answer,
      displayorder,
      tag,
      hostip,
      updatedtime,
      clienttime,
    ]);

    db.query(formattedInsertResponseSql, (err, result) => {
      if (err) {
        return db.rollback(() => {
          console.error("MySQL insert error:", err);
          res.status(500).json({ message: "Internal Server Error" });
        });
      }

      // Insert the exact formatted query into xml_feed
      insertIntoXmlFeed(formattedInsertResponseSql, (err) => {
        if (err) {
          return db.rollback(() => {
            console.error("Error inserting into xml_feed:", err);
            res.status(500).json({ message: "Internal Server Error" });
          });
        }
      });

      // Format the update query
      const updateTestSql =
        "UPDATE iib_candidate_test SET last_updated_time = ?, time_taken = ?, time_left = ?, clienttime = ? WHERE host_ip = ? AND question_paper_no = ?";
      const formattedUpdateTestSql = db.format(updateTestSql, [
        updatedtime,
        time_taken,
        clienttime,
        clienttime,
        hostip,
        qpno,
      ]);

      db.query(formattedUpdateTestSql, (err, result) => {
        if (err) {
          return db.rollback(() => {
            console.error("MySQL update error:", err);
            res.status(500).json({ message: "Internal Server Error" });
          });
        }

        // Insert the exact formatted query into xml_feed
        insertIntoXmlFeed(formattedUpdateTestSql, (err) => {
          if (err) {
            return db.rollback(() => {
              console.error("Error inserting into xml_feed:", err);
              res.status(500).json({ message: "Internal Server Error" });
            });
          }
        });

        db.commit((err) => {
          if (err) {
            return db.rollback(() => {
              console.error("Transaction commit error:", err);
              res.status(500).json({ message: "Internal Server Error" });
            });
          }

          res.json({
            status: "200",
            message: "Data inserted and test updated successfully",
          });
        });
      });
    });
  });
});

// Route to handle exam completion
app.post("/update-exam-status", (req, res) => {
  const {
    membershipNo,
    exam_code,
    subject_code,
    score,
    exam_date,
    time_taken,
    result,
    auto_submit,
    updated_on,
  } = req.body;

  if (!membershipNo || !subject_code || score === undefined) {
    return res
      .status(400)
      .json({ status: "400", message: "All fields are required" });
  }

  // Start a transaction
  db.beginTransaction((err) => {
    if (err) {
      console.error("Transaction error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    // Insert into iib_candidate_score
    const insertScoreSql =
      "INSERT INTO iib_candidate_scores (membership_no, exam_code, subject_code,  score, exam_date, time_taken, result, auto_submit, updated_on) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(
      insertScoreSql,
      [
        membershipNo,
        exam_code,
        subject_code,
        score,
        exam_date,
        time_taken,
        result,
        auto_submit,
        updated_on,
      ],
      (err, result) => {
        if (err) {
          return db.rollback(() => {
            console.error("MySQL insert error:", err);
            res.status(500).json({ message: "Internal Server Error" });
          });
        }

        // Update iib_candidate_test
        const updateTestSql =
          "UPDATE iib_candidate_test SET  test_status = ?, end_time = ? WHERE membership_no = ? and subject_code = ?";
        db.query(
          updateTestSql,
          ["C", updated_on, membershipNo, subject_code],
          (err, result) => {
            if (err) {
              return db.rollback(() => {
                console.error("MySQL update error:", err);
                res.status(500).json({ message: "Internal Server Error" });
              });
            }

            // Commit transaction
            db.commit((err) => {
              if (err) {
                return db.rollback(() => {
                  console.error("Transaction commit error:", err);
                  res.status(500).json({ message: "Internal Server Error" });
                });
              }

              res.json({
                status: "200",
                message: "Exam status updated and score inserted successfully",
              });
            });
          }
        );
      }
    );
  });
});

// Route to handle form submissions
app.post("/submit-form", (req, res) => {
  const { name, email, password, subjectCode, examDate } = req.body;
  if (!name || !email || !password || !subjectCode || !examDate) {
    return res
      .status(400)
      .json({ status: "400", message: "All fields are required" });
  }
  // Hash the password before storing
  const hashedPassword = bcrypt.hashSync(password, 10);
  const sql =
    "INSERT INTO user_data (name, email, password, subject_code, exam_date) VALUES (?, ?, ?, ?, ?)";
  db.query(
    sql,
    [name, email, hashedPassword, subjectCode, examDate],
    (err, result) => {
      if (err) {
        console.error("MySQL insert error:", err);
        res.status(500).json({ message: "Internal Server Error" });
      } else {
        res.json({ status: "200", message: "Data inserted successfully" });
      }
    }
  );
});

// Route to handle Subject submission
app.post("/subject-form", (req, res) => {
  const { scode, sname, examDate } = req.body;
  if (!scode || !sname || !examDate) {
    return res
      .status(400)
      .json({ status: "400", message: "All fields are required" });
  }
  const sql =
    "INSERT INTO subject_data (subject_code, subject_name, exam_date) VALUES (?, ?, ?)";
  db.query(sql, [scode, sname, examDate], (err, result) => {
    if (err) {
      console.error("MySQL insert error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    } else {
      res.json({ status: "200", message: "Data inserted successfully" });
    }
  });
});

// Route to handle Question submission
app.post("/submit-qp", (req, res) => {
  const { subjectCode, questions } = req.body;
  const sql =
    "INSERT INTO questions (subject_code, question_text, option_a, option_b, option_c, option_d, correct_ans, mark) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  questions.forEach((question) => {
    db.query(
      sql,
      [
        subjectCode,
        question.question,
        question.options[0].text,
        question.options[1].text,
        question.options[2].text,
        question.options[3].text,
        question.correct_ans,
        question.mark,
      ],
      (err, result) => {
        if (err) {
          console.error("MySQL insert error:", err);
          res.status(500).json({ message: "Internal Server Error" });
        }
      }
    );
  });
  res.json({ status: "200", message: "Data inserted successfully" });
});

// Route to get subject codes
app.get("/subject-codes", (req, res) => {
  const query =
    "SELECT subject_code, subject_name, exam_date FROM iib_exam_subjects";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error querying the database:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});

// Route to get question counts
app.get("/question-counts/:subjectCode", (req, res) => {
  const subjectCode = req.params.subjectCode;
  const sql = "SELECT COUNT(*) as count FROM questions WHERE subject_code = ?";
  db.query(sql, [subjectCode], (err, result) => {
    if (err) {
      console.error("MySQL error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      const questionCount = result[0] ? result[0].count : 0;
      res.json({ subjectCode, questionCount });
    }
  });
});

// Route to get questions
// app.get("/questions/:questionPaperNo/:encryptKey", (req, res) => {
//   const questionPaperNo = req.params.questionPaperNo;
//   const encryptKey = req.params.encryptKey;
//   if (!questionPaperNo) {
//     return res.status(400).json({ error: "Invalid questionPaperNo parameter" });
//   }

//   const sql = `
//       SELECT a.*, b.question_id as question_id,
//         AES_DECRYPT(b.question_text, ?) as question_text, 
//         AES_DECRYPT(b.option_1, ?) as option_1, 
//         AES_DECRYPT(b.option_2, ?) as option_2, 
//         AES_DECRYPT(b.option_3, ?) as option_3, 
//         AES_DECRYPT(b.option_4, ?) as option_4, 
//         AES_DECRYPT(b.option_5, ?) as option_5, 
//         b.correct_answer, b.marks, b.negative_marks, c.*
//       FROM iib_question_paper_details AS a
//       JOIN iib_sq_details AS b ON a.subject_code = b.subject_code 
//       JOIN iib_subject_sections AS c ON b.section_code = c.section_code AND a.question_id = b.question_id
//       WHERE a.question_paper_no = ? group by b.question_id ORDER BY display_order`;

//   db.query(
//     sql,
//     [
//       encryptKey,
//       encryptKey,
//       encryptKey,
//       encryptKey,
//       encryptKey,
//       encryptKey,
//       questionPaperNo,
//     ],
//     (err, result) => {
//       if (err) {
//         console.error("MySQL error:", err);
//         return res.status(500).json({ error: "Internal Server Error" });
//       } else {
//         const resultdata = result.map((question, index) => ({
//           id: question.question_id,
//           // id: index + 1,
//           text: decode(question.question_text),
//           subject_code: question.subject_code,
//           section_name: question.section_name,
//           answer_order: question.answer_order,
//           options: [
//             { id: "a", text: decode(question.option_1) },
//             { id: "b", text: decode(question.option_2) },
//             { id: "c", text: decode(question.option_3) },
//             { id: "d", text: decode(question.option_4) },
//             { id: "e", text: decode(question.option_5) },
//           ],
//           correct_ans: Number(question.correct_answer),
//           // correct_ans: 2,

//           mark: question.marks,
//           negative_mark: question.negative_marks,
//         }));
//         //   console.log(resultdata);
//         res.json(resultdata);
//       }
//     }
//   );
// });

app.get("/questions/:questionPaperNo/:encryptKey/:lang", (req, res) => {
  const questionPaperNo = req.params.questionPaperNo;
  const encryptKey = req.params.encryptKey;
  const lang = req.params.lang;
  // const lang = "TN";
  if (!questionPaperNo) {
    return res.status(400).json({ error: "Invalid questionPaperNo parameter" });
  }
  // const lang = sessionStorage.getItem('candidate-medium');

  console.log(lang);
  console.log(lang);
// Determine which table and condition to use based on language
let sql;
if (lang == "EN") {
  sql = `
    SELECT 
      a.*, 
      b.question_id AS question_id,
      AES_DECRYPT(b.question_text, ?) AS question_text, 
      AES_DECRYPT(b.option_1, ?) AS option_1, 
      AES_DECRYPT(b.option_2, ?) AS option_2, 
      AES_DECRYPT(b.option_3, ?) AS option_3, 
      AES_DECRYPT(b.option_4, ?) AS option_4, 
      AES_DECRYPT(b.option_5, ?) AS option_5, 
      b.correct_answer, 
      b.marks, 
      b.negative_marks, 
      c.*
    FROM iib_question_paper_details AS a
    JOIN iib_sq_details AS b 
      ON a.subject_code = b.subject_code 
    JOIN iib_subject_sections AS c 
      ON b.section_code = c.section_code AND a.question_id = b.question_id
    WHERE a.question_paper_no = ? 
    GROUP BY b.question_id 
    ORDER BY display_order
  `;
} else {
  sql = `
    SELECT 
      a.*, 
      b.question_id AS question_id,
      AES_DECRYPT(d.question_text, ?) AS question_text, 
      AES_DECRYPT(d.option_1, ?) AS option_1, 
      AES_DECRYPT(d.option_2, ?) AS option_2, 
      AES_DECRYPT(d.option_3, ?) AS option_3, 
      AES_DECRYPT(d.option_4, ?) AS option_4, 
      AES_DECRYPT(d.option_5, ?) AS option_5, 
      b.correct_answer, 
      b.marks, 
      b.negative_marks, 
      c.*
    FROM iib_question_paper_details AS a
    JOIN iib_sq_details AS b 
      ON a.subject_code = b.subject_code 
    JOIN iib_subject_sections AS c 
      ON b.section_code = c.section_code AND a.question_id = b.question_id
    JOIN iib_sq_unicode_details AS d 
      ON d.question_id = b.question_id
    WHERE a.question_paper_no = ? AND lang_code = ? 
    GROUP BY b.question_id 
    ORDER BY display_order
  `;
}

// Now you have your sql query depending on the value of `lang`


const queryParams = [
  encryptKey, // For AES_DECRYPT (question_text)
  encryptKey, // For AES_DECRYPT (option_1)
  encryptKey, // For AES_DECRYPT (option_2)
  encryptKey, // For AES_DECRYPT (option_3)
  encryptKey, // For AES_DECRYPT (option_4)
  encryptKey, // For AES_DECRYPT (option_5)
  questionPaperNo, // For a.question_paper_no
];
if (lang !== "EN") {
  queryParams.push(lang);
}

  db.query(sql,queryParams,(err, result) => {
      if (err) {
        console.error("MySQL error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      } else {
        const resultdata = result.map((question, index) => ({
          id: question.question_id,
          // id: index + 1,
          text: decode(question.question_text),
          subject_code: question.subject_code,
          section_name: question.section_name,
          answer_order: question.answer_order,
          options: [
            { id: "a", text: decode(question.option_1) },
            { id: "b", text: decode(question.option_2) },
            { id: "c", text: decode(question.option_3) },
            { id: "d", text: decode(question.option_4) },
            { id: "e", text: decode(question.option_5) },

          ],
          correct_ans: Number(question.correct_answer),
          // correct_ans: 2,

          mark: question.marks,
          negative_mark: question.negative_marks,
        }));
        //   console.log(resultdata);
        res.json(resultdata);
      }
    }
  );
});

app.get("/fetch-photo/:membershipno", (req, res) => {
  const membershipno = req.params.membershipno;
  const filePath = path.join(
    __dirname,
    "activate",
    "photo",
    "p" + membershipno + ".jpg"
  );

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send("File not found");
    }

    res.sendFile(filePath);
  });
});

app.get("/fetch-sign/:membershipno", (req, res) => {
  const membershipno = req.params.membershipno;
  const filePath = path.join(
    __dirname,
    "activate",
    "sign",
    "s" + membershipno + ".jpg"
  );
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send("File not found");
    }

    res.sendFile(filePath);
  });
});

// Example route to return initial answers
app.get("/initialAnswers/:questionPaperNo", (req, res) => {
  const questionPaperNo = req.params.questionPaperNo;
  if (!questionPaperNo) {
    return res.status(400).json({ error: "Invalid questionPaperNo parameter" });
  }
  const sql = `SELECT display_order, answer, tag FROM iib_response AS r1 WHERE r1.answer IS NOT NULL  AND r1.question_paper_no = ? AND  r1.id = ( SELECT MAX(r2.id) FROM iib_response AS r2 WHERE r2.question_id = r1.question_id  AND r2.question_paper_no = ?)`;

  db.query(sql, [questionPaperNo, questionPaperNo], (err, results) => {
    if (err) {
      console.error("MySQL query error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    // Format the results into the desired object
    const formattedAnswers = results.reduce((acc, curr) => {
      acc[curr.display_order] = {
        answer: curr.answer,
        tag: curr.tag,
      };
      return acc;
    }, {});
    // console.log(formattedAnswers);
    res.json(formattedAnswers);
  });
});

// Route to get sample questions
app.get("/samplequestions", (req, res) => {
  const sql = `SELECT * from sample_qp`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("MySQL error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    } else {
      const resultdata = result.map((question, index) => ({
        id: index + 1,
        text: decode(question.question),
        subject_code: "999",
        section_name: "Sample Sections",
        answer_order: "1,2,3,4",
        options: [
          { id: "a", text: decode(question.option1) },
          { id: "b", text: decode(question.option2) },
          { id: "c", text: decode(question.option3) },
          { id: "d", text: decode(question.option4) },
        ],
        correct_ans: Number(question.correct_answer),
        // correct_ans: 2,

        mark: question.mark,
        negative_mark: question.negative_mark,
      }));
      // console.log(resultdata);
      res.json(resultdata);
    }
  });
});

// Route to get candidate details
app.get("/candidate_details/:user", (req, res) => {
  const user = req.params.user;
  const sql =
    "SELECT * FROM iib_candidate_iway as a JOIN iib_exam_subjects as b ON a.subject_code = b.subject_code JOIN iib_question_paper AS c ON a.membership_no = c.membership_no JOIN iib_candidate AS d ON a.membership_no = d.membership_no JOIN iib_iway_details AS e ON a.centre_code = e.centre_code JOIN iib_exam AS f ON b.exam_code = f.exam_code WHERE a.membership_no = ?";
  db.query(sql, [user], (err, result) => {
    if (err) {
      console.error("MySQL error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      const userId = result[0] ? result[0].id : null;
      const CandidateName = result[0] ? result[0].name : null;
      const Address = result[0] ? result[0].address1 : null;
      const examVenue = result[0] ? result[0].iway_name : null;
      const examCode = result[0] ? result[0].exam_code : null;
      const subjectCode = result[0] ? result[0].subject_code : null;
      const subjectDuration = result[0] ? result[0].subject_duration : null;
      const durationPrevent = result[0] ? result[0].duration_prevent : null;
      const displaySectionname = result[0]
        ? result[0].display_sectionname
        : null;
      const displayScore = result[0] ? result[0].display_score : null;
      const displayResult = result[0] ? result[0].display_result : null;
      const examName = result[0] ? result[0].exam_name : null;
      const subjectName = result[0] ? result[0].subject_name : null;
      const examDate = result[0] ? formatDate(result[0].exam_date) : null;
      const questionPaperNo = result[0] ? result[0].question_paper_no : null;
      const encryptKey = result[0] ? result[0].qp_encry_key : null;
      const pass_mark = result[0] ? result[0].pass_mark : null;
      res.json({
        userId,
        CandidateName,
        Address,
        examVenue,
        examCode,
        subjectCode,
        subjectDuration,
        durationPrevent,
        displaySectionname,
        displayScore,
        displayResult,
        examName,
        subjectName,
        examDate,
        questionPaperNo,
        encryptKey,
        pass_mark,
      });
    }
  });
});

// API endpoint to get clienttime from iib_response table
app.get("/api/get-clienttime/:question_paper_no", (req, res) => {
  // const { question_paper_no } = req.query;
  const question_paper_no = req.params.question_paper_no;

  const query = `SELECT MIN(clienttime) as clienttime FROM iib_response WHERE question_paper_no = ?`;

  db.query(query, [question_paper_no], (err, result) => {
    if (err) {
      console.error("Error fetching clienttime:", err);
      res.status(500).send("Server error");
      return;
    }
    console.log("qpno", result);

    if (result.length > 0) {
      res.json({ clienttime: result[0].clienttime });
    } else {
      res.json({ clienttime: null }); // No entry found, return null
    }
  });
});

//Get RoughSheet Data
app.post("/api/get-rough-sheet", (req, res) => {
  const { membership_no, subject_code, question_paper_no, exam_date } =
    req.body;
  // console.log('member--',membership_no, subject_code, question_paper_no, exam_date);
  // Query the database to find the rough sheet data
  const query = `SELECT message FROM member_rough_sheet 
                   WHERE membership_no = ? 
                   AND subject_code = ? 
                   AND question_paper_no = ? 
                   AND exam_date = ?`;

  db.query(
    query,
    [membership_no, subject_code, question_paper_no, exam_date],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length > 0) {
        return res.status(200).json({ message: results[0].message });
      } else {
        return res.status(404).json({ message: "" });
      }
    }
  );
});

// Save rough sheet data
app.post("/api/save-rough-sheet", (req, res) => {
  const { membership_no, question_paper_no, subject_code, exam_date, text } =
    req.body;

  // Check if record exists
  const checkQuery =
    "SELECT COUNT(*) AS count FROM member_rough_sheet WHERE membership_no = ? AND question_paper_no = ? AND subject_code = ? AND exam_date = ?";

  db.query(
    checkQuery,
    [membership_no, question_paper_no, subject_code, exam_date],
    (err, results) => {
      if (err) {
        console.error("Error checking data existence:", err);
        res.status(500).send("Error");
        return;
      }

      const recordExists = results[0].count > 0;

      let query;
      let queryParams;
      if (recordExists) {
        // Update existing record
        query = `
                UPDATE member_rough_sheet
                SET message = ?, updated_at = NOW()
                WHERE membership_no = ? AND question_paper_no = ? AND subject_code = ? AND exam_date = ?
            `;
        queryParams = [
          text,
          membership_no,
          question_paper_no,
          subject_code,
          exam_date,
        ];
      } else {
        // Insert new record
        console.log("sdad");
        query = `
                INSERT INTO member_rough_sheet (membership_no, question_paper_no, subject_code, exam_date, message, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())
            `;
        queryParams = [
          membership_no,
          question_paper_no,
          subject_code,
          exam_date,
          text,
        ];
      }

      // Execute the appropriate query
      db.query(query, queryParams, (err) => {
        if (err) {
          console.error("Error saving data:", err);
          res.status(500).send("Error saving");
          return;
        }
        res.status(200).send("Saved successfully");
      });
    }
  );
});

app.post("/talogin", (req, res) => {
  const { username, password } = req.body;
  const center_code = username.replace("iwfr_", "").toUpperCase();
  // Replace the following query with your actual query to check credentials
  const checkExamsql =
    "select * from exam_closure_summary where centre_code= ?";
  //   console.log(sql);
  db.query(checkExamsql, [center_code], (err, resultExam) => {
    if (resultExam.length == 0) {
      const sql =
        "SELECT * FROM iib_ta_details WHERE ta_login = ? AND ta_password = password(?)";
      //   console.log(sql);
      db.query(sql, [username, password], (err, results) => {
        if (err) {
          console.error("Database query error:", err);
          res
            .status(500)
            .json({ success: false, message: "Internal Server Error" });
        } else {
          if (results.length > 0) {
            res.json({ success: true, message: "Login successful" });
          } else {
            res.status(401).json({
              success: false,
              message: "Invalid username or password",
            });
          }
        }
      });
    } else {
      res.status(402).json({ success: false, message: "Exam completed!" });
    }
  });
});

app.post("/login", (req, res) => {
  const { username, password, centre_code } = req.body;

  // First query to check the credentials in iib_candidate
  const sqlCheckCredentials =
    "SELECT * FROM iib_candidate as a JOIN iib_candidate_iway as b ON a.membership_no = b.membership_no WHERE a.membership_no = ? AND a.raw_password = ? AND b.centre_code = ?";

  db.query(
    sqlCheckCredentials,
    [username, password, centre_code],
    (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        return res
          .status(500)
          .json({ success: false, message: "Internal Server Error" });
      }

      if (results.length > 0) {
        // Credentials are correct, now check the iib_candidate_iway table
        const sqlCheckExamDate =
          "SELECT exam_date FROM iib_candidate_iway WHERE membership_no = ?";

        db.query(sqlCheckExamDate, [username], (err, results) => {
          if (err) {
            console.error("Database query error:", err);
            return res
              .status(500)
              .json({ success: false, message: "Internal Server Error" });
          }

          if (results.length > 0) {
            const examDate = new Date(results[0].exam_date);
            const currentDate = new Date();

            // Compare the exam date with the current date
            if (
              examDate.getFullYear() === currentDate.getFullYear() &&
              examDate.getMonth() === currentDate.getMonth() &&
              examDate.getDate() === currentDate.getDate()
            ) {
              // Dates match, login successful
              res.json({ success: true, message: "Login successful" });
            } else {
              // Exam date does not match the current date
              res.status(402).json({
                success: false,
                message: "Exam date does not match today's date",
              });
            }
          } else {
            // No matching membership_no found in iib_candidate_iway
            res.status(401).json({
              success: false,
              message: "Membership number not found in iib_candidate_iway",
            });
          }
        });
      } else {
        // Invalid username or password
        res
          .status(401)
          .json({ success: false, message: "Invalid username or password" });
      }
    }
  );
});

app.post("/update-exam-date", (req, res) => {
  const { membershipNo, examDate } = req.body;

  // SQL query to update exam_date in iib_candidate_iway, iib_exam_schedule, and iib_ta_iway
  const updateQuery = `
        UPDATE iib_candidate_iway, iib_exam_schedule, iib_ta_iway
        SET iib_candidate_iway.exam_date = ?,
            iib_exam_schedule.exam_date = ?,
            iib_ta_iway.exam_date = ?        
    `;

  db.query(updateQuery, [examDate, examDate, examDate], (err, result) => {
    if (err) {
      console.error("Error updating exam date:", err);
      return res.status(500).json({ message: "Failed to update exam date." });
    }
    res.json({ message: "Exam date updated successfully." });
  });
});

app.get("/check-batch-closure/:batchId", async (req, res) => {
  const { batchId } = req.params;

  const query = `
        SELECT COUNT(*) as count 
        FROM batchwise_closure_summary 
        WHERE closure_batch_time = ?`;

  try {
    const result = await queryAsync(query, [batchId]); // assuming batchId is used for closure_batch_time
    const count = result[0].count;

    if (count > 0) {
      res.status(200).json({ exists: true, count });
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (err) {
    console.error("Error checking batch closure:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Define the endpoint to fetch instructions
app.get("/api/instructions/:subjectCode", (req, res) => {
  const subjectCode = req.params.subjectCode;

  const sql =
    "SELECT instruction_text FROM iib_instructions_template WHERE subject_code = ?";
  //   console.log(subjectCode);
  db.query(sql, [subjectCode], (err, results) => {
    if (err) {
      res.status(500).json({ error: "Database query failed" });
    } else {
      res.json(results);
      //   console.log(results);
    }
  });
});

// Fetch test status
app.get("/get-test-status/:membershipNo/:hostIp", (req, res) => {
  const membershipNo = req.params.membershipNo; // Use query parameter for GET request
  const hostIp = req.params.hostIp; // Use query parameter for GET request
  // console.log('Received membershipNo:', membershipNo); // Debugging statement
  const query =
    "SELECT test_status FROM iib_candidate_test WHERE membership_no = ? and host_ip = ?";
  db.query(query, [membershipNo, hostIp], (err, results) => {
    if (err) {
      console.error("Error fetching test status:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    console.log("query", query);
    console.log("resss", results);
    if (results.length > 0) {
      res.json({ status: results[0].test_status });
    } else {
      res.json({ status: null }); // No entry found
    }
  });
});

// const queryAsync = (query, values) => {
//   return new Promise((resolve, reject) => {
//     db.query(query, values, (err, results) => {
//       if (err) {
//         return reject(err);
//       }
//       resolve(results);
//     });
//   });
// };
function queryAsync(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results); // Return results directly instead of wrapping in an array
    });
  });

}
app.get(
  "/handleBatchClosure/:batchId/:hostIp/:serialNumber/:centreCode",
  async (req, res) => {
    const { batchId, hostIp, serialNumber, centreCode } = req.params;
    console.log("batchId:", batchId);
    console.log("hostIp:", hostIp);
    console.log("serialNumber:", serialNumber);
    console.log("centreCode:", centreCode);

    // const incompleteCandidatesQuery = `
    //     SELECT
    //         a.question_paper_no AS questionPaperNo,
    //         a.membership_no AS membershipNo,
    //         a.exam_code AS examCode,
    //         a.subject_code AS subjectCode,
    //         c.pass_mark AS passMark,
    //         c.roundoff_score AS roundoff_score,
    //         c.grace_mark AS graceMark,
    //         c.subject_duration AS timeTaken
    //     FROM iib_candidate_test AS a
    //     JOIN iib_candidate_iway AS b ON a.subject_code = b.subject_code
    //     JOIN iib_exam_subjects AS c ON c.subject_code = b.subject_code
    //     WHERE a.test_status = 'IC' AND b.zone_code = ?
    //     GROUP BY a.test_id`;

    try {
      // Fetch incomplete candidates
      // const incompleteCandidates = await queryAsync(incompleteCandidatesQuery, [
      //   batchId,
      // ]);

      // if (incompleteCandidates.length > 0) {
      //   // let remainingCandidates = incompleteCandidates.length;

      //   for (const candidate of incompleteCandidates) {
      //     const {
      //       questionPaperNo,
      //       membershipNo,
      //       examCode,
      //       subjectCode,
      //       passMark,
      //       roundoff_score,
      //       graceMark,
      //       timeTaken,
      //     } = candidate;

      //     console.log("Sending generated score for candidate:", membershipNo);

      //     try {
      //       // Generate score for the candidate
      //       const score = await new Promise((resolve, reject) => {
      //         generateScoreForCandidate(
      //           questionPaperNo,
      //           membershipNo,
      //           examCode,
      //           subjectCode,
      //           passMark,
      //           roundoff_score,
      //           graceMark,
      //           timeTaken,
      //           "Y",
      //           (err, score) => {
      //             if (err) return reject(err);
      //             resolve(score);
      //           }
      //         );
      //       });

      //       console.log(
      //         `Generated score for candidate ${membershipNo}: ${score}`
      //       );

      //       // Update candidate status
      //       const updateCandidateQuery = `UPDATE iib_candidate_test SET test_status = 'C' WHERE membership_no = ?`;
      //       await queryAsync(updateCandidateQuery, [membershipNo]);

      //       remainingCandidates--;

      //       // If all candidates processed, merge and zip files
      //       if (remainingCandidates === 0) {
      //         console.log("Merging files...");
      //         const zipFileName = await mergeAndZipFiles(
      //           centreCode,
      //           serialNumber
      //         );
      //         console.log("Zip file name:", zipFileName);

      //         // Insert summary into database
      //         const insertSummaryQuery = `INSERT INTO batchwise_closure_summary
      //                       (exam_date, centre_code, serverno, closure_batch_time, closure_batch_file, closure_batch_status, serial_no, updated_on, added_on, ip_address)
      //                       VALUES ('2024-09-05', ?, 'a', ?, ?, 'I', ? , NOW(), NOW(), ?)`;
      //         await queryAsync(insertSummaryQuery, [
      //           centreCode,
      //           batchId,
      //           zipFileName,
      //           serialNumber,
      //           hostIp,
      //         ]);

      //         // Upload zip file
      //         const zipFilePath = path.join(
      //           "C:\\pro\\itest\\feed",
      //           zipFileName
      //         );
      //         if (fs.existsSync(zipFilePath)) {
      //           const form = new FormData();
      //           form.append("feedFile", fs.createReadStream(zipFilePath));

      //           const { default: fetch } = await import("node-fetch");
      //           const response = await fetch(
      //             "https://demo70.sifyitest.com/livedata/upload.php",
      //             {
      //               method: "POST",
      //               body: form,
      //               headers: form.getHeaders(),
      //             }
      //           );

      //           if (!response.ok) {
      //             const responseBody = await response.text();
      //             throw new Error(
      //               `Failed to send zip file ${zipFileName}. Status: ${response.status}, Response: ${responseBody}`
      //             );
      //           }

      //           console.log(`File ${zipFileName} sent successfully.`);

      //           // Update summary status to 'U'
      //           const updateSummaryQuery = `UPDATE batchwise_closure_summary SET closure_batch_status = 'U' WHERE closure_batch_file = ?`;
      //           await queryAsync(updateSummaryQuery, [zipFileName]);

      //           res.status(200).json({
      //             message:
      //               "Batch closure processed successfully with files merged, zipped, sent, and status updated",
      //             incompleteCandidatesCount: incompleteCandidates.length,
      //             zipFileName,
      //           });
      //         } else {
      //           console.log(`File ${zipFileName} does not exist.`);
      //           res.status(500).json({ error: "Merged file does not exist" });
      //         }
      //       }
      //     } catch (error) {
      //       console.error(
      //         "Error generating score or updating candidate:",
      //         error
      //       );
      //       // Continue processing other candidates even if one fails
      //     }
      //   }
      // }
      // else {
      // Handle case when no incomplete candidates are found
      // console.log("No incomplete candidates found, merging files...");
      const zipFileName = await mergeAndZipFiles(centreCode, serialNumber);

      const insertSummaryQuery = `INSERT INTO batchwise_closure_summary 
                (exam_date, centre_code, serverno, closure_batch_time, closure_batch_file, closure_batch_status, serial_no, updated_on, added_on, ip_address) 
                VALUES ('2024-09-05', ?, 'a', ?, ?, 'I', ? , NOW(), NOW(), ?)`;
      await queryAsync(insertSummaryQuery, [
        centreCode,
        batchId,
        zipFileName,
        serialNumber,
        hostIp,
      ]);

      const zipFilePath = path.join("C:\\pro\\itest\\feed", zipFileName);
      if (fs.existsSync(zipFilePath)) {
        const form = new FormData();
        form.append("feedFile", fs.createReadStream(zipFilePath));

        const { default: fetch } = await import("node-fetch");
        const response = await fetch(
          "https://demo70.sifyitest.com/livedata/upload.php",
          {
            method: "POST",
            body: form,
            headers: form.getHeaders(),
          }
        );

        if (!response.ok) {
          const responseBody = await response.text();
          throw new Error(
            `Failed to send zip file ${zipFileName}. Status: ${response.status}, Response: ${responseBody}`
          );
        }

        console.log(`File ${zipFileName} sent successfully.`);

        const updateSummaryQuery = `UPDATE batchwise_closure_summary SET closure_batch_status = 'U' WHERE closure_batch_file = ?`;
        await queryAsync(updateSummaryQuery, [zipFileName]);

        res.status(200).json({
          message:
            "Batch closure processed successfully with files merged, zipped, sent, and status updated",
          incompleteCandidatesCount: 0,
          zipFileName,
        });
      } else {
        console.log(`File ${zipFileName} does not exist.`);
        res.status(500).json({ error: "Merged file does not exist" });
      }
      // }
    } catch (err) {
      console.error("Error retrieving incomplete candidates:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

app.get(
  "/handleDayClosure/:batchId/:hostIp/:serialNumber/:centreCode",
  async (req, res) => {
    const { batchId, hostIp, serialNumber, centreCode } = req.params;
    console.log("batchId:", batchId);
    console.log("hostIp:", hostIp);
    console.log("serialNumber:", serialNumber);
    console.log("centreCode:", centreCode);

    let allUniqueTestIds = [];

    const getMaxTestId =
      "SELECT MAX(test_id) as max FROM iib_candidate_test GROUP BY membership_no, exam_code, subject_code";
    const maxTestid = await queryAsync(getMaxTestId);
    for (const row of maxTestid) {
      const getUniqueTestid =
        "SELECT test_id FROM iib_candidate_test WHERE test_id = ? AND test_status  = 'IC'";
      const uniqueTestId = await queryAsync(getUniqueTestid, [row.max]);
      if (uniqueTestId.length > 0) {
        // Check if result is not empty
        console.log(uniqueTestId[0].test_id);
        allUniqueTestIds.push(uniqueTestId[0].test_id);
      }
    }
    console.log(allUniqueTestIds);

    const incompleteCandidatesQuery = `
        SELECT 
            a.question_paper_no AS questionPaperNo, 
            a.membership_no AS membershipNo, 
            a.exam_code AS examCode, 
            a.subject_code AS subjectCode, 
            c.pass_mark AS passMark, 
            c.roundoff_score AS roundoff_score, 
            c.grace_mark AS graceMark,
            c.subject_duration AS timeTaken
        FROM iib_candidate_test AS a
        JOIN iib_candidate_iway AS b ON a.subject_code = b.subject_code
        JOIN iib_exam_subjects AS c ON c.subject_code = b.subject_code
        WHERE a.test_status = 'IC' and a.test_id in (?)
        GROUP BY a.test_id`;

    try {
      // Fetch incomplete candidates
      const incompleteCandidates = await queryAsync(incompleteCandidatesQuery, [
        allUniqueTestIds,
      ]);
      console.log(incompleteCandidates.length);
      // return false;
      if (incompleteCandidates.length > 0) {
        let remainingCandidates = incompleteCandidates.length;

        for (const candidate of incompleteCandidates) {
          const {
            questionPaperNo,
            membershipNo,
            examCode,
            subjectCode,
            passMark,
            roundoff_score,
            graceMark,
            timeTaken,
          } = candidate;

          console.log("Sending generated score for candidate:", membershipNo);

          try {
            // Generate score for the candidate
            const score = await new Promise((resolve, reject) => {
              generateScoreForCandidate(
                questionPaperNo,
                membershipNo,
                examCode,
                subjectCode,
                passMark,
                roundoff_score,
                graceMark,
                timeTaken,
                "Y",
                (err, score) => {
                  if (err) return reject(err);
                  resolve(score);
                }
              );
            });

            console.log(
              `Generated score for candidate ${membershipNo}: ${score}`
            );

            // Update candidate status
            const updateCandidateQuery = `UPDATE iib_candidate_test SET test_status = 'C' WHERE membership_no = ?`;
            await queryAsync(updateCandidateQuery, [membershipNo]);

            remainingCandidates--;

            // If all candidates processed, merge and zip files
            if (remainingCandidates === 0) {
              console.log("Merging files...");
              const zipFileName = await mergeAndZipFiles(
                centreCode,
                serialNumber
              );
              console.log("Zip file name:", zipFileName);

              // Insert summary into database
              const insertSummaryQuery = `INSERT INTO batchwise_closure_summary 
                            (exam_date, centre_code, serverno, closure_batch_time, closure_batch_file, closure_batch_status, serial_no, updated_on, added_on, ip_address) 
                            VALUES ('2024-09-05', ?, 'a', ?, ?, 'I', ? , NOW(), NOW(), ?)`;
              await queryAsync(insertSummaryQuery, [
                centreCode,
                batchId,
                zipFileName,
                serialNumber,
                hostIp,
              ]);

              // Upload zip file
              const zipFilePath = path.join(
                "C:\\pro\\itest\\feed",
                zipFileName
              );
              if (fs.existsSync(zipFilePath)) {
                const form = new FormData();
                form.append("feedFile", fs.createReadStream(zipFilePath));

                const { default: fetch } = await import("node-fetch");
                const response = await fetch(
                  "https://demo70.sifyitest.com/livedata/upload.php",
                  {
                    method: "POST",
                    body: form,
                    headers: form.getHeaders(),
                  }
                );

                if (!response.ok) {
                  const responseBody = await response.text();
                  throw new Error(
                    `Failed to send zip file ${zipFileName}. Status: ${response.status}, Response: ${responseBody}`
                  );
                }

                console.log(`File ${zipFileName} sent successfully.`);

                // Update summary status to 'U'
                const updateSummaryQuery = `UPDATE batchwise_closure_summary SET closure_batch_status = 'U' WHERE closure_batch_file = ?`;
                await queryAsync(updateSummaryQuery, [zipFileName]);

                // res.status(200).json({
                //     message: 'Batch closure processed successfully with files merged, zipped, sent, and status updated',
                //     incompleteCandidatesCount: incompleteCandidates.length,
                //     zipFileName
                // });

                // Insert into `exam_closure_summary`
                const insertExamSummaryQuery = `INSERT INTO exam_closure_summary 
                            (exam_date, centre_code, serverno, closure_action, closure_status, added_on, ip_address) 
                            VALUES ('2024-09-05', ?, 'a', 'Sync Process Data', 'I', NOW(), ?)`;
                await queryAsync(insertExamSummaryQuery, [centreCode, hostIp]);

                // Zip all files starting with "feedbatch_"
                const zipClosureFileName = `hybrid_sifyiibf_${serialNumber}_a_${new Date()
                  .toISOString()
                  .replace(/[:-]/g, "")
                  .replace(/\.\d+Z$/, "")}_Closure_All_Feed.zip`;
                const closureZipFilePath = path.join(
                  "C:\\pro\\itest\\feed",
                  zipClosureFileName
                );

                const feedFiles = fs
                  .readdirSync("C:\\pro\\itest\\feed")
                  .filter(
                    (file) =>
                      file.startsWith("feedbatch_") && file.endsWith(".zip")
                  );
                await zipFiles(feedFiles, closureZipFilePath);

                if (fs.existsSync(closureZipFilePath)) {
                  const form = new FormData();
                  form.append(
                    "feedFile",
                    fs.createReadStream(closureZipFilePath)
                  );

                  const { default: fetch } = await import("node-fetch");
                  const response = await fetch(
                    "https://demo70.sifyitest.com/livedata/upload.php",
                    {
                      method: "POST",
                      body: form,
                      headers: form.getHeaders(),
                    }
                  );

                  if (!response.ok) {
                    const responseBody = await response.text();
                    throw new Error(
                      `Failed to send zip file ${zipClosureFileName}. Status: ${response.status}, Response: ${responseBody}`
                    );
                  }

                  console.log(`File ${zipClosureFileName} sent successfully.`);

                  // Update `exam_closure_summary` to 'U'
                  const updateExamSummaryQuery = `UPDATE exam_closure_summary SET file_path= ?, closure_status = 'U' WHERE closure_action = 'Sync Process Data' AND centre_code = ?`;
                  await queryAsync(updateExamSummaryQuery, [
                    zipClosureFileName,
                    centreCode,
                  ]);
                  const exportDump = exportTablesAsDump(
                    centreCode,
                    serialNumber
                  );

                  if (exportDump) {
                    res.status(200).json({
                      message:
                        "Batch closure processed successfully with files merged, zipped, sent, and status updated",
                      incompleteCandidatesCount: 0,
                      zipFileName: zipClosureFileName,
                    });
                  } else {
                    console.log(`Dump not generated.`);
                    res.status(500).json({ error: "Dump not generated" });
                  }
                } else {
                  console.log(`File ${zipClosureFileName} does not exist.`);
                  res
                    .status(500)
                    .json({ error: "Merged closure file does not exist" });
                }
              } else {
                console.log(`File ${zipFileName} does not exist.`);
                res.status(500).json({ error: "Merged file does not exist" });
              }
            }
          } catch (error) {
            console.error(
              "Error generating score or updating candidate:",
              error
            );
            // Continue processing other candidates even if one fails
          }
        }
      } else {
        // Handle case when no incomplete candidates are found
        console.log("No incomplete candidates found, merging files...");
        const zipFileName = await mergeAndZipFiles(centreCode, serialNumber);

        const insertSummaryQuery = `INSERT INTO batchwise_closure_summary 
                (exam_date, centre_code, serverno, closure_batch_time, closure_batch_file, closure_batch_status, serial_no, updated_on, added_on, ip_address) 
                VALUES ('2024-09-05', ?, 'a', ?, ?, 'I', ? , NOW(), NOW(), ?)`;
        await queryAsync(insertSummaryQuery, [
          centreCode,
          batchId,
          zipFileName,
          serialNumber,
          hostIp,
        ]);

        const zipFilePath = path.join("C:\\pro\\itest\\feed", zipFileName);
        if (fs.existsSync(zipFilePath)) {
          const form = new FormData();
          form.append("feedFile", fs.createReadStream(zipFilePath));

          const { default: fetch } = await import("node-fetch");
          const response = await fetch(
            "https://demo70.sifyitest.com/livedata/upload.php",
            {
              method: "POST",
              body: form,
              headers: form.getHeaders(),
            }
          );

          if (!response.ok) {
            const responseBody = await response.text();
            throw new Error(
              `Failed to send zip file ${zipFileName}. Status: ${response.status}, Response: ${responseBody}`
            );
          }

          console.log(`File ${zipFileName} sent successfully.`);

          const updateSummaryQuery = `UPDATE batchwise_closure_summary SET closure_batch_status = 'U' WHERE closure_batch_file = ?`;
          await queryAsync(updateSummaryQuery, [zipFileName]);

          // res.status(200).json({
          //     message: 'Batch closure processed successfully with files merged, zipped, sent, and status updated',
          //     incompleteCandidatesCount: 0,
          //     zipFileName
          // });

          const insertExamSummaryQuery = `INSERT INTO exam_closure_summary 
                            (exam_date, centre_code, serverno, closure_action, closure_status, added_on, ip_address) 
                            VALUES ('2024-09-05', ?, 'a', 'Sync Process Data', 'I', NOW(), ?)`;
          await queryAsync(insertExamSummaryQuery, [centreCode, hostIp]);

          //LAS // Zip all files starting with "feedbatch_"
          const zipClosureFileName = `hybrid_sifyiibf_${serialNumber}_a_${new Date()
            .toISOString()
            .replace(/[:-]/g, "")
            .replace(/\.\d+Z$/, "")}_Closure_All_Feed.zip`;
          const closureZipFilePath = path.join(
            "C:\\pro\\itest\\feed",
            zipClosureFileName
          );

          const feedFiles = fs
            .readdirSync("C:\\pro\\itest\\feed")
            .filter(
              (file) => file.startsWith("feedbatch_") && file.endsWith(".zip")
            );

          console.log("final feed", feedFiles);
          await zipFiles(feedFiles, closureZipFilePath);

          if (fs.existsSync(closureZipFilePath)) {
            const form = new FormData();
            form.append("feedFile", fs.createReadStream(closureZipFilePath));

            const { default: fetch } = await import("node-fetch");
            const response = await fetch(
              "https://demo70.sifyitest.com/livedata/upload.php",
              {
                method: "POST",
                body: form,
                headers: form.getHeaders(),
              }
            );

            if (!response.ok) {
              const responseBody = await response.text();
              throw new Error(
                `Failed to send zip file ${zipClosureFileName}. Status: ${response.status}, Response: ${responseBody}`
              );
            }

            console.log(`File ${zipClosureFileName} sent successfully.`);

            // Update `exam_closure_summary` to 'U'
            const updateExamSummaryQuery = `UPDATE exam_closure_summary SET file_path= ?, closure_status = 'U' WHERE closure_action = 'Sync Process Data' AND centre_code = ?`;
            await queryAsync(updateExamSummaryQuery, [
              zipClosureFileName,
              centreCode,
            ]);
            const exportDump = exportTablesAsDump(centreCode, serialNumber);
            console.log("exportDump status", exportDump);
            if (exportDump) {
              res.status(200).json({
                message:
                  "Batch closure processed successfully with files merged, zipped, sent, and status updated",
                incompleteCandidatesCount: 0,
                zipFileName: zipClosureFileName,
              });
            } else {
              console.log(`Dump not generated.`);
              res.status(500).json({ error: "Dump not generated" });
            }
          } else {
            console.log(`File ${zipClosureFileName} does not exist.`);
            res
              .status(500)
              .json({ error: "Merged closure file does not exist" });
          }
        } else {
          console.log(`File ${zipFileName} does not exist.`);
          res.status(500).json({ error: "Merged file does not exist" });
        }
      }
    } catch (err) {
      console.error("Error retrieving incomplete candidates:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

function generateScoreForCandidate(
  questionPaperNo,
  membershipNo,
  examCode,
  subjectCode,
  passMark,
  roundoff_score,
  graceMark,
  timeTaken,
  auto_submit,
  callback
) {
  console.log("Generating score for candidate:", membershipNo);

  if (typeof callback !== "function") {
    console.error("Callback is not a function");
    return;
  }

  const posScoreQuery = `
        SELECT SUM(A.marks) AS posscore
        FROM iib_sq_details A
        LEFT JOIN iib_response B ON A.question_id = B.question_id
        WHERE B.question_paper_no = ?
          AND B.id IN (SELECT MAX(id) FROM iib_response WHERE question_paper_no = ? GROUP BY question_id)
          AND A.correct_answer = B.answer
          AND B.answer != ''
    `;

  db.query(
    posScoreQuery,
    [questionPaperNo, questionPaperNo],
    (err, rowsPosScore) => {
      if (err) {
        console.error("Error calculating positive score:", err);
        return callback(err);
      }

      const posscore = rowsPosScore[0]?.posscore || 0;
      console.log("Positive score:", posscore);

      const negScoreQuery = `
            SELECT SUM(A.negative_marks) AS negscore
            FROM iib_sq_details A
            LEFT JOIN iib_response B ON A.question_id = B.question_id
            WHERE B.question_paper_no = ?
              AND B.id IN (SELECT MAX(id) FROM iib_response WHERE question_paper_no = ? GROUP BY question_id)
              AND A.correct_answer != B.answer
              AND B.answer != ''
        `;

      db.query(
        negScoreQuery,
        [questionPaperNo, questionPaperNo],
        (err, rowsNegScore) => {
          if (err) {
            console.error("Error calculating negative score:", err);
            return callback(err);
          }

          const negscore = rowsNegScore[0]?.negscore || 0;
          console.log("Negative score:", negscore);

          let score = posscore - negscore;
          if (score < 0) score = 0;
          if (roundoff_score === "Y") score = Math.round(score);

          console.log(`Final score for candidate ${membershipNo}: ${score}`);

          const examResult = score + graceMark >= passMark ? "P" : "F";

          const scoreCheckQuery = `
                SELECT COUNT(1) AS cnt_score_chk
                FROM iib_candidate_scores
                WHERE membership_no = ? AND exam_code = ? AND subject_code = ?
            `;

          db.query(
            scoreCheckQuery,
            [membershipNo, examCode, subjectCode],
            (err, rowsScoreCheck) => {
              if (err) {
                console.error("Error checking existing scores:", err);
                return callback(err);
              }

              const cnt_score_chk = rowsScoreCheck[0]?.cnt_score_chk || 0;

              const insertOrUpdateScoreQuery =
                cnt_score_chk === 0
                  ? `INSERT INTO iib_candidate_scores (membership_no, exam_code, subject_code, score, exam_date, time_taken, result, auto_submit)
                     VALUES (?, ?, ?, ?, NOW(), ?, ?, ?)`
                  : `UPDATE iib_candidate_scores
                     SET score = ?, exam_date = NOW(), time_taken = ?, result = ?, auto_submit = ?
                     WHERE membership_no = ? AND exam_code = ? AND subject_code = ?`;

              const queryParams =
                cnt_score_chk === 0
                  ? [
                      membershipNo,
                      examCode,
                      subjectCode,
                      score,
                      timeTaken,
                      examResult,
                      auto_submit,
                    ]
                  : [
                      score,
                      timeTaken,
                      examResult,
                      auto_submit,
                      membershipNo,
                      examCode,
                      subjectCode,
                    ];

              db.query(insertOrUpdateScoreQuery, queryParams, (err) => {
                if (err) {
                  console.error("Error inserting/updating score:", err);
                  return callback(err);
                }
                console.log("Inserting score into xml_feed...");
                insertIntoXmlFeed(insertOrUpdateScoreQuery, (err) => {
                  if (err) {
                    console.error("Error inserting into xml_feed:", err);
                    return callback(err);
                  }

                  console.log(
                    `Score for candidate ${membershipNo} successfully processed and inserted into xml_feed`
                  );
                  callback(null, score);
                });
              });
            }
          );
        }
      );
    }
  );
}

app.get("/api/backup/:centrecode/:serialNumber", async (req, res) => {
  const { centrecode, serialNumber } = req.params;

  console.log("backupapi", centrecode[0], "--", serialNumber);
  try {
    // Call your backup function here, e.g., exportTablesAsDump
    await exportTablesAsDump(centrecode, serialNumber);

    // Send a success response
    res.status(200).json({ message: "Backup successful" });
  } catch (error) {
    // Send an error response in case of failure
    res.status(500).json({ error: "Backup failed" });
  }
});

// Route to handle candidate test insertion
app.post("/insert-candidate-test", (req, res) => {
  const {
    membership_no,
    exam_code,
    subject_code,
    question_paper_no,
    test_status,
    start_time,
    total_time,
    current_session,
    browser_status,
    host_ip,
    serverno,
  } = req.body;

  // Query to check if an entry with the same membership_no and question_paper_no already exists
  const checkQuery = `
        SELECT COUNT(*) AS count
        FROM iib_candidate_test
        WHERE membership_no = ? AND question_paper_no = ?
    `;

  db.query(checkQuery, [membership_no, question_paper_no], (err, results) => {
    if (err) {
      console.error("Error during SQL query execution:", {
        error: err.message,
        query: checkQuery,
        parameters: [membership_no, question_paper_no],
      });
      return res
        .status(500)
        .json({ error: "An error occurred while checking for existing data." });
    }

    const count = results[0].count;

    if (count > 0) {
      // Entry already exists
      res.json({ message: "Data already inserted successfully", results });
    } else {
      // Proceed to insert the data if no existing entry is found
      const insertQuery = `
                INSERT INTO iib_candidate_test (
                    membership_no,
                    exam_code,
                    subject_code,
                    question_paper_no,
                    test_status,
                    start_time,
                    total_time,
                    current_session,
                    browser_status,
                    host_ip,
                    serverno
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

      const formattedInsertQuery = db.format(insertQuery, [
        membership_no,
        exam_code,
        subject_code,
        question_paper_no,
        test_status,
        start_time,
        total_time,
        current_session,
        browser_status,
        host_ip,
        serverno,
      ]);

      db.query(formattedInsertQuery, (err, results) => {
        if (err) {
          console.error("Error during SQL query execution:", {
            error: err.message,
            query: formattedInsertQuery,
          });
          return res
            .status(500)
            .json({ error: "An error occurred while inserting data." });
        }

        // After a successful insertion, log the query into xml_feed
        insertIntoXmlFeed(formattedInsertQuery, (err) => {
          if (err) {
            console.error("Error inserting into xml_feed:", err);
            return res
              .status(500)
              .json({ error: "An error occurred while logging the query." });
          }

          res.json({
            message: "Data inserted successfully and query logged",
            results,
          });
        });
      });
    }
  });
});

app.get("/check-table", (req, res) => {
  const tableName = req.query.tableName;

  // Use a raw query to count the number of rows in the table
  const query = `SELECT COUNT(*) AS count FROM ${tableName}`;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Assuming that the table exists if the query doesn't throw an error
    const tableExists = results[0].count; // If the table has rows, this works; otherwise, it should return 0 but still means the table exists
    res.json({ exists: tableExists });
  });
});

app.post("/log-internet-speed", (req, res) => {
  const { status, level } = req.body;

  // Get the current date and timestamp
  const date = new Date();
  const formattedDate = date.toISOString().slice(0, 10); // Format: YYYY-MM-DD
  const timestamp = date.toISOString().slice(11, 19).replace(/:/g, ""); // Format: HHMMSS

  // Log directory and file paths
  const logDir = "C:\\pro\\itest\\log";
  const logFile = path.join(logDir, `internetspeed-${formattedDate}.txt`);

  // Backup directory (named after the current date)
  const backupDir = path.join(logDir, formattedDate);
  const backupFile = path.join(
    backupDir,
    `internetspeed-${formattedDate}-${timestamp}.txt`
  );

  // Ensure log and backup directories exist
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Helper function to append log entry
  const appendLogEntry = (logPath, status, level) => {
    const logEntry = `[${new Date().toLocaleTimeString()}] Internet Status: ${status}, Speed Level: ${level}\n`;
    return new Promise((resolve, reject) => {
      fs.appendFile(logPath, logEntry, (err) => {
        if (err) {
          return reject("Error writing to log file.");
        }
        resolve();
      });
    });
  };

  // Helper function to move log file to backup folder
  const backupLogFile = (currentLogPath) => {
    return new Promise((resolve, reject) => {
      fs.rename(currentLogPath, backupFile, (err) => {
        if (err) {
          return reject("Error moving log file to backup folder.");
        }
        console.log("Backup created:", backupFile);
        resolve();
      });
    });
  };

  // Main logic
  if (status === "Off") {
    if (fs.existsSync(logFile)) {
      // Append log entry and create backup
      appendLogEntry(logFile, status, level)
        .then(() => backupLogFile(logFile))
        .then(() => {
          // Create a new log file
          fs.writeFile(logFile, "", (err) => {
            if (err) {
              console.error("Error creating new log file:", err);
              return res.status(500).send("Error creating new log file.");
            }
            res.send("Internet speed logged and backup created successfully.");
          });
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send(err);
        });
    } else {
      // Log the entry if no file exists
      appendLogEntry(logFile, status, level)
        .then(() => res.send("Internet speed logged successfully."))
        .catch((err) => {
          console.error(err);
          res.status(500).send(err);
        });
    }
  } else {
    // Log for status 'On'
    appendLogEntry(logFile, status, level)
      .then(() => res.send("Internet speed logged successfully."))
      .catch((err) => {
        console.error(err);
        res.status(500).send(err);
      });
  }
});

// API to check if "Slow" is logged 10 times consecutively
app.get("/api/check-speed", (req, res) => {
  // Get the current date
  const date = new Date();
  const formattedDate = date.toISOString().slice(0, 10); // Format: YYYY-MM-DD

  // Log file path
  const logFilePath = path.join(
    "C:\\pro\\itest\\log",
    `internetspeed-${formattedDate}.txt`
  );

  // Check if file exists
  if (fs.existsSync(logFilePath)) {
    checkConsecutiveFlag(logFilePath, (err, isConsecutive) => {
      if (err) {
        return res.status(500).send("Error reading log file.");
      }

      // Return JSON response
      if (isConsecutive) {
        return res.json({ mediumCount: 10 });
      } else {
        return res.json({ mediumCount: 0 });
      }
    });
  } else {
    res.status(404).send("Log file not found.");
  }
});
// Shutdown endpoint
app.post("/shutdown", (req, res) => {
  console.log("Shutdown endpoint triggered");
  exec("shutdown /s /t 0", (error, stdout, stderr) => {
    // Adjust command for your OS
    if (error) {
      console.error(`Error: ${error.message}`);
      return res
        .status(500)
        .send(`Failed to shut down the system. Error: ${error.message}`);
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return res
        .status(500)
        .send(`Failed to shut down the system. Stderr: ${stderr}`);
    }
    console.log(`Shutdown initiated: ${stdout}`);
    res.send("Shutdown initiated successfully.");
  });
});

app.post("/restart", (req, res) => {
  // Command to restart the system
  exec("shutdown /r /t 0", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error restarting the system: ${error.message}`);
      return res.status(500).send("Failed to restart the system.");
    }

    console.log("System restart initiated:", stdout);
    res.send("System is restarting...");
  });
});

function insertIntoXmlFeed(query, callback) {
  const finalquery = query + ";";
  const insertFeedSql = "INSERT INTO xml_feed (query) VALUES (?)";
  db.query(insertFeedSql, [finalquery], (err, result) => {
    if (err) {
      console.error("Error inserting into xml_feed:", err);
      return callback(err);
    }
    callback(null, result);
  });
}

// Function to convert the query to base64 and write it to a file
function processXmlFeed() {
  // Query to get all records with status 'N'
  const selectQuery = `SELECT id, query FROM xml_feed WHERE status = 'N'`;

  db.query(selectQuery, (err, rows) => {
    if (err) {
      console.error("Error fetching xml_feed data:", err);
      return;
    }

    if (rows.length > 0) {
      // Create a variable to accumulate all base64 queries
      let combinedBase64Queries = "";
      let startId = rows[0].id; // Start ID from the first record
      let endId = rows[rows.length - 1].id; // End ID from the last record

      rows.forEach((row) => {
        // Convert query to base64
        const base64Query = Buffer.from(row.query).toString("base64");
        combinedBase64Queries += base64Query + "\n"; // Add newline for separation
      });

      // Get the next file name incrementally
      const files = fs
        .readdirSync(feedDir)
        .filter((file) => file.startsWith("feed_") && file.endsWith(".txt"));
      const nextFileNumber = files.length + 1;
      const fileName = `feed_${nextFileNumber}.txt`;

      // Write all base64 queries to a single file
      fs.writeFileSync(
        path.join(feedDir, fileName),
        combinedBase64Queries,
        "utf8"
      );

      // Insert record into feed_filenames table
      const insertQuery = `INSERT INTO feed_filenames (filename, start_id, end_id, status) VALUES (?, ?, ?, 'N')`;
      db.query(insertQuery, [fileName, startId, endId], (err) => {
        if (err) {
          console.error("Error inserting into feed_filenames:", err);
        }
      });

      // Update the status to 'Y' for all processed records
      const updateQuery = `UPDATE xml_feed SET status = 'Y' WHERE status = 'N'`;
      db.query(updateQuery, (err) => {
        if (err) {
          console.error("Error updating xml_feed status:", err);
        }
      });
    } else {
      console.log("No records found with status N.");
    }
  });
}

// Function to merge files and create a zip

async function mergeAndZipFiles(centreCode, serialNumber) {
  return new Promise((resolve, reject) => {
    try {
      // 1. Merge files into one
      const mergedFileName = `feedbatch_${centreCode}_a_${serialNumber}_${new Date()
        .toISOString()
        .replace(/[-T:.Z]/g, "")}.txt`;
      const mergedFilePath = path.join(feedDir, mergedFileName);
      const filesToMerge = fs
        .readdirSync(feedDir)
        .filter((file) => file.endsWith(".txt"));

      const writeStream = fs.createWriteStream(mergedFilePath);

      writeStream.on("finish", () => {
        console.log(`Merged files into: ${mergedFileName}`);

        // 2. Zip the merged file
        const zipFileName = `${path.basename(mergedFileName, ".txt")}.zip`; // Ensure .zip extension
        const zipFilePath = path.join(feedDir, zipFileName);
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver("zip", { zlib: { level: 9 } });

        output.on("close", function () {
          console.log(
            `Zip file created: ${zipFileName} (${archive.pointer()} total bytes)`
          );
          resolve(zipFileName); // Pass the zip file name to the API
        });

        archive.on("error", function (err) {
          reject(err); // Handle errors
        });

        archive.pipe(output);
        archive.append(fs.createReadStream(mergedFilePath), {
          name: path.basename(mergedFileName),
        });
        archive.finalize();
      });

      writeStream.on("error", (err) => {
        reject(err); // Handle errors
      });

      // Merge files into the write stream
      (async () => {
        for (const file of filesToMerge) {
          const fileContent = fs.readFileSync(
            path.join(feedDir, file),
            "utf-8"
          );
          writeStream.write(fileContent + "\n");
        }
        writeStream.end(); // Close the stream after writing
      })();
    } catch (error) {
      reject(error); // Catch any synchronous errors
    }
  });
}

// Function to check the log file for consecutive "Slow" entries
async function checkConsecutiveFlag(logFilePath, callback) {
  fs.readFile(logFilePath, "utf8", (err, data) => {
    if (err) {
      return callback(err, null);
    }

    // Split the log file into lines
    const logLines = data.split("\n").filter((line) => line.trim() !== "");

    let slowCount = 0;
    for (let i = logLines.length - 1; i >= 0; i--) {
      const line = logLines[i];

      // Check if the log line contains "Speed Level: Slow"
      if (line.includes("Speed Level: Slow")) {
        slowCount++;
        if (slowCount === 10) {
          return callback(null, true); // Found 10 consecutive "Slow"
        }
      } else {
        slowCount = 0; // Reset count if it's not "Slow"
      }
    }

    // If the loop finishes and we don't have 10 consecutive, return false
    return callback(null, false);
  });
}

async function processAndSendFile() {
  try {
    // Query to get all filenames with status 'N'
    const selectQuery = `SELECT id, filename FROM feed_filenames WHERE status = 'N'`;

    db.query(selectQuery, async (err, rows) => {
      if (err) {
        console.error("Error fetching feed_filenames data:", err);
        return;
      }

      if (rows.length > 0) {
        // Import fetch dynamically
        const { default: fetch } = await import("node-fetch");

        for (const fileRecord of rows) {
          const fileName = fileRecord.filename;
          const filePath = path.join(feedDir, fileName);

          if (fs.existsSync(filePath)) {
            const form = new FormData();
            form.append("feedFile", fs.createReadStream(filePath));
            console.log("filename", filePath);

            try {
              const response = await fetch(
                "https://demo70.sifyitest.com/livedata/upload.php",
                {
                  method: "POST",
                  body: form,
                  headers: form.getHeaders(),
                }
              );

              if (!response.ok) {
                const responseBody = await response.text();
                throw new Error(
                  `Failed to send file ${fileName}. Status: ${response.status}, Response: ${responseBody}`
                );
              }

              console.log(`File ${fileName} sent successfully.`);

              // Update the status to 'Y' for the processed record
              const updateQuery = `UPDATE feed_filenames SET status = 'Y' WHERE id = ?`;
              db.query(updateQuery, [fileRecord.id], (err) => {
                if (err) {
                  console.error("Error updating feed_filenames status:", err);
                }
              });
            } catch (error) {
              console.error("Error sending file:", error);
            }
          } else {
            console.log(`File ${fileName} does not exist.`);
          }
        }
      } else {
        console.log("No records found with status N.");
      }
    });
  } catch (error) {
    console.error("Error processing and sending files:", error);
  }
}

// Schedule the task to run every 5 minutes
cron.schedule("*/1 * * * *", () => {
  console.log("Running the processAndSendFile task");
  processAndSendFile();
});

const zipFiles = (files, outputZipPath) => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputZipPath);
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Compression level
    });

    output.on("close", () => {
      console.log(
        `Zip file created: ${outputZipPath} (${archive.pointer()} total bytes)`
      );
      resolve();
    });

    archive.on("error", (err) => {
      reject(err);
    });

    archive.pipe(output);

    // Append each file to the archive
    files.forEach((file) => {
      const filePath = path.join("C:\\pro\\itest\\feed", file);
      archive.file(filePath, { name: file });
    });

    archive.finalize();
  });
};

// Function to export tables and store them as a .dmp file
const exportTablesAsDump = async (centreCode, serialNumber) => {
  try {
    const currentDate = formatDateTimeStamp();

    const dumpFileName = `${client}_${centreCode}_a_${currentDate}_${serialNumber}.dmp`;
    const dumpFilePath = path.join(
      "C:",
      "pro",
      "itest",
      "Closure",
      dumpFileName
    ); // Change to .dmp if necessary
    // console.log('start export dump',dumpFilePath);
    // Check if the directory exists, if not, create it
    const folderPath = path.join("C:", "pro", "itest", "Closure");
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Perform the dump using environment variables from the connection config
    await mysqldump({
      connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      },
      dumpToFile: dumpFilePath,
      tables: tablesToExport, // Specify the tables to export
    });

    console.log(`Dump file successfully created at: ${dumpFilePath}`);

    const form = new FormData();
    form.append("feedFile", fs.createReadStream(dumpFilePath));

    const { default: fetch } = await import("node-fetch");
    const response = await fetch(
      "https://demo70.sifyitest.com/livedata/upload.php",
      {
        method: "POST",
        body: form,
        headers: form.getHeaders(),
      }
    );

    if (!response.ok) {
      const responseBody = await response.text();
      throw new Error(
        `Failed to send dump file ${dumpFileName}. Status: ${response.status}, Response: ${responseBody}`
      );
      return false;
    } else {
      return true;
    }
  } catch (error) {
    console.error("Error exporting tables:", error);
    return false;
  }
};

// Schedule the task to run every 5 minutes
cron.schedule("*/1 * * * *", () => {
  console.log("Running the processXmlFeed task");
  processXmlFeed();
});

app.get("/attendance-report/:reportid", (req, res) => {
  const reportid = req.params.reportid; // Get exam date from request parameters
  console.log(reportid);
  const sql_examDate = `SELECT exam_date FROM iib_exam_schedule LIMIT 1`;

  // Execute the query to get exam date
  db.query(sql_examDate, (error, results) => {
    if (error) {
      console.error("Database query error:", error);
      return res.status(500).send("Error fetching exam date.");
    }

    // Check if results are returned
    if (results.length === 0) {
      return res.status(404).send("No exam date found.");
    }

    const examDate = results[0].exam_date; // Use the exam date from the database

    // Ensure the exam date from parameters is valid
    if (!examDate) {
      return res.status(400).send("Exam date is required.");
    }

    const sql = `
        SELECT exam_time, count(1) as cnt 
        FROM iib_candidate_iway 
        WHERE exam_date = ?
        GROUP BY exam_date, exam_time
      `;

    // Execute the main query for attendance report
    db.query(sql, [examDate], (error, results) => {
      if (error) {
        return res.status(500).send("Error fetching attendance report.");
      }

      const attendanceReport = [];
      let completedQueries = 0;

      results.forEach((row) => {
        const { exam_time, cnt } = row;

        // Query for incomplete count
        const sqlIncomplete = `
            SELECT count(1) as incompleteCount 
            FROM iib_candidate_iway a
            JOIN iib_candidate_test b ON a.membership_no = b.membership_no 
            WHERE b.test_status='IC' 
            AND current_session='Y' 
            AND a.exam_code = b.exam_code 
            AND a.subject_code = b.subject_code 
            AND a.exam_date = ? 
            AND a.exam_time = ?
          `;

        db.query(
          sqlIncomplete,
          [examDate, exam_time],
          (error, resIncomplete) => {
            const incompleteCount = resIncomplete.length
              ? resIncomplete[0].incompleteCount
              : 0;

            // Query for complete count
            const sqlAttended = `
              SELECT count(1) as completeCount 
              FROM iib_candidate_iway a
              JOIN iib_candidate_scores b ON a.membership_no = b.membership_no 
              WHERE a.exam_code = b.exam_code 
              AND a.subject_code = b.subject_code 
              AND a.exam_date = ? 
              AND a.exam_time = ?
            `;

            db.query(
              sqlAttended,
              [examDate, exam_time],
              (error, resAttended) => {
                const completeCount = resAttended.length
                  ? resAttended[0].completeCount
                  : 0;

                const totalAttempted = incompleteCount + completeCount;

                // Add to the attendance report
                attendanceReport.push({
                  exam_date: examDate,
                  exam_time,
                  total_candidates: cnt,
                  total_attempted: totalAttempted,
                  incomplete: incompleteCount,
                  complete: completeCount,
                });

                completedQueries++;

                // Send response once all queries are done
                if (completedQueries === results.length) {
                  res.json(attendanceReport);
                }
              }
            );
          }
        );
      });

      // Handle case where results.length is zero immediately
      if (results.length === 0) {
        res.json(attendanceReport);
      }
    });
  });
});

function formatDate_db(dateString) {
  const localDate = new Date(dateString);
  const offset = localDate.getTimezoneOffset() * 60000; // offset in milliseconds
  const utcDate = new Date(localDate.getTime() - offset);
  return utcDate.toISOString().split("T")[0];
}

app.get("/incomplete-status-report/:reportid", (req, res) => {
  const reportid = req.params.reportid; // Get report ID from request parameters

  const sql_examDate = `SELECT exam_date FROM iib_exam_schedule LIMIT 1`;
  // console.log(sql_examDate);
  // Execute the query to get the exam date
  db.query(sql_examDate, (error, results) => {
    if (error) {
      console.error("Database query error:", error);
      return res.status(500).send("Error fetching exam date.");
    }

    // Check if results are returned
    if (results.length === 0) {
      return res.status(404).send("No exam date found.");
    }

    console.log("SQL Query:", sql_examDate);

    const examDate = formatDate_db(results[0].exam_date); // Use the exam date from the database

    // const examDate = "2024-09-16"; // Use the exam date from the database

    // Prepare the date range for the query
    const examDate1 = `${examDate} 00:00:00`;
    const examDate2 = `${examDate} 23:59:59`;

    const sql = `
            SELECT a.membership_no, a.exam_code, a.subject_code, DATE_FORMAT(a.start_time, '%T') AS start_time_mod
            FROM iib_candidate_test a 
            LEFT JOIN iib_candidate_scores b ON a.membership_no = b.membership_no 
            AND a.exam_code = b.exam_code AND a.subject_code = b.subject_code 
            WHERE b.subject_code IS NULL AND a.start_time BETWEEN ? AND ? 
            GROUP BY a.membership_no, a.exam_code, a.subject_code
        `;

    console.log("Start Date:", examDate1); // Log the SQL query for debugging
    console.log("End Date:", examDate2); // Log the SQL query for debugging

    // Execute the main query to fetch incomplete status report
    db.query(sql, [examDate1, examDate2], (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        return res.status(500).send("Error fetching incomplete status report.");
      }

      // Prepare the attendance report
      const incompletestatusReport = results.map((row) => ({
        membership_no: row.membership_no,
        exam_code: row.exam_code,
        subject_code: row.subject_code,
        start_time_mod: row.start_time_mod,
      }));

      console.log("Incomplete Status Report:", results); // Log the report for debugging
      // console.log(sql);
      // Send the response with the attendance report
      res.json(incompletestatusReport);
    });
  });
});

app.get("/exam-dropdown", (req, res) => {
  const q =
    "select trim(b.exam_code) exam_code ,trim(b.exam_name) exam_name from iib_exam_subjects a, iib_exam b where a.exam_code=b.exam_code group by a.exam_code order by b.exam_code ";
  db.query(q, (err, rows) => {
    if (err) {
      console.error("Error querying the database:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    if (rows.length > 0) {
      const result = rows.map((row) => ({
        exam_code: row.exam_code.toString(), // Convert buffer to string
        exam_name: row.exam_name,
      }));
      return res.json(result);
    }
  });
});

app.get("/exam-time-dropdown", (req, res) => {
  const q =
    "SELECT distinct(exam_time) as exam_time FROM iib_candidate_iway order by exam_time";
  let exam_time = [];
  db.query(q, (err, rows) => {
    if (err) {
      console.error("Error querying the database:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    if (rows.length > 0) {
      rows.forEach((row) => {
        exam_time.push(row.exam_time.toString()); // Convert buffer to string
      });
      return res.json(exam_time);
    }
  });
});

app.get("/subject-dropdown/:exam", (req, res) => {
  const { exam } = req.params;
  const q =
    "select trim(subject_code) as subject_code, trim(subject_name) as subject_name, subject_duration from iib_exam_subjects where exam_code = ? order by subject_code";
  db.query(q, [exam], (err, rows) => {
    if (err) {
      console.error("Error querying the database:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    if (rows.length > 0) {
      const result = rows.map((row) => ({
        subject_code: row.subject_code.toString(), // Convert buffer to string
        subject_name: row.subject_name,
        subject_duration: row.subject_duration,
      }));
      return res.json(result);
    }
  });
});

app.get("/rollno-dropdown/:exam/:subject_code", (req, res) => {
  const { exam, subject_code } = req.params;
  const q =
    "SELECT distinct membership_no from iib_candidate_test where exam_code = ? and subject_code = ?";
  db.query(q, [exam, subject_code], (err, rows) => {
    if (err) {
      console.error("Error querying the database:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    if (rows.length > 0) {
      const result = rows.map((row) => ({
        //   subject_code: row.subject_code.toString(), // Convert buffer to string
        membership_no: row.membership_no,
      }));
      return res.json(result);
    }
  });
});

app.post("/process-exam-data", async (req, res) => {
  const {
    submitted,
    examDate,
    Exam_Code,
    Subject_code,
    memno,
    filter_by_idle_time,
  } = req.body;

  if (
    submitted &&
    examDate &&
    Exam_Code &&
    Subject_code &&
    memno &&
    filter_by_idle_time
  ) {
    const examCodeValue = Array.isArray(Exam_Code)
      ? Exam_Code[0].exam_code
      : Exam_Code.exam_code;
    const subjectCodeValue = Array.isArray(Subject_code)
      ? Subject_code[0].subject_code
      : Subject_code.subject_code;

    try {
      // Get time extended for each membership number
      const q = `
        SELECT membership_no, SUM(time_extended) AS time_extended 
        FROM iib_candidate_test 
        WHERE exam_code = ? AND subject_code = ? 
        GROUP BY membership_no`;

      // Query to fetch time extensions
      const timeExtendResults = await new Promise((resolve, reject) => {
        db.query(q, [examCodeValue, subjectCodeValue], (err, rows) => {
          if (err) {
            console.error("Error querying the database:", err);
            return reject(err);
          }
          resolve(rows);
        });
      });

      console.log("Query Result:", timeExtendResults);
      if (!Array.isArray(timeExtendResults) || timeExtendResults.length === 0) {
        console.error("No results for time extensions:", timeExtendResults);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      const arrTimeextend = {};
      // const time_extended=0;
      // Initialize arrTimeextend for each membership_no
      const timeExtensions = [];

      // Loop through the timeExtendResults to collect time extensions
      for (const row of timeExtendResults) {
        const convertedTime = convertHrs(row.time_extended || 0); // Convert the time
        timeExtensions.push(convertedTime); // Add the converted time to the array
      }

      // Log the resulting array of time extensions
      // console.log('Time Extensions:', timeExtensions[0]);

      // for (const row of timeExtendResults) {
      //   const membershipNo = row.membership_no; // Assuming membership_no is a string like 'DRUN000001'
      //   const timeExtended = convertHrs(row.time_extended || 0); // Handle undefined case
      //   arrTimeextend[membershipNo] = timeExtended; // Assigning the converted time to the corresponding membership_no
      // }

      // console.log('Time Extended Array:', arrTimeextend);

      const mainArray = [];

      // Process each membership number
      for (const membershipNo of memno) {
        const membershipNoValue = membershipNo[0].membership_no;

        // Fetch test data for each membership number
        const timeResults = await new Promise((resolve, reject) => {
          db.query(
            `SELECT start_time, last_updated_time, 
                    TIME_TO_SEC(DATE_FORMAT(last_updated_time, '%T')) - TIME_TO_SEC(DATE_FORMAT(start_time, '%T')) AS duration,
                    test_status, question_paper_no, total_time 
             FROM iib_candidate_test 
             WHERE membership_no = ? AND exam_code = ? AND subject_code = ? 
             ORDER BY last_updated_time ASC`,
            [membershipNoValue, examCodeValue, subjectCodeValue],
            (error, results) => {
              if (error) {
                console.error("Database query error:", error);
                return reject(error);
              }
              resolve(results);
            }
          );
        });

        console.log(
          "Input Values:",
          membershipNoValue,
          examCodeValue,
          subjectCodeValue
        );
        console.log("Query Results:", timeResults);
        const responselength = 0;
        if (timeResults.length > 0) {
          let dur = 0;
          const candidateData = { mem_no: membershipNoValue, Time: [] };
          const arrayResponse = [];
          const array_timelog = [];
          for (const row of timeResults) {
            const {
              start_time,
              last_updated_time,
              duration,
              test_status,
              question_paper_no,
              total_time,
            } = row;

            // Fetch the total response count for each paper
            const totalResponseCount = await getResponseCount(
              question_paper_no,
              start_time,
              last_updated_time
            );
            console.log("Count", totalResponseCount);
            candidateData.total_response_count = totalResponseCount;
            candidateData.Time.push({
              start_time,
              last_updated_time,
              client_time: total_time,
              // total_response_count: totalResponseCount,
            });

            dur += duration;

            // Fetch responses for the question paper
            const responseResults = await new Promise((resolve, reject) => {
              db.query(
                `SELECT id, updatedtime, clienttime 
                 FROM iib_response 
                 WHERE question_paper_no = ? 
                 ORDER BY id`,
                [question_paper_no],
                (error, results) => {
                  if (error) return reject(error);
                  resolve(results);
                }
              );
            });

            // Process responses and calculate justification
            // const responselength = responseResults.length
            for (let loop = 0; loop < responseResults.length; loop++) {
              const { id, updatedtime, clienttime } = responseResults[loop];
              arrayResponse.push({
                response_id: id,
                response_time: updatedtime,
                response_client_time: clienttime,
                response_justification:
                  loop > 0
                    ? arrayResponse[loop - 1].response_client_time - clienttime
                    : candidateData.Time[0].client_time - clienttime,
              });
            }
            // Fetch time logs (previously in PHP)
            const timeLogResults = await db.query(
              `SELECT id, servertime, clienttime 
     FROM timelog 
     WHERE questionpaperno = ? 
       AND membership_no = ? 
     ORDER BY id`,
              [question_paper_no, memno]
            );

            // Initialize the array to store time logs

            // Process and push time logs into array_timelog
            for (let loop = 0; loop < timeLogResults.length; loop++) {
              const { id, servertime, clienttime } = timeLogResults[loop];

              array_timelog.push({
                timelog_id: id,
                timelog_time: servertime,
                timelog_client_time: clienttime,
              });
            }
          }

          candidateData.start_time = timeResults[0].start_time;
          candidateData.last_updated_time = timeResults[0].last_updated_time;
          candidateData.time_extended = timeExtensions[0];
          candidateData.duration = convertTime(dur);
          // candidateData.timeextended = arrTimeextend[membershipNo] || '--';
          candidateData.test_status =
            timeResults[0].test_status === "C" ? "Completed" : "Incomplete";
          candidateData.responses = arrayResponse;
          candidateData.timelogresponses = array_timelog;

          mainArray.push(candidateData);
        }
      }

      console.log("Final Processed Data:", mainArray);
      return res.json({ success: true, data_value: mainArray });
    } catch (error) {
      console.error("Error processing data:", error);
      return res
        .status(500)
        .json({ success: false, message: "Error processing data" });
    }
  } else {
    return res
      .status(400)
      .json({ success: false, message: "Invalid input data" });
  }
});

const convertHrs = (durationVal) => {
  let dispTimeHrs = Math.floor(durationVal / 3600);
  let dispTimeMin;

  if (durationVal % 3600 === 0) {
    dispTimeHrs = durationVal / 3600;
    dispTimeMin = "00";
  } else {
    dispTimeMin = Math.floor((durationVal % 3600) / 60);
    if (dispTimeMin === 60) {
      dispTimeHrs += 1;
      dispTimeMin = "00";
    }
  }

  return `${dispTimeHrs}:${String(dispTimeMin).padStart(2, "0")}`;
};

// Function to convert seconds into HH:MM:SS format
const convertTime = (seconds) => {
  const t = Math.round(seconds);
  const hours = Math.floor(t / 3600);
  const minutes = Math.floor((t / 60) % 60);
  const secs = t % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(secs).padStart(2, "0")}`;
};

// Function to get the count of responses based on question paper number and time range
const getResponseCount = async (questionPno, startTime, endTime) => {
  const query = `
    SELECT COUNT(1) AS responseCount
    FROM iib_response 
    WHERE question_paper_no = ? AND updatedtime >= ? AND updatedtime <= ?
  `;

  return new Promise((resolve, reject) => {
    db.query(query, [questionPno, startTime, endTime], (error, results) => {
      if (error) return reject(error);
      resolve(results[0].responseCount); // Access the count from the result
    });
  });
};

app.get("/get-centercode", (req, res) => {
  const q = "SELECT center_code, serverno FROM autofeed";

  db.query(q, (err, rows) => {
    if (err) {
      console.error("Error querying the database:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    if (rows.length > 0) {
      const result = rows.map((row) => ({
        center_code: row.center_code,
        serverno: row.serverno,
      }));
      res.json(result);
    } else {
      res.status(404).json({ message: "No data found" });
    }
  });
});

app.get("/qp-files", (req, res) => {
  const query = `SELECT download_sec, download_status, download_time FROM qp_download`;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length > 0) {
      const data = results.map((row) => {
        let download_sec_disp = row.download_sec;
        if (row.download_sec === "Base QP") download_sec_disp = "Base QP"; // Modify based on actual logic

        let status_final = "";
        switch (row.download_status) {
          case "D":
            status_final = "Success";
            break;
          case "DV":
            status_final =
              '<span style="color:red"><b>Verified Success</b></span>';
            break;
          case "U":
            status_final =
              '<span style="color:green"><b>Upload Success</b></span>';
            break;
          case "DC":
            status_final = '<span style="color:red"><b>Dump Crashed</b></span>';
            break;
          case "UF":
            status_final =
              '<span style="color:red"><b>Upload Failed</b></span>';
            break;
          case "NF":
            status_final = "File does not exist.";
            break;
          case "F":
            status_final = "Failed";
            break;
          default:
            status_final = "";
        }

        return {
          download_sec_disp,
          status_final,
          download_time: row.download_time,
        };
      });

      return res.json(data);
    } else {
      return res.json({ message: "QP not downloaded yet" });
    }
  });
});

const feed_path = "feed";

app.get("/feed-list", (req, res) => {
  fs.readdir(feed_path, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read feed directory" });
    }

    if (files.length === 0) {
      return res.json({ feed_count: 0, feed_list: [] });
    }

    const feed_list = files
      .map((file) => {
        const filePath = path.join(feed_path, file);
        const stats = fs.statSync(filePath); // Get the file stats
        const file_name_time = stats.mtime.toISOString(); // Get the modification time

        return { file_name: file, file_name_time, mtime: stats.mtime }; // Include `mtime` for sorting
      })
      .sort((a, b) => b.mtime - a.mtime); // Sort by modification time in descending order

    res.json({
      feed_count: files.length,
      feed_list: feed_list.map(({ file_name, file_name_time }) => ({
        file_name,
        file_name_time,
      })), // Return the file name and time without the `mtime`
    });
  });
});

app.get("/get-candidate-duration-report/", async (req, res) => {
  const { examCode, subjectCode } = req.query;
  const flag_result = {
    F: "Fail",
    P: "Pass",
    "--": "--",
  };
  // let GETSUBJECTSET={};
  const GETSUBJECTSET = await utils.getSubExamSet(subjectCode);
  // console.log(GETSUBJECTSET);
  const arrTimeextend = {};
  const arrQPCount = {};

  const getExamDate = "SELECT exam_date FROM iib_exam_schedule LIMIT 1";

  db.query(getExamDate, (err, result) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).send("Error fetching exam date.");
    }

    if (result.length === 0) {
      return res.status(404).send("No exam date found.");
    }

    const examDate = utils.formatExamDate(result[0].exam_date);
    const filename = `candidate_duration_(${examDate})_examcode_(${examCode})_subjcode_(${subjectCode})`;
    const subjectCodeDuration = async (subjectCode) => {
      return new Promise((resolve, reject) => {
        const query =
          "select subject_duration from iib_exam_subjects where exam_code = ? and subject_code = ?";
        db.query(query, [examCode, subjectCode], (err, res) => {
          if (err) {
            console.error(err);
            return reject(err);
          }
          return resolve(res[0].subject_duration);
        });
      });
    };
    let subject_duration;
    const getSubjectDuration = async () => {
      subject_duration = await subjectCodeDuration(subjectCode);
    };
    getSubjectDuration();
    if (!examDate) {
      return res.status(400).send("Exam date is required.");
    }

    const sql1 = `
    SELECT membership_no, SUM(time_extended) AS time_extended 
    FROM iib_candidate_test 
    WHERE exam_code = ? AND subject_code = ? 
    GROUP BY membership_no
    `;
    db.query(sql1, [examCode, subjectCode], (err, rows) => {
      if (err) {
        console.error("Error querying the database:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      rows.forEach((row) => {
        arrTimeextend[row.membership_no] = utils.convertHrs(row.time_extended);
      });

      const questionPaperNoQuery = `SELECT question_paper_no AS qpNo FROM iib_question_paper_details WHERE subject_code= ? GROUP BY question_paper_no`;

      db.query(questionPaperNoQuery, [subjectCode], (err, rows) => {
        if (err) {
          console.error("Error querying the database:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        const qpPromises = rows.map((row) => {
          const getAttemptedCountQuery = `
            SELECT question_paper_no, COUNT(id) AS attemptedcount 
            FROM iib_response 
            WHERE question_paper_no = ? 
              AND id IN (SELECT MAX(id) FROM iib_response WHERE question_paper_no = ? GROUP BY question_id) 
              AND answer != '' 
            GROUP BY question_paper_no
          `;

          return new Promise((resolve, reject) => {
            db.query(
              getAttemptedCountQuery,
              [row.qpNo, row.qpNo],
              (err, rows2) => {
                if (err) {
                  reject(err);
                } else {
                  rows2.forEach((row2) => {
                    arrQPCount[row2.question_paper_no] = row2.attemptedcount;
                  });
                  resolve();
                }
              }
            );
          });
        });

        Promise.all(qpPromises)
          .then(() => {
            const sqlMembershipNoQuery = `
              SELECT TRIM(membership_no) AS mem_no, UPPER(TRIM(centre_code)) AS centre_code 
              FROM iib_candidate_iway 
              WHERE exam_date = ? AND exam_code = ? AND subject_code = ?
            `;

            db.query(
              sqlMembershipNoQuery,
              [examDate, examCode, subjectCode],
              (err, rows3) => {
                if (err) {
                  console.error("Problem fetching membership list:", err);
                  return res
                    .status(500)
                    .json({ error: "Internal Server Error" });
                }

                const array_values_comp = [];
                const array_values_incomp = [];
                const array_values_absenties = [];
                let i = 0;

                const processMemberships = rows3.map((row3) => {
                  return new Promise((resolve, reject) => {
                    const sqlTimeQuery = `
                    SELECT TRIM(start_time) AS start_time, TRIM(last_updated_time) AS last_updated_time,
                      TIME_TO_SEC(DATE_FORMAT(TRIM(last_updated_time), '%T')) - TIME_TO_SEC(DATE_FORMAT(TRIM(start_time), '%T')) AS duration, 
                      TRIM(test_status) AS test_status, question_paper_no 
                    FROM iib_candidate_test 
                    WHERE membership_no = ? AND exam_code = ? AND subject_code = ? 
                    ORDER BY last_updated_time ASC
                  `;

                    db.query(
                      sqlTimeQuery,
                      [row3.mem_no, examCode, subjectCode],
                      (err, rows4) => {
                        if (err) {
                          reject(err);
                        } else {
                          const main_array = {};
                          main_array[row3.mem_no] = {
                            centre_code: row3.centre_code,
                          };

                          if (rows4.length > 0) {
                            let dur = 0;
                            let test_status = "";
                            let QPNO = "";

                            rows4.forEach(async (row, index) => {
                              // console.log(row.converted_last_update_time);
                              // console.log(row.converted_start_time);
                              const {
                                start_time,
                                last_updated_time: end_time,
                                duration,
                                test_status: status,
                                question_paper_no,
                              } = row;
                              dur += duration;
                              test_status = status;
                              QPNO = question_paper_no;
                              const total_response_count =
                                await utils.getResponseCount(
                                  row.question_paper_no,
                                  row.start_time,
                                  row.last_updated_time
                                );
                              // console.log(total_response_count);
                              if (!main_array[row3.mem_no].Time) {
                                main_array[row3.mem_no].Time = [];
                              }

                              main_array[row3.mem_no].Time.push({
                                start_time,
                                end_time,
                                total_response_count,
                              });
                            });
                            main_array[row3.mem_no].durationInSec = dur;
                            main_array[row3.mem_no].duration =
                              utils.convertHrs(dur);

                            if (test_status === "C") {
                              // Completed candidates logic
                              const sql_score = `
                            SELECT TRIM(score) AS score, TRIM(result) AS result 
                            FROM iib_candidate_scores 
                            WHERE membership_no = ? AND exam_code = ? AND subject_code = ?
                          `;

                              db.query(
                                sql_score,
                                [row3.mem_no, examCode, subjectCode],
                                (err, res_score) => {
                                  if (err) {
                                    reject(err);
                                  } else {
                                    let score = res_score[0]?.score || "--";
                                    let result = res_score[0]?.result || "--";
                                    result = flag_result[result] || result;
                                    main_array[row3.mem_no].mem_no =
                                      row3.mem_no;
                                    main_array[row3.mem_no].score = score;
                                    main_array[row3.mem_no].result = result;
                                    main_array[row3.mem_no].timeextended =
                                      arrTimeextend[row3.mem_no] || "--";
                                    main_array[row3.mem_no].attemptqpcount =
                                      arrQPCount[QPNO] || 0;

                                    array_values_comp.push(
                                      main_array[row3.mem_no]
                                    );
                                    resolve();
                                  }
                                }
                              );
                            } else {
                              // Incomplete candidates logic
                              main_array[row3.mem_no].mem_no = row3.mem_no;
                              main_array[row3.mem_no].score = "--";
                              main_array[row3.mem_no].result = "--";
                              main_array[row3.mem_no].timeextended =
                                arrTimeextend[row3.mem_no] || "--";
                              main_array[row3.mem_no].attemptqpcount =
                                arrQPCount[QPNO] || 0;
                              array_values_incomp.push(main_array[row3.mem_no]);
                              resolve();
                            }
                          } else {
                            // Absent candidates logic
                            const absentData = {
                              mem_no: row3.mem_no,
                              centre_code: row3.centre_code,
                              Time: [
                                {
                                  start_time: "--",
                                  end_time: "--",
                                  total_response_count: "0",
                                },
                              ],
                              duration: "--",
                              score: "--",
                              result: "--",
                              timeextended: "--",
                              attemptqpcount: "--",
                            };
                            array_values_absenties.push(absentData);
                            resolve();
                          }
                        }
                      }
                    );
                  });
                });

                Promise.all(processMemberships)
                  .then(() => {
                    const count_scheduledcandidate =
                      array_values_absenties.length +
                      array_values_incomp.length +
                      array_values_comp.length;
                    const count_compcandidate = array_values_comp.length;
                    const count_incompcandidate = array_values_incomp.length;
                    const count_abcandidate = array_values_absenties.length;

                    const converted_array_values_comp =
                      utils.convertBufferDataAsValue(array_values_comp);
                    const converted_array_values_incomp =
                      utils.convertBufferDataAsValue(array_values_incomp);
                    const converted_array_values_absenties =
                      utils.convertBufferDataAsValue(array_values_absenties);
                    res.json({
                      subject_duration,
                      examDate,
                      count_scheduledcandidate,
                      count_compcandidate,
                      count_incompcandidate,
                      count_abcandidate,
                      GETSUBJECTSET,
                      converted_array_values_comp,
                      converted_array_values_incomp,
                      converted_array_values_absenties,
                    });
                    // console.log(GETSUBJECTSET)
                  })
                  .catch((err) => {
                    console.error("Error processing membership data:", err);
                    res.status(500).json({ error: "Internal Server Error" });
                  });
              }
            );
          })
          .catch((err) => {
            console.error("Error querying attempted counts:", err);
            res.status(500).json({ error: "Internal Server Error" });
          });
      });
    });
  });
});

app.get("/candidate-report/:rollNum", async (req, res) => {
  const { rollNum } = req.params;
  let iwayAddress = "";
  let strMedium = "";
  let dispExamDate = "";
  let iwayCentreCode = "";
  let encryKey = "";
  let iwayExamTime;
  const examCodeQuery = `SELECT DISTINCT e.exam_code, e.exam_name FROM iib_exam e, iib_candidate_scores s WHERE s.exam_code=e.exam_code AND online='Y' AND membership_no= ? `;
  db.query(examCodeQuery, [rollNum], (err, rowsExam) => {
    if (err) {
      console.error("Error querying the database:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    rowsExam.forEach((rowExam) => {
      const examCode = rowExam.exam_code;
      const examName = rowExam.exam_name;
      const subjectCodeQuery =
        "SELECT DISTINCT e.subject_code, e.subject_name FROM iib_exam_subjects e, iib_candidate_scores s WHERE e.subject_code=s.subject_code AND online='Y' AND e.exam_code=? AND membership_no=? ";

      db.query(subjectCodeQuery, [examCode, rollNum], (err, rowsSubject) => {
        if (err) {
          console.error("Error querying the database:", err);
          res.status(500).json({ error: "Internal Server Error" });
          return;
        }

        rowsSubject.forEach((rowSubject) => {
          const subjectCode = rowSubject.subject_code;
          const subjectName = rowSubject.subject_name;
          return new Promise((resolve, reject) => {
            const sqlQuestions =
              "SELECT question_paper_no FROM iib_candidate_test WHERE exam_code=? AND subject_code=? AND test_status='C' AND membership_no=?";
            db.query(
              sqlQuestions,
              [examCode, subjectCode, rollNum],
              (err, rowsSelQues) => {
                if (err) {
                  console.error("Error querying the database:", err);
                  res.status(500).json({ error: "Internal Server Error" });
                  reject(err);
                } else {
                  rowsSelQues.forEach((rowSelQues) => {
                    const questionPaperNo = rowSelQues.question_paper_no;
                    const sqlMember =
                      "SELECT name, address1, address2, address3, address4, address5, address6, pin_code FROM iib_candidate WHERE membership_no=?";

                    db.query(sqlMember, [rollNum], (err, rowsSqlMember) => {
                      if (err) {
                        console.error("Error querying the database:", err);
                        res
                          .status(500)
                          .json({ error: "Internal Server Error" });
                        return;
                      }
                      rowsSqlMember.forEach((rowSqlMember) => {
                        const memberName = rowSqlMember.name;
                        const c_addr1 = rowSqlMember.address1;
                        const c_addr2 = rowSqlMember.address2;
                        const c_addr3 = rowSqlMember.address3;
                        const c_addr4 = rowSqlMember.address4;
                        const c_addr5 = rowSqlMember.address5;
                        const c_addr6 = rowSqlMember.address6;
                        const c_pin = rowSqlMember.pin_code;

                        let memberAddress = "";
                        if (c_addr1 != "") memberAddress += c_addr1;
                        if (memberAddress != "") memberAddress += " ";
                        if (c_addr2 != "") memberAddress += c_addr2;
                        if (memberAddress != "" && c_addr2 != "")
                          memberAddress += " ";
                        if (c_addr3 != "") memberAddress += c_addr3;
                        if (memberAddress != "" && c_addr3 != "")
                          memberAddress += " ";
                        if (c_addr4 != "") memberAddress += c_addr4;
                        if (memberAddress != "" && c_addr4 != "")
                          memberAddress += " ";
                        if (c_addr5 != "") memberAddress += c_addr5;
                        if (memberAddress != "" && c_addr5 != "")
                          memberAddress += " ";
                        if (c_addr6 != "") memberAddress += c_addr6;
                        if (memberAddress != "" && c_addr6 != "")
                          memberAddress += " ";
                        if (c_pin != "") memberAddress += c_pin;

                        // console.log(memberAddress);
                        const sqlIway =
                          " SELECT centre_code, exam_date, exam_time FROM iib_candidate_iway WHERE  exam_code= ? AND subject_code= ? AND membership_no= ? ";
                        db.query(
                          sqlIway,
                          [examCode, subjectCode, rollNum],
                          (err, rowsSqlIway) => {
                            if (err) {
                              console.error(
                                "Error querying the database:",
                                err
                              );
                              res
                                .status(500)
                                .json({ error: "Internal Server Error" });
                              return;
                            }
                            if (rowsSqlIway.length > 0) {
                              rowsSqlIway.forEach((rowSqlIway) => {
                                const iwayExamDate = rowSqlIway.exam_date;
                                iwayCentreCode = rowSqlIway.centre_code;
                                iwayExamTime = rowSqlIway.exam_time;
                                let aDate;
                                if (iwayExamDate != "") {
                                  aDate = utils
                                    .formatExamDate(iwayExamDate)
                                    .split("-");
                                }
                                dispExamDate =
                                  aDate[2] + "/" + aDate[1] + "/" + aDate[0];

                                const sqlIwayAddress =
                                  "SELECT iway_address1, iway_address2, iway_city, iway_state, iway_pin_code FROM iib_iway_details WHERE centre_code= ?";

                                db.query(
                                  sqlIwayAddress,
                                  [iwayCentreCode],
                                  (err, rowsSqlIwayAddress) => {
                                    if (err) {
                                      console.error(
                                        "Error querying the database:",
                                        err
                                      );
                                      res.status(500).json({
                                        error: "Internal Server Error",
                                      });
                                      return;
                                    }

                                    rowsSqlIwayAddress[0].iway_address1 != ""
                                      ? (iwayAddress +=
                                          rowsSqlIwayAddress[0].iway_address1)
                                      : (iwayAddress += "");
                                    rowsSqlIwayAddress[0].iway_address2 != ""
                                      ? (iwayAddress +=
                                          " " +
                                          rowsSqlIwayAddress[0].iway_address2)
                                      : (iwayAddress += "");
                                    rowsSqlIwayAddress[0].iway_city != ""
                                      ? (iwayAddress +=
                                          " " + rowsSqlIwayAddress[0].iway_city)
                                      : (iwayAddress += "");
                                    rowsSqlIwayAddress[0].iway_pin_code != ""
                                      ? (iwayAddress +=
                                          " " +
                                          rowsSqlIwayAddress[0].iway_pin_code)
                                      : (iwayAddress += "");
                                    rowsSqlIwayAddress[0].iway_state != ""
                                      ? (iwayAddress +=
                                          " " +
                                          rowsSqlIwayAddress[0].iway_state)
                                      : (iwayAddress += "");

                                    // console.log(iwayAddress);
                                  }
                                );
                              });
                            }
                            //medium
                            const sqlMedium =
                              "SELECT e.medium_code as medium_code, institution_name  FROM iib_exam_candidate e, iib_candidate c WHERE c.membership_no= ? AND c.membership_no=e.membership_no AND exam_code= ? AND subject_code= ?";
                            db.query(
                              sqlMedium,
                              [rollNum, examCode, subjectCode],
                              (err, rowsSqlMedium) => {
                                if (err) {
                                  console.error(
                                    "Error querying the database:",
                                    err
                                  );
                                  res
                                    .status(500)
                                    .json({ error: "Internal Server Error" });
                                  return;
                                }

                                if (
                                  rowsSqlMedium[0].medium_code == "E" ||
                                  rowsSqlMedium[0].medium_code == "EN" ||
                                  rowsSqlMedium[0].medium_code == "ENGLISH"
                                ) {
                                  strMedium = "ENGLISH";
                                } else if (
                                  rowsSqlMedium[0].medium_code == "H" ||
                                  rowsSqlMedium[0].medium_code == "HINDI"
                                ) {
                                  strMedium = "HINDI";
                                }
                                const institutionName =
                                  rowsSqlMedium[0].institution_name;
                                // console.log(strMedium);
                                const sqlMarks =
                                  "SELECT total_marks, pass_mark FROM iib_exam_subjects WHERE exam_code = ? AND subject_code= ? AND online='Y' ";

                                db.query(
                                  sqlMarks,
                                  [examCode, subjectCode],
                                  (err, rowsSqlMarks) => {
                                    if (err) {
                                      console.error(
                                        "Error querying the database:",
                                        err
                                      );
                                      res.status(500).json({
                                        error: "Internal Server Error",
                                      });
                                      return;
                                    }
                                    rowsSqlMarks.forEach((rowSqlMarks) => {
                                      const totalMarks =
                                        rowSqlMarks.total_marks;
                                      const passMark = rowSqlMarks.pass_mark;

                                      const sqlScores =
                                        "SELECT score FROM iib_candidate_scores WHERE membership_no= ? AND subject_code= ? ";
                                      db.query(
                                        sqlScores,
                                        [rollNum, subjectCode],
                                        (err, rowsSqlScores) => {
                                          if (err) {
                                            console.error(
                                              "Error querying the database:",
                                              err
                                            );
                                            res.status(500).json({
                                              error: "Internal Server Error",
                                            });
                                            return;
                                          }
                                          const scores = rowsSqlScores[0].score;
                                          const sqlQnsIds =
                                            "SELECT question_id FROM iib_question_paper_details WHERE question_paper_no= ?  ORDER BY display_order";

                                          db.query(
                                            sqlQnsIds,
                                            [questionPaperNo],
                                            (err, rowsSqlQnsIds) => {
                                              if (err) {
                                                console.error(
                                                  "Error querying the database:",
                                                  err
                                                );
                                                res.status(500).json({
                                                  error:
                                                    "Internal Server Error",
                                                });
                                                return;
                                              }
                                              let quesIdsArr = [];
                                              const qnsSum =
                                                rowsSqlQnsIds.length;
                                              rowsSqlQnsIds.forEach(
                                                (rowSqlQnsIds) => {
                                                  quesIdsArr.push(
                                                    rowSqlQnsIds.question_id
                                                  );
                                                }
                                              );
                                              const sqlQns =
                                                "select question_id, answer from iib_response where id in ( select  max(id) from iib_response where question_paper_no = ? group by question_id) ORDER BY display_order";

                                              db.query(
                                                sqlQns,
                                                [questionPaperNo],
                                                (err, rowsSqlQns) => {
                                                  let unAttQns = 0;
                                                  let attQns = 0;
                                                  let aQuestions = {};
                                                  let ansQuestionId = [];
                                                  let ansQuesAnswer = {};
                                                  rowsSqlQns.forEach(
                                                    (rowSqlQns) => {
                                                      ansQuestionId.push(
                                                        rowSqlQns.question_id
                                                      );
                                                      ansQuesAnswer[
                                                        rowSqlQns.question_id
                                                      ] = rowSqlQns.answer;
                                                    }
                                                  );
                                                  // console.log(ansQuesAnswer);
                                                  let arrDiffQID =
                                                    quesIdsArr.filter(
                                                      (item) =>
                                                        !ansQuestionId.includes(
                                                          item
                                                        )
                                                    );

                                                  arrDiffQID.forEach(
                                                    (qUnAnsVal) => {
                                                      if (qUnAnsVal !== "") {
                                                        ansQuesAnswer[
                                                          qUnAnsVal
                                                        ] = "";
                                                      }
                                                    }
                                                  );
                                                  // Second loop - categorizing questions as attempted or unattempted
                                                  quesIdsArr.forEach(
                                                    (ansKey) => {
                                                      if (
                                                        ansQuesAnswer[
                                                          ansKey
                                                        ] === ""
                                                      ) {
                                                        unAttQns += 1; // Increment unattempted questions count
                                                        aQuestions[ansKey] =
                                                          ansQuesAnswer[ansKey]; // Store unattempted question
                                                      } else {
                                                        attQns += 1; // Increment attempted questions count
                                                        aQuestions[ansKey] =
                                                          ansQuesAnswer[ansKey]; // Store attempted question
                                                      }
                                                    }
                                                  );
                                                  // console.log(aQuestions);

                                                  let tableName = "";
                                                  if (strMedium === "HINDI") {
                                                    tableName = `iib_section_questions_hindi`;
                                                  } else if (
                                                    strMedium === "ENGLISH"
                                                  ) {
                                                    tableName = `iib_sq_details`;
                                                  }
                                                  let questionTextArray = [];
                                                  let correctAnswerArray = [];
                                                  let marksArray = [];
                                                  let markedAnswerArray = [];
                                                  let cAns = [];
                                                  let mAns = [];
                                                  let encryKey = "";
                                                  const getEncryKey = (
                                                    exam_code,
                                                    subject_code
                                                  ) => {
                                                    return new Promise(
                                                      (resolve, reject) => {
                                                        const encryKeySql = `select qp_encry_key from iib_exam_subjects where exam_code = ? and subject_code = ?`;
                                                        db.query(
                                                          encryKeySql,
                                                          [
                                                            exam_code,
                                                            subject_code,
                                                          ],
                                                          (
                                                            err,
                                                            rowEncryKeySql
                                                          ) => {
                                                            if (err) {
                                                              console.error(
                                                                "Error querying the database:",
                                                                err
                                                              );
                                                              return reject(
                                                                "Internal Server Error"
                                                              );
                                                            }
                                                            return resolve(
                                                              rowEncryKeySql[0]
                                                                .qp_encry_key
                                                            );
                                                          }
                                                        );
                                                      }
                                                    );
                                                  };
                                                  // const gettingEncryptKey = async () => {

                                                  // }
                                                  // gettingEncryptKey().catch((error) => {console.error("Error getting encryption key:",error);});
                                                  // Function to get question data
                                                  const getQuestionData = (
                                                    questionID,
                                                    markedAnswer,
                                                    encryKey
                                                  ) => {
                                                    return new Promise(
                                                      (resolve, reject) => {
                                                        const aQuestionsSql = `SELECT AES_DECRYPT(question_text, ?) as question_text, correct_answer, marks 
                                                      FROM ${tableName} 
                                                      WHERE question_id = ?`;
                                                        db.query(
                                                          aQuestionsSql,
                                                          [
                                                            encryKey,
                                                            questionID,
                                                          ],
                                                          (
                                                            err,
                                                            rowsaQuestions
                                                          ) => {
                                                            if (err) {
                                                              console.error(
                                                                "Error querying the database:",
                                                                err
                                                              );
                                                              return reject(
                                                                "Internal Server Error"
                                                              );
                                                            }
                                                            // Populate arrays with question data
                                                            questionTextArray.push(
                                                              decode(
                                                                rowsaQuestions[0]
                                                                  .question_text
                                                                  ? rowsaQuestions[0].question_text.toString(
                                                                      "utf8"
                                                                    )
                                                                  : null
                                                              )
                                                            );
                                                            correctAnswerArray.push(
                                                              decode(
                                                                rowsaQuestions[0].correct_answer.toString(
                                                                  "utf8"
                                                                )
                                                              )
                                                            );
                                                            marksArray.push(
                                                              rowsaQuestions[0]
                                                                .marks
                                                            );
                                                            markedAnswerArray.push(
                                                              markedAnswer
                                                            );
                                                            const correctAnswer =
                                                              rowsaQuestions[0]
                                                                .correct_answer;

                                                            // console.log(correctAnswer);
                                                            // Handle correct answer
                                                            if (
                                                              correctAnswer !==
                                                              ""
                                                            ) {
                                                              const sqlCorrectAnswer = `SELECT AES_DECRYPT(option_${correctAnswer},?) as correctAns FROM ${tableName} WHERE question_id= ?`;
                                                              db.query(
                                                                sqlCorrectAnswer,
                                                                [
                                                                  encryKey,
                                                                  questionID,
                                                                ],
                                                                (
                                                                  err,
                                                                  rowsCorrectAnswer
                                                                ) => {
                                                                  // console.log(sqlCorrectAnswer);
                                                                  if (err)
                                                                    return reject(
                                                                      err
                                                                    );
                                                                  // console.log(decode(rowsCorrectAnswer[0].correctAns ? rowsCorrectAnswer[0].correctAns.toString('utf-8'): null ))
                                                                  cAns.push(
                                                                    decode(
                                                                      rowsCorrectAnswer[0]
                                                                        .correctAns
                                                                        ? rowsCorrectAnswer[0].correctAns.toString(
                                                                            "utf-8"
                                                                          )
                                                                        : null
                                                                    )
                                                                  );
                                                                  resolve(); // Resolve when the correct answer query is done
                                                                }
                                                              );
                                                            } else {
                                                              cAns.push("");
                                                              resolve(); // Resolve immediately if there's no correct answer
                                                            }

                                                            // Handle marked answer
                                                            if (
                                                              markedAnswer !==
                                                                "" &&
                                                              markedAnswer !==
                                                                "NULL"
                                                            ) {
                                                              const sqlMarkedAnswer = `SELECT AES_DECRYPT(option_${markedAnswer},?) as markedAns FROM ${tableName} WHERE question_id= ?`;
                                                              db.query(
                                                                sqlMarkedAnswer,
                                                                [
                                                                  encryKey,
                                                                  questionID,
                                                                ],
                                                                (
                                                                  err,
                                                                  rowsMarkedAnswer
                                                                ) => {
                                                                  if (err)
                                                                    return reject(
                                                                      err
                                                                    );

                                                                  // console.log(decode(rowsMarkedAnswer[0].markedAns ? rowsMarkedAnswer[0].markedAns.toString('utf8') : null));
                                                                  mAns.push(
                                                                    decode(
                                                                      rowsMarkedAnswer[0]
                                                                        .markedAns
                                                                        ? rowsMarkedAnswer[0].markedAns.toString(
                                                                            "utf8"
                                                                          )
                                                                        : null
                                                                    )
                                                                  );
                                                                  resolve(); // Resolve when the marked answer query is done
                                                                }
                                                              );
                                                            } else {
                                                              mAns.push("");
                                                              resolve(); // Resolve immediately if there's no marked answer
                                                            }
                                                          }
                                                        );
                                                      }
                                                    );
                                                  };

                                                  // Async function to gather data from aQuestions
                                                  const gatherQuestionsData =
                                                    async () => {
                                                      encryKey =
                                                        await getEncryKey(
                                                          examCode,
                                                          subjectCode
                                                        );
                                                      for (const [
                                                        questionID,
                                                        markedAnswer,
                                                      ] of Object.entries(
                                                        aQuestions
                                                      )) {
                                                        await getQuestionData(
                                                          questionID,
                                                          markedAnswer,
                                                          encryKey
                                                        );
                                                      }
                                                      // All data is collected; you can access your arrays here
                                                      const aQuestionsLength =
                                                        aQuestions.length;
                                                      return res.json({
                                                        questionTextArray,
                                                        correctAnswerArray,
                                                        markedAnswerArray,
                                                        marksArray,
                                                        cAns,
                                                        mAns,
                                                        memberName,
                                                        memberAddress,
                                                        iwayExamTime,
                                                        strMedium,
                                                        iwayAddress,
                                                        examCode,
                                                        examName,
                                                        subjectCode,
                                                        subjectName,
                                                        institutionName,
                                                        totalMarks,
                                                        passMark,
                                                        iwayCentreCode,
                                                        dispExamDate,
                                                        scores,
                                                        qnsSum,
                                                        quesIdsArr,
                                                        ansQuestionId,
                                                        ansQuesAnswer,
                                                        arrDiffQID,
                                                        unAttQns,
                                                        attQns,
                                                        aQuestionsLength,
                                                      });
                                                    };

                                                  // Call the function to gather data
                                                  gatherQuestionsData().catch(
                                                    (error) => {
                                                      console.error(
                                                        "Error gathering question data:",
                                                        error
                                                      );
                                                    }
                                                  );

                                                  // console.log(
                                                  //   questionTextArray
                                                  // );
                                                }
                                              );
                                            }
                                          );
                                        }
                                      );
                                    });
                                  }
                                );
                              }
                            );
                          }
                        );
                      });
                    });
                  });
                  resolve();
                }
              }
            );
          });
        });
      });
    });
  });
});

app.get("/get-medium/:rollNo", async (req, res) => {
  const { rollNo } = req.params;
  // res.json(rollNo);
  let examCode, subjectCode, langName, allLangCode;
  let displayMedium;

  const examSubjectCode = (rollNo) => {
    const query =
      "select exam_code,subject_code from iib_exam_candidate where membership_no = ?";
    return new Promise((resolve, reject) => {
      db.query(query, [rollNo], (err, res) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        examCode = res[0].exam_code;
        subjectCode = res[0].subject_code;
        return resolve();
      });
    });
  };

  const getLanguageName = async (langCode) => {
    const query = "select lang_name from iib_languages where lang_code = ?";
    return new Promise((resolve, reject) => {
      db.query(query, [langCode], (err, res) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        return resolve(res[0].lang_name);
      });
    });
  };

  const mediumCode = (rollNo) => {
    const query =
      "select medium_code from iib_exam_candidate where membership_no = ?";
    return new Promise((resolve, reject) => {
      db.query(query, [rollNo], async (err, res) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        await examSubjectCode(rollNo);
        return resolve(res[0].medium_code);
      });
    });
  };

  const getLangCode = async (examCode, subjectCode) => {
    const query =
      "select languages from iib_exam_subjects where exam_code = ? and subject_code = ?";
    return new Promise((resolve, reject) => {
      db.query(query, [examCode, subjectCode], (err, res) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        langArray = res[0].languages.split(",");
        return resolve(langArray);
      });
    });
  };

  const getMedium = async () => {
    candidateDisplayMedium = await mediumCode(rollNo);
    if (candidateDisplayMedium == "E" || candidateDisplayMedium == "EN") {
      candidateDisplayMedium = await getLanguageName("EN");
    } else if (
      candidateDisplayMedium == "H" ||
      candidateDisplayMedium == "HI"
    ) {
      candidateDisplayMedium = await getLanguageName("HI");
    } else {
      candidateDisplayMedium = await getLanguageName(candidateDisplayMedium);
    }

    console.log(candidateDisplayMedium);
    // await examSubjectCode(rollNo);

    allLangCode = await getLangCode(examCode, subjectCode);

    // console.log(allLangCode)
    const subjectLangNamesArray = await Promise.all(
      allLangCode.map(async (subject) => {
        return await getLanguageName(subject);
      })
    ).then((subjectLangNamesArray) =>
      subjectLangNamesArray.filter(
        (langName) => !candidateDisplayMedium.includes(langName)
      )
    );
    // console.log(subjectLangNamesArray);
    // displayMedium =

    return res.json({
      candidateDisplayMedium,
      subjectLangNamesArray,
    });
  };
  getMedium().catch((error) => {
    console.error("Error getting Medium Code", error);
  });
  // res.json(displayMedium)
});

app.get("/bulk-time-extend/", async (req, res) => {
  const { selectedExam, selectedSubject, includeCompleted, time } = req.query;
  let rowsAffectedTotally = 0;
  let timeExtensionUpdate = time * 60;
  let test_ids = [],
    membership_nos = [];
  const getTestAndMemNos = async (selectedExam, selectedSubject) => {
    const query =
      "select max(test_id) as test_id,membership_no from iib_candidate_test where exam_code=? and subject_code = ? group by membership_no";
    return new Promise((resolve, reject) => {
      db.query(query, [selectedExam, selectedSubject], (err, results) => {
        if (err) {
          console.error(err);
          return reject(err);
        }
        results.forEach((result) => {
          test_ids.push(result.test_id);
          membership_nos.push(result.membership_no);
        });
        return resolve([test_ids, membership_nos]);
      });
    });
  };

  const updatingExtendTime = async (
    test_ids,
    membership_nos,
    includeCompleted,
    time
  ) => {
    return new Promise((resolve, reject) => {
      if (test_ids.length !== membership_nos.length) {
        return reject("some problem with test_ids and membership_nos");
      }
      test_ids.forEach((test_id, index) => {
        if (includeCompleted === "true") {
          updateTestWithCompleted(test_id, timeExtensionUpdate)
            .then((affectedRows_1) =>
              deleteCandidateScores(
                membership_nos[index],
                selectedSubject
              ).then((affectedRows_2) =>
                resolve(affectedRows_1 + affectedRows_2)
              )
            )
            .catch((error) => reject(error));
        } else {
          const query =
            "select test_status from iib_candidate_test where test_id = ? ";
          db.query(query, [test_id], (err, results) => {
            if (err) {
              console.error(err);
              return reject(err);
            }
            results.forEach((result) => {
              if (result.test_status == "IC") {
                // console.log(test_id + result.test_status);
                updateTestWithoutCompleted(test_id, timeExtensionUpdate)
                  .then((affectedRows) => resolve(affectedRows))
                  .catch((error) => reject(error));
              }
            });
          });
        }
      });
    });
  };
  const updateTestWithoutCompleted = (test_id, timeExtensionUpdate) => {
    return new Promise((resolve, reject) => {
      const updateQuery =
        "UPDATE iib_candidate_test SET time_extended = time_extended + ? WHERE test_id = ?";
      db.query(updateQuery, [timeExtensionUpdate, test_id], (err, result) => {
        if (err) return reject(err);
        return resolve(result.affectedRows);
      });
    });
  };

  const updateTestWithCompleted = (test_id, timeExtensionUpdate) => {
    return new Promise((resolve, reject) => {
      const updateQuery =
        "UPDATE iib_candidate_test SET time_extended = time_extended + ?, test_status = 'IC' WHERE test_id = ?";
      db.query(updateQuery, [timeExtensionUpdate, test_id], (err, result) => {
        if (err) return reject(err);
        console.log(result.affectedRows + "updateTestwith");
        return resolve(result.affectedRows);
      });
    });
  };

  const deleteCandidateScores = (membership_no, selectedSubject) => {
    return new Promise((resolve, reject) => {
      const deleteQuery =
        "DELETE FROM iib_candidate_scores WHERE membership_no = ? AND subject_code = ?";
      db.query(deleteQuery, [membership_no, selectedSubject], (err, result) => {
        if (err) return reject(err);
        return resolve(result.affectedRows);
      });
    });
  };
  const gettingAndUpdatingExtendTime = async () => {
    const [test_ids, membership_nos] = await getTestAndMemNos(
      selectedExam,
      selectedSubject
    );
    try {
      const rowsAffected = await updatingExtendTime(
        test_ids,
        membership_nos,
        includeCompleted,
        time
      );
      return res.json({ message: "success" });
    } catch (err) {
      return res.json({ message: err });
    }
  };
  gettingAndUpdatingExtendTime().catch((error) => {
    console.error("Error extending bulk time ", error);
  });
});

app.get("/grace-time-extend/", async (req, res) => {
  const { selectedExam, selectedSubjects, time } = req.query;
  const updateGraceTime = async (exam, subjects, timeExtension) => {
    const query = `UPDATE iib_exam_subjects SET grace_post = grace_post + ? WHERE subject_code IN (?)`;
    return new Promise((resolve, reject) => {
      db.query(query, [timeExtension, subjects], (err, res) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        return resolve(res.affectedRows); // Correct property for affected rows
      });
    });
  };
  const funcUpdateGraceTime = async () => {
    const timeExtension = time * 60;
    const rowsAffected = await updateGraceTime(
      selectedExam,
      selectedSubjects,
      timeExtension
    );
    return res.json({
      rowsAffected,
    });
  };
  funcUpdateGraceTime().catch((error) => {
    console.error("Error updating Grace Time ", error);
  });
});

app.get("/change-medium/", async (req, res) => {
  const { rollNo, changedMedium } = req.query;
  const updatingMedium = async () => {
    const query =
      "update iib_exam_candidate set medium_code = (select lang_code from iib_languages where lang_name= ?) where membership_no = ?";
    return new Promise((resolve, reject) => {
      db.query(query, [changedMedium, rollNo], (err, res) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        if (res.affectedRows > 0) {
          return resolve("success");
        } else {
          return resolve("failure");
        }
      });
    });
  };

  const getUpdate = async () => {
    const result = await updatingMedium(rollNo, changedMedium);
    return res.json(result);
  };
  getUpdate().catch((error) => {
    console.error("Error updating Medium Code", error);
  });
});

app.get("/get-center-server-no", (req, res) => {
  const getCenterAndServer = async () => {
    const result = await utils.centreAndServerNo();
    return res.json(result);
  };
  getCenterAndServer().catch((error) => {
    console.error("Error getting center Code and server no", error);
  });
});

app.get("/api/validate-password", (req, res) => {
  const pwd = req.query.password; // Password is in the URL
  // let center_code, serverno;
  // const centreAndServerNo = () => {
  //   return new Promise((resolve, reject) => {
  //     const selAutoFeed = "select center_code, serverno from autofeed";
  //     db.query(selAutoFeed, (err, rowsSelAutoFeed) => {
  //       if (err) {
  //         console.error("Error querying the database:", err);
  //         return reject("Internal Server Error");
  //       }
  //       center_code = rowsSelAutoFeed[0].center_code;
  //       serverno = rowsSelAutoFeed[0].serverno;
  //       return resolve();
  //     });
  //   });
  // };

  const getCentreAndServerNo = async () => {
    const { center_code, serverno } = await utils.centreAndServerNo();
  };
  getCentreAndServerNo().catch((error) => {
    console.error("Error getting Centre and Server No:", error);
  });

  const updated_pwd = utils.get_updated_pwd(pwd, timeValue);
  const min = updated_pwd.substring(0, 2); // Extracts the first two characters
  const hr = updated_pwd.slice(-2); // Extracts the last two characters
  const currentDate = new Date();
  const curHr = currentDate.getHours();
  const curMin = currentDate.getMinutes();
  const date =
    currentDate.getFullYear() +
    ":" +
    String(currentDate.getMonth() + 1).padStart(2, "0") +
    ":" +
    String(currentDate.getDate()).padStart(2, "0");

  // Construct the password-based date and time
  const pwdDate = new Date(`${date} ${hr}:${min}:00`);

  // Construct the current date and time
  const curDate = new Date(`${date} ${curHr}:${curMin}:00`);

  // Calculate the difference in minutes
  const datediff1 = Math.round((curDate - pwdDate) / 60000);

  if (datediff1 < 15) {
    // Extract the password without the first two and last two characters
    const finalPwd = updated_pwd.slice(2, -2);

    // Extract center value without the first three and last characters
    const updatedCVal = cVal.slice(3, -1);

    // Get the last character of the center code and convert it to lowercase
    const cAlp = cVal.slice(-1).toLowerCase();

    // Convert the center code alphabet to its numeric equivalent
    const alCVal = getNumeric(cAlp);

    // Convert the server number to a numeric value
    const alSNo = getNumeric(cserno);

    // Get the current day and month
    const curDay = new Date().getDate();
    const curMon = new Date().getMonth() + 1; // Months are 0-indexed in JS

    // Calculate the password using the extracted and converted values
    const calculatedPwd =
      parseInt(updatedCVal) + alCVal + alSNo + curDay + curMon;

    // Compare calculated password with the final password and set flag
    let clFlag;
    if (calculatedPwd == finalPwd) {
      clFlag = 1; // Success
    } else {
      clFlag = 2; // Failure
    }
  } else {
    clFlag = 3;
  }

  if (password === "your-password") {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

app.get("/download-file/:status", async (req, res) => {
  const status = req.params.status;
  const { centreCode, serverNo } = utils.centreAndServerNo();
  // const batch = req.params.batch;
  // console.log("Gop:", status);

  // let file = status === 'Base' ? process.env.CLIENT : status;
  // const file =
  //   status === "Base"
  //     ? process.env.CLIENT
  //     : status === "Act"
  //       ? batch == "11:00:00"
  //         ? "bac7a-110000"
  //         : "78192-150000"
  //       : status;
  const file =
    status === "Base"
      ? process.env.CLIENT
      : status === "Act"
        ? batch == "10:00:00"
          ? "90e6e-100000"
          : "3b62f-150000"
        : status;
  const url = `https://demo70.sifyitest.com/livedata/${file}.zip`;

  console.log("URL:", url);

  // Define directories
  const tempDir = path.join("C:", "pro", "itest", "activate", "temp");
  const extractDir = path.join("C:", "pro", "itest", "activate");
  const photoDir = path.join("C:", "pro", "itest", "activate", "photo");
  const signDir = path.join("C:", "pro", "itest", "activate", "sign");
  const zipFilePath = path.join(tempDir, `${file}.zip`);

  // Create the temp directory if it doesn't exist
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  // let query = "";
  try {
    // Step 1: Download the file
    const response = await axios.get(url, { responseType: "stream" });
    const writer = fs.createWriteStream(zipFilePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    console.log("File downloaded successfully");

    // Step 2: Unzip the file
    const zip = new AdmZip(zipFilePath);

    if (!status.endsWith("_photo") && !status.endsWith("_sign")) {
      zip.extractAllTo(extractDir, true);
      console.log(`File extracted successfully to ${extractDir}`);
    } else {
      if (status.endsWith("_photo")) {
        let query = "";
        const count_photo_download = utils.countDownloadByAction("photo");

        try {
          zip.extractAllTo(photoDir, true);
          if (count_photo_download >= 1 && count_photo_download != "") {
            query = `UPDATE qp_download SET download_status = 'D', download_time = NOW() WHERE centre_code = ? AND serverno = ? AND download_sec = 'Photo' AND download_status != 'D'`;
          } else if (count_photo_download === 0) {
            query = `INSERT INTO qp_download (id, centre_code, serverno, download_sec, download_status, download_time) VALUES ('', ?, ?, 'Photo', 'D', NOW())`;
          }

          console.log(`Photo File extracted successfully to ${photoDir}`);
        } catch (err) {
          if (count_photo_download >= 1 && count_photo_download != "") {
            query = `UPDATE qp_download SET download_status = 'E2', download_time = NOW() WHERE centre_code = ? AND serverno = ? AND download_sec = 'Photo' AND download_status != 'E2'`;
          } else if (count_photo_download === 0) {
            query = `INSERT INTO qp_download (id, centre_code, serverno, download_sec, download_status, download_time) VALUES ('', ?, ?, 'Photo', 'E2', NOW())`;
          }
          console.error("Error during extraction:", err);
        }
        // Execute the query if it has been set
        if (query) {
          utils.executeImageDownloadQuery(query, centreCode, serverNo);
          // return res.json({"message":"Photo downloaded Successfully"})
        }
      }

      if (status.endsWith("_sign")) {
        let query = "";
        const count_sign_download = utils.countDownloadByAction("sign");
        try {
          zip.extractAllTo(signDir, true);
          if (count_sign_download >= 1 && count_sign_download != "") {
            query = `UPDATE qp_download set download_status ='D',download_time=now() where centre_code=? and serverno= ? and download_sec='Sign' and download_status != 'D' `;
          } else if (count_sign_download == 0) {
            query = `INSERT INTO qp_download (id, centre_code, serverno, download_sec, download_status, download_time) VALUES ('',?,?,'Sign','D',NOW())`;
          }
          console.log(`Sign File extracted successfully to ${signDir}`);
        } catch (err) {
          if (count_sign_download >= 1 && count_sign_download != "") {
            query = `UPDATE qp_download set download_status='E2',download_time=now() where centre_code= ? and serverno= ? and download_sec='Sign' and download_status != 'E2' `;
          } else if (count_sign_download == 0) {
            query = `INSERT INTO qp_download (id, centre_code, serverno, download_sec, download_status, download_time) VALUES ('',?,?,'Sign','E2',NOW())`;
          }
          console.log(err);
        }
        if (query) {
          utils.executeImageDownloadQuery(query, centreCode, serverNo);
          // return res.json({"message":"Sign downloaded Successfully"})
        }
      }
    }
    // Optionally delete the zip file after extraction
    fs.unlinkSync(zipFilePath);

    res.send("File downloaded, extracted, and content modified successfully");
  } catch (error) {
    if (status.endsWith("_photo")) {
      let query = "";
      const count_photo_download = utils.countDownloadByAction("photo");
      if (count_photo_download >= 1 && count_photo_download != "") {
        query = `UPDATE qp_download set download_status='NF', download_time=now() where centre_code = ? and serverno = ? and  download_sec='Photo' and download_status != 'NF' `;
      } else if (count_photo_download == 0) {
        query = `INSERT INTO qp_download (id, centre_code, serverno, download_sec, download_status, download_time) VALUES ('', ?, ?, 'Photo', 'NF', NOW())`;
      }
      if (query) {
        utils.executeImageDownloadQuery(query, centreCode, serverNo);
      }
    }
    if (status.endsWith("_sign")) {
      const count_sign_download = utils.countDownloadByAction("sign");
      let query = "";
      if (count_sign_download >= 1 && count_sign_download != "") {
        query = `UPDATE qp_download set download_status='NF', download_time=now() where centre_code = ? and serverno = ? and  download_sec='Sign' and download_status != 'NF' `;
      } else if (count_sign_download == 0) {
        query = `INSERT INTO qp_download (id, centre_code, serverno, download_sec, download_status, download_time) VALUES ('', ?, ?, 'Sign', 'NF', NOW())`;
      }
      if (query) {
        utils.executeImageDownloadQuery(query, centreCode, serverNo);
      }
    }

    console.error("Error during download or extraction:", error);
    res.status(500).send("Error during the process");
  }
});

app.get("/check-status/", async (req, res) => {
  const result = await axios.get("http://localhost:5000/serial-number/");
  const serialNumber = result.data.serialNumber;

  const getCenterAndServer = await queryAsync(
    "select count(1) as count, serverno as serverNo, centre_code as centerCode from qp_download order by id DESC"
  );
  const { count, serverNo, centerCode } = getCenterAndServer[0];
  const downloadArray = ["Base QP", "Centre QP", "Photo", "Sign"];
  const getDownloadCount = await queryAsync(
    "SELECT COUNT(DISTINCT download_sec) as count FROM qp_download WHERE download_sec IN (?) AND download_status = 'D'",
    [downloadArray]
  );
  console.log(getDownloadCount[0].count);

  if (count > 0 && downloadArray.length == getDownloadCount[0].count) {
    let activatedBatchArray = [];
    const checkActivation = await queryAsync(
      "SELECT id, download_sec FROM qp_download WHERE download_sec LIKE 'Activated-%' GROUP BY download_sec"
    );
    for (const check of checkActivation) {
      console.log(check.download_sec);
      const result = check.download_sec.replace("Activated-", "").trim();
      activatedBatchArray.push(result);
    }
    console.log(activatedBatchArray); // Output: ['Batch123']
    const data = {
      serialNumber: serialNumber,
      database: process.env.DB_NAME,
      centerCode: centerCode,
      serverNo: serverNo,
      data_downloaded: "Y",
      activated_batch: JSON.stringify(activatedBatchArray),
      b: "",
      pos: "",
      sc: "DJC",
    };
    try {
      const response = await axios.post(
        "http://demo70.sifyitest.com/livedata/auto_assign_server_no",
        {
          data: data,
        }
      );
      if (response.statusText === "OK") {
        return res.send("Check status done");
      }
    } catch (err) {
      console.error(err);
      return res.send("Check status failed");
    }
  }
});

app.get("/db-patch/", async (req, res) => {
  const { centre_code, serverno } = utils.centreAndServerNo();
  const dbVersion = await queryAsync(
    "SELECT db_version FROM taserver_version order by id asc"
  );
  // console.log(dbVersion[0].db_version);
  const result = await axios.get("http://localhost:5000/serial-number/");
  const serialNumber = result.data.serialNumber;
  const data = {
    serialNumber: serialNumber,
    database: process.env.DB_NAME,
    centerCode: centre_code,
    serverNo: serverno,
    db_version: dbVersion[0].db_version,
    sc: "QPU",
  };
  try {
    // Make a GET request to the server
    const response = await axios.get(
      "https://demo70.sifyitest.com/livedata/patch_upd.php"
    );
    const result = response.data; // Parse JSON response
    if (result[0] != data.db_version) {
      console.log("this file need to be downloaded" + result[1]);

      const tempDir = path.join("C:", "pro", "itest", "activate", "temp");
      const extractDir = path.join("C:", "pro", "itest", "activate");
      const fileName = result[1].split("/")[1];
      console.log(fileName);
      // Define the full path for saving the downloaded file
      const zipFilePath = path.join(tempDir, fileName); // Using result[1] as the filename

      // Create the temp directory if it doesn't exist
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      try {
        // Step 1: Download the file
        const url = `https://demo70.sifyitest.com/livedata/${result[1]}`;
        const response = await axios.get(url, { responseType: "stream" });

        // Step 2: Pipe the response to a write stream
        const writer = fs.createWriteStream(zipFilePath);
        response.data.pipe(writer);

        // Step 3: Wait for the file to be written to disk
        await new Promise((resolve, reject) => {
          writer.on("finish", resolve); // Resolve once finished writing
          writer.on("error", reject); // Reject if an error occurs
        });

        console.log("File downloaded successfully to", zipFilePath);

        // Step 4: Unzip the file
        const zip = new AdmZip(zipFilePath);
        zip.extractAllTo(extractDir, true);
        console.log(`File extracted successfully to ${extractDir}`);

        const patchFilePath = path.join(
          extractDir,
          `${fileName.split(".")[0]}.sql`
        );
        // const mysqlPath = "C:/mysql5/bin/mysql.exe";

        // Escape special characters in the password if needed
        const escapedPassword = process.env.DB_PASSWORD.replace(/"/g, '\\"');

        // Construct the command
        const command = `"${mysqlPath}" -u ${process.env.DB_USER} --password="${escapedPassword}" ${process.env.DB_NAME} < "${patchFilePath}"`;

        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            console.error(`stderr: ${stderr}`);
            // Only send the response if it's not already been sent
            if (!res.headersSent) {
              return res.status(500).send("Error importing dump file");
            }
          }
          console.log(stdout);
          if (stdout == "") {
            fs.unlinkSync(patchFilePath);
          }
          // If no error, send success response (only if it's not already sent)
          if (!res.headersSent) {
            res.send("Patch file imported successfully");
          }
        });

        // Delete the zip file after everything is done
        fs.unlinkSync(zipFilePath);
        // patchFilePath
      } catch (err) {
        console.error("Error:", err);
        if (!res.headersSent) {
          res.status(500).send("An error occurred during the process");
        }
      }
      // finally{
      //   const patchFilePath = path.join(extractDir, `${(fileName.split("."))[0]}.sql`);
      //   fs.unlinkSync(patchFilePath)
      // }
      console.log("Response from server:", result[0]); // Logs the JSON array ["7.0", "dbdump/hello.zip"]
      res.send(result);
    } else {
      res.send(false);
    }
    // Sends the server response back to the client
  } catch (error) {
    console.error("Request failed", error);
    res.status(500).send("Error sending request to server");
  }
});

/*sethu*/
app.post('/submitFeedback', (req, res) => {
  const { loginProcess, systemWork, techProblem, questionRating, adequateTime, screenNavigationIssue, examMethodologyRating,examCode,subjectCode,membershipNo,questionpaperno} = req.body;
  const txtfeedback= problem_questions= '';
  let msg = '';
console.log(req.body.examCode);

  const feedback_enable_query = "SELECT variable_value FROM exam_settings WHERE variable_name='feedback_enable'";
  db.query(feedback_enable_query, (err, feedbackrslt) => {
      if (err) {
          errorlog('err95', `QUERY: ${feedback_enable_query} ${err}`);
          return res.status(500).send('Database error');
      }

      if (examMethodologyRating) {
          const sqlSelect = `SELECT COUNT(1) FROM iib_feedback WHERE membership_no='${membershipNo}' AND exam_code='${examCode}' AND subject_code='${subjectCode}'`;
          db.query(sqlSelect, (err, result) => {
              if (err) {
                  errorlog('err05', `QUERY: ${sqlSelect} ${err}`);
                  return res.status(500).send('Database error');
              }

              const nRows = result[0]['COUNT(1)'];

              let display_questions = question_asked_twice = answer_not_relevant = question_not_display = answer_not_display = display_image_issue = Display_issue_notdisprop = Junk_Char_observed='';

              if (nRows == 0) {
                  const sqlInsert = `
                      INSERT INTO iib_feedback (membership_no, exam_code, subject_code, login_process, system_work, tech_prob, q_rating, adeq_time, navigate_issue, rating, feedback_text, diplay_questions, problem_questions, question_asked_twice, answer_not_relevant, question_not_display, answer_not_display, display_image_issue, Display_issue_notdisprop, Junk_Char_observed) 
                      VALUES ('${membershipNo}', '${examCode}', '${subjectCode}', '${loginProcess}', '${systemWork}', '${techProblem}', '${questionRating}', '${adequateTime}', '${screenNavigationIssue}', '${examMethodologyRating}', '${txtfeedback}', '${display_questions}', '${problem_questions}', '${question_asked_twice}', '${answer_not_relevant}', '${question_not_display}', '${answer_not_display}', '${display_image_issue}', '${Display_issue_notdisprop}', '${Junk_Char_observed}')`;

                  db.query(sqlInsert, (err) => {
                      if (err) {
                          errorlog('err08', `QUERY: ${sqlInsert} ${err}`);
                          return res.status(500).send('Database error');
                      }
                      msg = "Thank you for your feedback.";
                      const feed = `INSERT INTO xml_feed(query) VALUES("${sqlInsert}")`;
                      db.query(feed);
                      res.send(msg);
                  });
              } else {
                  const sqlUpdate = `
                      UPDATE iib_feedback SET 
                      login_process='${loginProcess}', system_work='${systemWork}', tech_prob='${techProblem}', q_rating='${questionRating}', adeq_time='${adequateTime}', navigate_issue='${screenNavigationIssue}', rating='${examMethodologyRating}', feedback_text='${txtfeedback}', diplay_questions='${display_questions}', problem_questions='${problem_questions}', question_asked_twice='${question_asked_twice}', answer_not_relevant='${answer_not_relevant}', question_not_display='${question_not_display}', answer_not_display='${answer_not_display}', display_image_issue='${display_image_issue}', Display_issue_notdisprop='${Display_issue_notdisprop}', Junk_Char_observed='${Junk_Char_observed}' 
                      WHERE membership_no='${membershipNo}' AND exam_code='${examCode}' AND subject_code='${subjectCode}'`;

                      // console.log(sqlUpdate);

                  db.query(sqlUpdate, (err) => {
                      if (err) {
                          errorlog('err06', `QUERY: ${sqlUpdate} ${err}`);
                          return res.status(500).send('Database error');
                      }
                      msg = "Thank you for your feedback.";
                      const feed = `INSERT INTO xml_feed(query) VALUES("${sqlUpdate}")`;
                      db.query(feed);
                      res.send(msg);
                  });
              }
          });
      }
  });
});

app.get("/candidate-score-responses/:rollNum", async (req, res) => {
  const { rollNum } = req.params;

  try {
    // Get distinct exams for the candidate
    const examCodeQuery = `
    SELECT DISTINCT e.exam_code, e.exam_name 
    FROM iib_exam e, iib_candidate_scores s 
    WHERE s.exam_code = e.exam_code AND online = 'Y' AND membership_no = ?`;
  const rowsExam = await queryAsync(examCodeQuery, [rollNum]);

  
    // Iterate through each exam
    for (const rowExam of rowsExam) {
      const { exam_code: examCode, exam_name: examName } = rowExam;

      // Get distinct subjects for the candidate's exam
      const subjectCodeQuery = `
        SELECT DISTINCT e.subject_code, e.subject_name 
        FROM iib_exam_subjects e, iib_candidate_scores s 
        WHERE e.subject_code = s.subject_code 
          AND online = 'Y' 
          AND e.exam_code = ? 
          AND membership_no = ?`;
      const rowsSubject = await queryAsync(subjectCodeQuery, [examCode, rollNum]);

      for (const rowSubject of rowsSubject) {
        const { subject_code: subjectCode, subject_name: subjectName } = rowSubject;

        // Get the candidate's question paper number
        const sqlQuestions = `
          SELECT question_paper_no 
          FROM iib_candidate_test 
          WHERE exam_code = ? 
            AND subject_code = ? 
            AND test_status = 'C' 
            AND membership_no = ?`;
        const rowsSelQues = await queryAsync(sqlQuestions, [examCode, subjectCode, rollNum]);

        for (const rowSelQues of rowsSelQues) {
          const questionPaperNo = rowSelQues.question_paper_no;
         // Get exam marks and other details
          const sqlMarks = `
            SELECT total_marks, pass_mark, display_response 
            FROM iib_exam_subjects 
            WHERE exam_code = ? 
              AND subject_code = ? 
              AND online = 'Y'`;
          const rowsSqlMarks = await queryAsync(sqlMarks, [examCode, subjectCode]);
          const displayResponse = rowsSqlMarks[0]['display_response'];

          // console.log('display_response',display_response);

          // Retrieve list of question IDs
          const sqlQnsIds = `
          SELECT question_id , display_order
          FROM iib_question_paper_details 
          WHERE question_paper_no = ? 
          ORDER BY display_order`;
        const rowsSqlQnsIds = await queryAsync(sqlQnsIds, [questionPaperNo]);
        const quesIdsArr = rowsSqlQnsIds.map(row => row.question_id);
        // console.log('Question_id',quesIdsArr);
//         // const quesIdsArrdis = rowsSqlQnsIds.map(row => row.display_order);
// Step 1: Fetch all response data for `questionPaperNo` from `iib_response`
const sqlQns = `
  SELECT question_id, answer, display_order 
  FROM iib_response 
  WHERE id IN (
    SELECT MAX(id) 
    FROM iib_response 
    WHERE question_paper_no = ? AND answer != 'NULL'
    GROUP BY question_id
  ) 
  ORDER BY display_order
`;
const rowsSqlQns = await queryAsync(sqlQns, [questionPaperNo]);
// console.log("Response data:", rowsSqlQns);

// Step 2: Fetch correct answers for all questions in `quesIdsArr`
const aQuestionsSql = `
  SELECT question_id, correct_answer 
  FROM iib_sq_details 
  WHERE question_id IN (${quesIdsArr.join(",")})
`;
const rowsSqlQnsIdsVal = await queryAsync(aQuestionsSql);
// console.log("Correct answers:", rowsSqlQnsIdsVal);

// Step 3: Merge both datasets based on `question_id`, ensuring every question has a `correct_answer`
const CandidateResponse = quesIdsArr.map(question_id => {
  const response = rowsSqlQns.find(item => item.question_id === question_id);
  const correctAnswer = rowsSqlQnsIdsVal.find(
    item => item.question_id === question_id
  );

  return {
    question_id,
    answer: response ? response.answer : '-',
    display_order: response ? response.display_order : '-',
    correct_answer: correctAnswer ? correctAnswer.correct_answer : '-'
  };
});

// console.log("Merged Data with All Correct Answers:", CandidateResponse);
const Questioncount=rowsSqlQnsIdsVal.length;
const attendedQusCount=rowsSqlQns.length;
console.log(Questioncount);
res.json({
  Questioncount,
  attendedQusCount,
  CandidateResponse,
  displayResponse
})
        }
      }
    }
  } catch (error) {
    console.error("Error querying the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.post('/exam-closure-summary', (req, res) => {
  const data = req.body;

  // Extract and validate necessary variables
  const {
    ExamName = '', 
    ExamDate = '', 
    CentreCode = '', 
    ServerNo = '', 
    AdminId = '172.17.109.2',
    SerialNumber = '',
    feedback, 
    attachFile, 
    ...formFields
  } = data;

  const currentTimestamp = new Date(); // Generate current timestamp

  // console.log(ExamDate);

  // Define your SQL Insert Query
  const insertQuery = `INSERT INTO exam_day_end_report (exam_name, exam_date, centre_code, server_no, batch1_scheduled, batch2_scheduled, batch3_scheduled, batch1_attended, batch2_attended, batch3_attended, test_lab, test_admin, without_admit_card, without_id_proof, without_admit_card_id_proof, test_reporting_late, request_centre_change, test_malpractice, updated_ip, updated_on, updated_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  // Prepare values from the form data
  const values = [
    ExamName, ExamDate, CentreCode, ServerNo,
    formFields.candidateBatch1Scheduled, formFields.candidateBatch2Scheduled, formFields.candidateBatch3Scheduled,
    formFields.candidateBatch1Attended, formFields.candidateBatch2Attended, formFields.candidateBatch3Attended,
    formFields.labsUsed, formFields.testAdministrators,
    formFields.candidatesWithoutAdmitCard, formFields.candidatesWithoutIdentityProof, formFields.candidatesWithoutAdmitCardAndIdentityProof,
    formFields.candidatesReportingLate, formFields.candidatesRequestingCentreChange, formFields.candidatesIndulgingInMalpractice,
    AdminId, currentTimestamp, SerialNumber, 'S'
  ];

  // Log for debugging
  console.log('Inserting data:', values);

  // Execute query
  db.query(insertQuery, values, (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      return res.status(500).json({ message: 'Error inserting data', error: err });
    }
    res.json({ message: 'Data inserted successfully' });
  });
});


app.get('/get-exam-date', (req, res) => {
  const sqlDate = "SELECT DISTINCT exam_date FROM iib_exam_schedule ORDER BY exam_date";
  db.query(sqlDate, (error, results) => {
      if (error) {
          return callback(error, null);
      }

      if (results.length === 1) {
          const eDateRaw = results[0].exam_date;
          const eDate = eDateRaw instanceof Date ? eDateRaw.toISOString().split("T")[0] : eDateRaw; // Ensure it's in YYYY-MM-DD format

          if (typeof eDate === "string" && eDate.includes("-")) {
              const [year, month, day] = eDate.split("-");
              const dispDate = `${day}-${month}-${year}`;
              res.status(200).json({ exam_date: eDate, display_date: dispDate });
          } else {
            res.status(400).json(new Error("Invalid date format"));
          }
      } else {
          const today = new Date();
          const exam_date = today.toISOString().split("T")[0]; // Format as YYYY-MM-DD
          // callback(null, { exam_date });
          res.status(200).json({ exam_date: exam_date});
      }
  });
});


app.get('/get-center-server-details', async (req, res) => {
  const selAutoFeed = "SELECT center_code, serverno FROM autofeed";

  try {
    const rowsSelAutoFeed = await new Promise((resolve, reject) => {
      db.query(selAutoFeed, (err, results) => {
        if (err) {
          console.error("Error querying the database:", err);
          return reject(new Error("Internal Server Error"));
        }
        resolve(results);
      });
    });

    if (rowsSelAutoFeed.length === 0) {
      return res.status(404).json({ message: "No data found in autofeed table" });
    }

    // Prepare result
    const result = {
      center_code: rowsSelAutoFeed[0].center_code,
      serverno: rowsSelAutoFeed[0].serverno,
    };
  // console.log(result);
    res.json(result); // Send result as JSON response
  } catch (error) {
    console.error("Error fetching center and server details:", error);
    res.status(500).json({ message: error.message }); // Send error response
  }
});

app.get('/get-exam-details', async (req, res) => {
  const selExam = "select exam_code,exam_name from iib_exam";

  try {
    const rowsExam = await new Promise((resolve, reject) => {
      db.query(selExam, (err, results) => {
        if (err) {
          console.error("Error querying the database:", err);
          return reject(new Error("Internal Server Error"));
        }
        resolve(results);
      });
    });

    if (rowsExam.length === 0) {
      return res.status(404).json({ message: "No data found in iib_exam table" });
    }

    // Prepare result
    const result = {
      exam_code: rowsExam[0].exam_code,
      exam_name: rowsExam[0].exam_name,
    };
  // console.log(result);
    res.json(result); // Send result as JSON response
  } catch (error) {
    console.error("Error fetching exam details:", error);
    res.status(500).json({ message: error.message }); // Send error response
  }
});

const session = {
  ta_override: "N",
  mc: "EN", // Example medium code from session
};


app.get("/medium-settings/:SubjectCode", (req, res) => {
  const { SubjectCode } = req.params;
  console.log("SubjectCode:", SubjectCode);

  const mediumSettingsSql = `
    SELECT variable_name, variable_value FROM exam_settings 
    WHERE variable_name='display_medium' OR variable_name='display_medium_dropdown'
  `;

  const sublanguagesSql = `SELECT languages FROM iib_exam_subjects WHERE subject_code = ?`;

  db.query(sublanguagesSql, [SubjectCode], (err, sublanguagesResult) => {
    if (err) {
      console.error("Database query failed:", err.message);
      res.status(500).send("An error occurred while retrieving languages.");
      return;
    }

    if (sublanguagesResult.length === 0) {
      console.warn("No languages found for the provided subject code.");
      res.status(404).send("No languages found for the specified subject code.");
      return;
    }

    // Split the languages string into an array of codes
    const mediumlanguages = sublanguagesResult
      .map((row) => row.languages.split(","))
      .flat();
    console.log("Retrieved languages:", mediumlanguages);

    // Fetch medium settings
    db.query(mediumSettingsSql, (err, mediumSettingsResult) => {
      if (err) {
        console.error("Database query failed:", err);
        res.status(500).send("Database error");
        return;
      }

      const mediumSettings = {
        display_medium: "",
        display_medium_dropdown: "",
      };

      mediumSettingsResult.forEach((row) => {
        mediumSettings[row.variable_name] = row.variable_value;
      });

      // Fetch active languages
      const languagesSql = `
        SELECT lang_code, lang_name 
        FROM iib_languages 
        WHERE is_active = 'Y' AND lang_code IN (?)
      `;

      // Filter active languages based on mediumlanguages
      db.query(languagesSql, [mediumlanguages], (err, languagesResult) => {
        if (err) {
          console.error("Database query failed:", err);
          res.status(500).send("Database error");
          return;
        }

        // Construct the arrLang and subjectLanguages dynamically
        const arrLang = {};
        const subjectLanguages = [];

        languagesResult.forEach((row) => {
          arrLang[row.lang_code] = row.lang_name;
          subjectLanguages.push(row.lang_code);
        });

        const mediumCode = "EN"; // Example selected language code

        // Respond with all required data
        res.json({
          mediumSettings,
          subjectLanguages,
          mediumCode,
          arrLang,
          session,
        });
      });
    });
  });
});
/*sethu*/


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
