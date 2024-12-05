import React, { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress"; // For a spinner
import fallback from "./assets/images/broken.gif";

const QuestionImage = ({ questionId }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!questionId) {
      setLoading(false);
      return;
    }

    const fetchImage = async () => {
      try {
        const response = await fetch(
          `http://localhost:4500/image/${questionId}`
        );
        if (response.ok) {
          const blob = await response.blob();
          setImageSrc(URL.createObjectURL(blob)); // Create a local URL for the image
        } else {
          console.error("Failed to load image:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching image:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [questionId]);

  if (loading) return <CircularProgress />;

  return (
    <>
      {imageSrc ? (
        <img
          className="qpimg"
          style={{ width: "200px" }} // You can adjust the width as needed
          src={imageSrc}
          alt={`Question ${questionId}`}
        />
      ) : (
        <>
          <img
            className="qpimg"
            style={{ width: "200px" }} // You can adjust the width as needed
            src={fallback}
            alt={`Question ${questionId}`}
          />
          <p
            className="imgnotfnd"
            style={{
              fontSize: "10px",
              fontWeight: "600",
              marginLeft: "60px",
              marginTop: "-40px",
            }}
          >
            Image not found
          </p>
        </>
      )}
    </>
  );
};

export default QuestionImage;
