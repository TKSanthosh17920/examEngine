const db = require("./connect");

// Mapping for character values


// Mapping for time values


const formatExamDate = (dateString) => {
  const localDate = new Date(dateString);
  const offset = localDate.getTimezoneOffset() * 60000; // offset in milliseconds
  const utcDate = new Date(localDate.getTime() - offset);
  return utcDate.toISOString().split("T")[0];
};

const get_updated_pwd = (pwd, arValue) => {
  // Convert the string 'pwd' into an array of characters
  const arPwd = pwd.split('');
  const aUPwd = [];

  // Iterate over each character in arPwd array
  arPwd.forEach(value => {
      // Check if the current value exists in the arValue object
      if (arValue.hasOwnProperty(value)) {
          // Push the corresponding value from arValue into aUPwd
          aUPwd.push(arValue[value]);
      }
  });

  // Convert the array back into a string and return the updated password
  return aUPwd.join('');
}

const centreAndServerNo = () => {
  return new Promise((resolve, reject) => {
    const selAutoFeed = "select centre_code, serverno from qp_download";
    db.query(selAutoFeed, (err, rowsSelAutoFeed) => {
      if (err) {
        console.error("Error querying the database:", err);
        return reject("Internal Server Error");
      }const result = {
      centre_code : rowsSelAutoFeed[0].centre_code,
      serverno : rowsSelAutoFeed[0].serverno,
    }
      return resolve(result);
    });
  });
};

const getSubExamSet = (subjectCode) => {
  return new Promise((resolve, reject) => {
    let subsetquery;
    if (subjectCode === "") {
      subsetquery =
        "SELECT subject_code, display_score, display_result FROM iib_exam_subjects";
    } else {
      subsetquery = `SELECT display_score, display_result FROM iib_exam_subjects WHERE subject_code = ?`;
    }

    db.query(subsetquery, [subjectCode], (err, rows) => {
      if (err) {
        return reject(err); // Reject the promise with the error
      }

      if (subjectCode !== "") {
        // For a specific subject code
        const score = rows[0]?.display_score; // Use optional chaining for safety
        const result = rows[0]?.display_result; // Use optional chaining for safety
        const returnArray = {
          score: score,
          result: result,
        };
        return resolve(returnArray); // Resolve the promise with the result
      } else {
        // For all subjects
        const SUBJECTSETTINGS = {};
        rows.forEach((row) => {
          SUBJECTSETTINGS[row.subject_code] = {
            SCORE: row.display_score,
            RESULT: row.display_result,
          };
        });
        return resolve(SUBJECTSETTINGS); // Resolve the promise with the settings
      }
    });
  });
};
const convertBufferDataAsValue = (arrayConvert) => {
  return arrayConvert.map((item) => {
    // Create a new object to avoid mutating the original
    const newItem = { ...item };

    // Convert the Time array if it exists
    if (newItem.Time) {
      newItem.Time = newItem.Time.map((timeObj) => {
        const newTimeObj = { ...timeObj };

        // Check if start_time is a Buffer and convert it
        if (Buffer.isBuffer(newTimeObj.start_time)) {
          newTimeObj.start_time = newTimeObj.start_time.toString("utf8"); // Convert Buffer to string
        }

        // Check if end_time is a Buffer and convert it (if it exists)
        if (Buffer.isBuffer(newTimeObj.end_time)) {
          newTimeObj.end_time = newTimeObj.end_time.toString("utf8"); // Convert Buffer to string
        }

        return newTimeObj; // Return the modified time object
      });
    }

    return newItem; // Return the modified item
  });
};

const getResponseCount = (questionPno, startTime, endTime) => {
  return new Promise((resolve, reject) => {
    timejustquery = `SELECT count(1) as responseCount from iib_response where question_paper_no= ? AND updatedtime>= ? AND updatedtime<= ?`;
    db.query(
      timejustquery,
      [questionPno, startTime, endTime],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        console.log(result[0].responseCount)
        return resolve(result[0].responseCount);
      }
    );
  });
};
const convertHrs = (duration_val) => {
  var calculatedTime = new Date(null);
  calculatedTime.setSeconds( duration_val ); //setting value in seconds
  var newTime = calculatedTime.toISOString().substr(11, 8);
  return newTime;
};

function countDownloadByAction(downloadSec, status = '') {
  return new Promise((resolve, reject) => {
      if (!downloadSec) {
          resolve(0);
          return;
      }

      const statusCondition = status ? ` AND download_status = '${status.trim()}'` : '';
      const query = `SELECT COUNT(DISTINCT download_sec) AS count FROM qp_download WHERE download_sec = '${downloadSec.trim()}'${statusCondition}`;

      db.query(query, (error, results) => {
          if (error) {
              reject(error);
              return;
          }
          resolve(results[0].count || 0);
      });
  });
}

const executeImageDownloadQuery = async (query,centerCode,serverNo)=>{
  if (query) {
    db.query(query, [centerCode, serverNo], (err, res) => {
      if (err) {
        console.error("Database error:", err);
      } else {
        console.log("Rows affected:", res.affectedRows);
      }
    });
  }
  else {
    console.log("No query to execute in image download menu.");
  } 
}
module.exports = {
  formatExamDate,
  getSubExamSet,
  convertBufferDataAsValue,
  getResponseCount,
  convertHrs,
  get_updated_pwd,
  centreAndServerNo,
  countDownloadByAction,
  executeImageDownloadQuery
};
