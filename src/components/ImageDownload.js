import React, { useState, useEffect } from "react";
import axios from "axios";

const ImageDownload = () => {
  const [centerCode, setCenterCode] = useState("");
  const [serverNo, setServerNo] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState({
    photo: false,
    sign: false,
    checkStatus: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/get-center-server-no"
        );
        setCenterCode(res.data.centre_code);
        setServerNo(res.data.serverno);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();

    return () => {
      console.log("Cleanup function is being called");
    };
  }, []);

  const downloadFile = async (fileName) => {
    try {
      setLoading((prev) => ({ ...prev, [fileName]: true }));

      const status = centerCode + "_" + fileName;
      const res = await axios.get(
        `http://localhost:5000/download-file/${status}`
      );
      const file = fileName[0].toUpperCase() + fileName.slice(1);
      if (res.statusText == "OK") {
        setMessage(`${file} file downloaded and Extracted Successfully`);
      } else {
        setMessage(`Error while downloading ${fileName} file`);
      }
      setLoading((prev) => ({ ...prev, [fileName]: false }));
    } catch (err) {
      console.error(err);
    }
  };
  const handleCheckStatus = async () => {
    try {
      setLoading((prev) => ({ ...prev, ["checkStatus"]: true }));

      const res = await axios.get("http://localhost:5000/check-status");
      setMessage(res.data);
      setLoading((prev) => ({ ...prev, ["checkStatus"]: false }));
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <>
      <div className="text-center">
        {/* <h4 className="font-weight-bold">Image Download</h4> */}

        <div className="mb-3">
          <p className="mb-1">
            <strong>Center Code:</strong> <span>{centerCode}</span>
          </p>
          <p>
            <strong>Server No:</strong> <span>{serverNo}</span>
          </p>
        </div>

        <div className="d-flex justify-content-around align-items-baseline mb-3">
          <span>Download Photo:</span>
          <button
            style={{
              width: "8vw",
              padding: "5px",
              fontSize: "15px",
            }}
            className="mt-2"
            onClick={() => downloadFile("photo")}
            disabled={loading.photo} // Disable button while loading
          >
            {loading.photo ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
            ) : (
              "Download"
            )}
          </button>
        </div>

        <div className="d-flex justify-content-around align-items-baseline mb-3">
          <span>Download Signature:</span>
          <button
            style={{
              width: "8vw",
              padding: "5px",
              fontSize: "15px",
            }}
            className="mt-2"
            onClick={() => downloadFile("sign")}
            disabled={loading.sign} // Disable button while loading
          >
            {loading.sign ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
            ) : (
              "Download"
            )}
          </button>
        </div>

        <div className="d-flex justify-content-around align-items-baseline">
          <span>Check Status:</span>
          <button
            style={{
              width: "8vw",
              padding: "5px",
              fontSize: "15px",
            }}
            className="mt-2"
            onClick={handleCheckStatus}
            disabled={loading.status} // Disable button while loading
          >
            {loading.status ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
            ) : (
              "Check"
            )}
          </button>
        </div>
      </div>
      {message !== "" ? (
        <div
          id="statusMessage"
          className="alert alert-info mt-4"
          style={{ width: "32vw", marginLeft: "30vw;" }}
        >
          <span id="newMediumMessage" style={{ fontSize: "15px" }}>
            {message}
          </span>{" "}
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default ImageDownload;
