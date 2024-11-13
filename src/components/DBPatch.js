import React, { useState } from "react";
import axios from "axios";
const DBPatch = () => {
    const [message, setMessage] = useState("");

  const handleUpdate = async () => {
    try {
      const res = await axios.get("http://localhost:5000/db-patch");
      if ((res.data != false)) {
        setMessage("Patch Updated Successfully");
      } else {
        setMessage("No patch available");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
    <div className="form-group text-center">
      <label htmlFor="dbPatch" className="h6 mb-3">
        DB Patch 
      </label>
      <br />
      <button  style={{
              width: "8vw",
              padding: "5px",
              fontSize: "15px",
            }}
            className="mt-2" onClick={handleUpdate}>
        Update
      </button>
  
      {message && (
        <div
          id="statusMessage"
          className="alert alert-info mt-4 mx-auto"
          style={{ maxWidth: "500px" }}
        >
          <span id="newMediumMessage" className="font-weight-normal" style={{ fontSize: "15px" }}>
            {message}
          </span>
        </div>
      )}
    </div>
  </div>
  
  );
};

export default DBPatch;
