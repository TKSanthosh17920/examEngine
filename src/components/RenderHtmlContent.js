import { decodeHtml } from "./utils";
import { Button, TextField } from "@mui/material";

const RenderHtmlContent1 = ({ htmlString, caseId, caseText, questionType }) => {
  const decodedHtml = decodeHtml(htmlString);
  const hrStyle = {
    border: "none", // Remove default borders
    borderTop: "3px solid black", // Set thickness (3px) and color (black)
    width: "100%", // Set width to 100% of the container
  };

  return (
    <>
      {questionType == "DQ" ? (
        <div>
          <div
            style={{ marginLeft: "26px", marginTop: "-23px" }}
            dangerouslySetInnerHTML={{ __html: decodedHtml }}
          />
          <form style={{ width: "100%" }}>
            {/* MUI TextField as a textarea */}
            <TextField
              className="mt-3 mx-2" label="Enter your answer here" multiline rows={4} 
              // value={text}
              // onChange={handleChange}
              variant="outlined"
              fullWidth
              color = "black"
            />
            <br />
            {/* MUI Button for form submission */}
            <Button
              type="submit"
              variant="contained"
              color="success"
              className="mx-2"
              style={{ marginTop: "16px" }}
            >
              Submit
            </Button>
          </form>
        </div>
      ) : caseId > 0 ? (
        <div className="container">
          <div className="row" style={{ marginTop: "-23px" }}>
            {/* Case Column with max-height and overflow scroll */}
            <div
              className="col-12 col-md-6"
              style={{ maxHeight: "200px", height: "150px", overflowY: "auto" }}
            >
              <div
                style={{ marginLeft: "26px" }}
                dangerouslySetInnerHTML={{ __html: decodeHtml(caseText) }}
              />
            </div>
          </div>
          <hr style={hrStyle} className="mb-2"></hr>
          <div className="row">
            {/* Question Column on a new row */}
            <div className="col-12 col-md-6">
              <div
                style={{ marginLeft: "26px" }}
                dangerouslySetInnerHTML={{ __html: decodedHtml }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{ marginLeft: "26px", marginTop: "-23px" }}
          dangerouslySetInnerHTML={{ __html: decodedHtml }}
        />
      )}
    </>
  );
};

export default RenderHtmlContent1;
