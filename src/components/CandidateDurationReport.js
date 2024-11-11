import axios from "axios";
import React, { useState, useEffect } from "react";
var XLSX = require("xlsx");

const CandidateDurationReport = () => {
  const [exam, setExam] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const[subjectDuration, setSubjectDuration] = useState(0);
  const [isDivEnabled, setIsDivEnabled] = useState(false);
  const [countData, setcountData] = useState({

    examDate: 0,
    count_scheduledcandidate: 0,
    count_compcandidate: 0,
    count_incompcandidate: 0,
    count_abcandidate: 0,
    GETSUBJECTSET: [],
    array_values_comp: [],
    array_values_incomp: [],
    array_values_absenties: [],
  });

  const [selectedExam, setselectedExam] = useState(null); // To store selected category
  const [selectedSubject, setselectedSubject] = useState(null);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await axios.get("http://localhost:5000/exam-dropdown");
        setExam(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchExam();
  }, []);

  const handleExamChange = async (event) => {
    const examCode = event.target.value;
    setselectedExam(examCode);
    try {
      const res = await axios.get(
        `http://localhost:5000/subject-dropdown/${examCode}`
      );
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  const handleSubjectChange = async (event) => {
    const subjectCode = event.target.value;
    setselectedSubject(subjectCode);
  };
  const handleSubmit = async () => {
    if (selectedExam && selectedSubject) {
      try {
        const res = await axios.get(
          "http://localhost:5000/get-candidate-duration-report/",
          {
            params: {
              examCode: selectedExam,
              subjectCode: selectedSubject,
            },
          }
        );
        setSubjectDuration(res.data.subject_duration)
        setcountData({
          examDate: res.data.examDate,
          count_scheduledcandidate: res.data.count_scheduledcandidate,
          count_compcandidate: res.data.count_compcandidate,
          count_incompcandidate: res.data.count_incompcandidate,
          count_abcandidate: res.data.count_abcandidate,
          GETSUBJECTSET: res.data.GETSUBJECTSET,
          array_values_comp: res.data.converted_array_values_comp,
          array_values_incomp: res.data.converted_array_values_incomp,
          array_values_absenties: res.data.converted_array_values_absenties,
        });
        setIsDivEnabled(true);
      } catch (err) {
        console.error(err);
      }
      console.log(subjects);
      // console.log(countData.array_values_comp[0]);
      // alert(countData.array_values_comp[0]);

    }
  };
  const downloadExcel = () => {
    const tables = document.querySelectorAll(".table-to-export");
    const wb = XLSX.utils.book_new();
    const nameArray = [
      "Complete Candidate Details",
      "Incomplete Candidate Details",
      "Absent Candidate Details",
    ];
    tables.forEach((table, index) => {
      const ws = XLSX.utils.table_to_sheet(table);

      // Append the sheet to the workbook with a unique name
      XLSX.utils.book_append_sheet(wb, ws, `${nameArray[index]}`);
    });
    const filename = `candidate_duration_(${countData.examDate})_examcode_(${selectedExam})_subjcode_(${selectedSubject})`;
    // Create a blob and download the Excel file
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };
const timeExtendedColor = "#fcd883";
  return (
    <div>
      <div className="row mt-3">
        <div className="col-md-6">
          Exam Code: &nbsp;
          <select onChange={handleExamChange}>
            <option value="">-Select-</option>
            {exam.map((exam) => (
              <option key={exam.id} value={exam.exam_code}>
                {exam.exam_code}-{exam.exam_name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          Subject code: &nbsp;
          <select onChange={handleSubjectChange}>
            <option value="">-Select-</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.subject_code}>
                {subject.subject_code}-{subject.subject_name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="mt-3"
          style={{ width: "7vw", marginLeft: "30vw",padding:"5px", fontSize: "15px" }}
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
      <div
        style={{
          display: isDivEnabled ? "block" : "none",
          opacity: isDivEnabled ? 1 : 0.5,
          pointerEvents: isDivEnabled ? "auto" : "none",
          transition: "opacity 0.5s ease",
        }}
      >
        <div className="row mt-3">
          <div className="col-md-6">
            Total No.of Candidates Scheduled :{" "}
            {countData.count_scheduledcandidate}
          </div>
          <div className="col-md-6">
            Total No.of Candidates Completed : {countData.count_compcandidate}
          </div>
        </div>
        <div className="row mt-1">
          <div className="col-md-6">
            Total No.of Candidates In Completed :
            {countData.count_incompcandidate}
          </div>
          <div className="col-md-6">
            Total No.of Candidates Absent : {countData.count_abcandidate}
          </div>
        </div>
        <h6 className="mt-3">Completed Candidate Details</h6>
        <table
          className="mt-3 table-bordered table-to-export table-striped"
          style={{ width: "100%", fontSize: "15px" }}
          border="1"
          cellPadding={2}
          cellSpacing={0}
        >
          <tr className="greybluetext10">
            <td>
              <b>S.No.</b>
            </td>
            <td>
              <b>Centre Code</b>
            </td>
            <td>
              <b>Roll no</b>
            </td>
            <td>
              <b>Start Time</b>
            </td>
            <td>
              <b>End Time</b>
            </td>
            <td>
              <b>Response Count</b>
            </td>
            <td>
              <b>Duration (H:M:S)</b>
            </td>
            {countData.GETSUBJECTSET.score === "Y" && (
              <td>
                <b>Score</b>
              </td>
            )}
            {countData.GETSUBJECTSET.score === "Y" && (
              <td>
                <b>Score</b>
              </td>
            )}
            <td>
              <b>Extended&nbsp;Time (Minutes)</b>
            </td>
            <td>
              <b>Attempted Questions Count</b>
            </td>
          </tr>

          {countData.array_values_comp.length === 0 ? (
            <td colSpan={15}>
              <b>No data available</b>
            </td>
          ) : (

            countData.array_values_comp.map((element, index) => (
                <tr key={index} style={{
                background: element.durationInSec > subjectDuration ? "rgba(241 ,149 ,149 , 0.5)":element.timeextended > 0 ? `${timeExtendedColor}` : 'inherit'
              }}>
                <td>{index + 1}</td>
                <td>{element.centre_code}</td>
                <td>{element.mem_no}</td>
                <td>{element.Time[0].start_time}</td>
                <td>
                  {element.Time[0].end_time ? element.Time[0].end_time : "NA"}
                </td>
                <td>{element.Time[0].total_response_count}</td>
                <td>{element.duration}</td>
                <td>{element.timeextended}</td>
                <td>{element.attemptqpcount}</td>
                {!countData.array_values_comp && (
                  <td>No data available here</td>
                )}
              </tr>
            ))
          )}
        </table>
        <h6 className="mt-3">Incompleted Candidate Details</h6>
        <table
          className="mt-3 table-bordered table-to-export "
          style={{ width: "100%", fontSize: "15px" }}
          border="1"
          cellPadding={2}
          cellSpacing={0}
        >
          <tr className="greybluetext10">
            <td>
              <b>S.No.</b>
            </td>
            <td>
              <b>Centre Code</b>
            </td>
            <td>
              <b>Roll no</b>
            </td>
            <td>
              <b>Start Time</b>
            </td>
            <td>
              <b>End Time</b>
            </td>
            <td>
              <b>Response Count</b>
            </td>
            <td>
              <b>Duration (H:M:S)</b>
            </td>
            {countData.GETSUBJECTSET.score === "Y" && (
              <td>
                <b>Score</b>
              </td>
            )}
            {countData.GETSUBJECTSET.score === "Y" && (
              <td>
                <b>Score</b>
              </td>
            )}
            <td>
              <b>Extended&nbsp;Time (Minutes)</b>
            </td>
            <td>
              <b>Attempted Questions Count</b>
            </td>
          </tr>

          {countData.array_values_incomp.length === 0 ? (
            <td colSpan={15}>
              <b>No data available</b>
            </td>
          ) : (
            countData.array_values_incomp.map((element, index) => (
              <tr key={index} style={{
                background: element.durationInSec > subjectDuration ? "rgba(241 ,149 ,149 , 0.5)":element.timeextended > 0 ? `${timeExtendedColor}` : 'inherit'
              }}>
                <td>{index + 1}</td>
                <td>{element.centre_code}</td>
                <td>{element.mem_no}</td>
                <td>{element.Time[0].start_time}</td>
                <td>
                  {element.Time[0].end_time ? element.Time[0].end_time : "NA"}
                </td>
                <td>{element.Time[0].total_response_count}</td>
                <td>{element.duration}</td>
                <td>{element.timeextended}</td>
                <td>{element.attemptqpcount}</td>
              </tr>
            ))
          )}
        </table>
        <h6 className="mt-3">Absent Candidate Details</h6>
        <table
          className="mt-3 table-bordered table-to-export"
          style={{ width: "100%", fontSize: "15px" }}
          border="1"
          cellPadding={2}
          cellSpacing={0}
        >
          <tr className="greybluetext10">
            <td>
              <b>S.No.</b>
            </td>
            <td>
              <b>Centre Code</b>
            </td>
            <td>
              <b>Roll no</b>
            </td>
            <td>
              <b>Start Time</b>
            </td>
            <td>
              <b>End Time</b>
            </td>
            <td>
              <b>Response Count</b>
            </td>
            <td>
              <b>Duration (H:M:S)</b>
            </td>
            {countData.GETSUBJECTSET.score === "Y" && (
              <td>
                <b>Score</b>
              </td>
            )}
            {countData.GETSUBJECTSET.score === "Y" && (
              <td>
                <b>Score</b>
              </td>
            )}
            <td>
              <b>Extended&nbsp;Time (Minutes)</b>
            </td>
            <td>
              <b>Attempted Questions Count</b>
            </td>
          </tr>

          {countData.array_values_absenties.length === 0 ? (
            <td colSpan={15}>
              <b>No data available</b>
            </td>
          ) : (
            countData.array_values_absenties.map((element, index) => (
              <tr key={index}>
                <td>
                  <div>{index + 1}</div>
                </td>
                <td>
                  <div>{element.centre_code}</div>
                </td>
                <td>{element.mem_no}</td>
                <td>{element.Time[0].start_time}</td>
                <td>
                  {element.Time[0].end_time ? element.Time[0].end_time : "NA"}
                </td>
                <td>{element.Time[0].total_response_count}</td>
                <td>{element.duration}</td>
                <td>{element.timeextended}</td>
                <td>{element.attemptqpcount}</td>
              </tr>
            ))
          )}
        </table>
        <button className="mt-3" onClick={downloadExcel} style={{width:"20%",padding:"5px"}} >Download Excel</button>
      </div>
      <style>
      </style>
    </div>
    
  );
};
export default CandidateDurationReport;
