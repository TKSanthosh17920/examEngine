import React, { useState } from "react";
import axios from "axios";

const CandidateReport = () => {
  const [rollNo, setRollNo] = useState("");
  const [examDetails, setExamDetails] = useState({});
  const [subjectDetails, setSubjectDetails] = useState({});
  const [isDivEnabled, setIsDivEnabled] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [memberAddress, setMemberAddress] = useState("");
  const [examTime, setExamTime] = useState("");
  const [strMedium, setStrMedium] = useState("");
  const [iwayAddress, setIwayAddress] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [totalMarks, setTotalMarks] = useState(0);
  const [passMark, setPassMark] = useState(0);
  const [iwayCentreCode, setIwayCentreCode] = useState("");
  const [dispExamDate, setDispExamDate] = useState("");
  const [scores, setScores] = useState("0");
  const [qnsSum, setQnsSum] = useState(0);
  const [quesIdsArr, setQuesIdsArr] = useState([]);
  const [ansQuestionId, setAnsQuestionId] = useState([]);
  const [ansQuesAnswer, setAnsQuesAnswer] = useState([]);
  const [arrDiffQID, setArrDiffQID] = useState([]);
  const [unAttQns, setUnAttQns] = useState(0);
  const [attQns, setAttQns] = useState(0);
  const [aQuestionsLength, setAQuestionsLength] = useState(0);
  const [questionTextArray, setQuestionTextArray] = useState([]);
  const [correctAnswerArray, setCorrectAnswerArray] = useState([]);
  const [markedAnswerArray, setMarkedAnswerArray] = useState([]);
  const [marksArray, setMarksArray] = useState([]);
  const [cAns, setCAns] = useState([]);
  const [mAns, setMAns] = useState([]);
  const [columnArray, setColumnArray] = useState([]);
  const alpha = ["A) ", "B) ", "C) ", "D) ", "E) "];

  const handleRollNo = async () => {
    const rollNum = document.getElementById("rollNo").value;
    setRollNo(rollNum);
    try {
      const res = await axios.get(
        `http://localhost:5000/candidate-report/${rollNum}`
      );
      setExamDetails({
        examCode: res.data.examCode,
        examName: res.data.examName,
      });
      setSubjectDetails({
        subjectCode: res.data.subjectCode,
        subjectName: res.data.subjectName,
      });
      setMemberName(res.data.memberName);
      setMemberAddress(res.data.memberAddress);
      setExamTime(res.data.iwayExamTime);
      setStrMedium(res.data.strMedium);
      setIwayAddress(res.data.iwayAddress);
      setInstitutionName(res.data.institutionName);
      setTotalMarks(res.data.totalMarks);
      setPassMark(res.data.passMark);
      setIwayCentreCode(res.data.iwayCentreCode);
      setDispExamDate(res.data.dispExamDate);
      setScores(res.data.scores);
      setQnsSum(res.data.qnsSum);
      setQuesIdsArr(res.data.quesIdsArr);
      setAnsQuestionId(res.data.ansQuestionId);
      setAnsQuesAnswer(res.data.ansQuesAnswer);
      setArrDiffQID(res.data.arrDiffQID);
      setUnAttQns(res.data.unAttQns);
      setAttQns(res.data.attQns);
      setAQuestionsLength(res.data.aQuestionsLength);
      setQuestionTextArray(res.data.questionTextArray);
      setCorrectAnswerArray(res.data.correctAnswerArray);
      setMarkedAnswerArray(res.data.markedAnswerArray);
      setMarksArray(res.data.marksArray);
      setCAns(res.data.cAns);
      setMAns(res.data.mAns);

      setIsDivEnabled(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="row mt-3">
        <div className="col-md-6">Roll No:</div>
        <div className="col-md-6">
          <input
            type="text"
            id="rollNo"
            placeholder=" Membership Number"
          ></input>
        </div>
      </div>
      <span style={{color: "red", fontSize: "13px;"}}>Enter the Completed membership number</span>
<br></br>
      <button
        type="submit"
        className="mt-3"
        style={{
          width: "7vw",
          padding: "5px",
          fontSize: "15px",
        }}
        onClick={handleRollNo}
      >
        Submit
      </button>

      <div
        style={{
          display: isDivEnabled ? "block" : "none",
          opacity: isDivEnabled ? 1 : 0.5,
          pointerEvents: isDivEnabled ? "auto" : "none",
          transition: "opacity 0.5s ease",
        }}
      >
        <table
          className="mt-3 table-bordered table-to-export table-striped"
          style={{ width: "100%", fontSize: "15px" }}
          border="1"
          cellPadding={2}
          cellSpacing={0}
        >
          <tr>
            <td colspan={6} className="greybluetext10" bgcolor="#D1E0EF">
              <b className="arial11a">Candidate Report</b>
            </td>
          </tr>
          <tr>
            <td className="greybluetext10">
              <b>Name </b>
            </td>
            <td className="greybluetext10">
              <b> : </b>
            </td>
            <td className="greybluetext10" colspan={4}>
              {" "}
              {memberName}
            </td>
          </tr>
          <tr>
            <td className="greybluetext10">
              <b>Address </b>
            </td>
            <td className="greybluetext10">
              <b> : </b>
            </td>
            <td className="greybluetext10" colspan={4}>
              {" "}
              {memberAddress}{" "}
            </td>
          </tr>
          <tr>
            <td className="greybluetext10">
              <b>Exam </b>
            </td>
            <td className="greybluetext10">
              <b> : </b>
            </td>
            <td className="greybluetext10" colspan={4}>
              {" "}
              {examDetails.examName}{" "}
            </td>
          </tr>
          <tr>
            <td className="greybluetext10">
              <b>Subject </b>
            </td>
            <td className="greybluetext10">
              <b> : </b>
            </td>
            <td className="greybluetext10" colspan={4}>
              {" "}
              {subjectDetails.subjectName}{" "}
            </td>
          </tr>
          <tr>
            <td className="greybluetext10">
              <b>Exam Date </b>
            </td>
            <td className="greybluetext10">
              <b> : </b>
            </td>
            <td className="greybluetext10" colspan={4}>
              {" "}
              {dispExamDate}{" "}
            </td>
          </tr>
          <tr>
            <td className="greybluetext10">
              <b>Exam Time </b>
            </td>
            <td className="greybluetext10">
              <b> : </b>
            </td>
            <td className="greybluetext10" colspan={4}>
              {" "}
              {examTime.substring(0, 5)} hrs
            </td>
          </tr>
          <tr>
            <td className="greybluetext10">
              <b>Venue </b>
            </td>
            <td className="greybluetext10">
              <b> : </b>
            </td>
            <td className="greybluetext10" colspan={4}>
              {" "}
              {iwayAddress}{" "}
            </td>
          </tr>
          <tr>
            <td className="greybluetext10">
              <b>Medium </b>
            </td>
            <td className="greybluetext10">
              <b> : </b>
            </td>
            <td className="greybluetext10" colspan={4}>
              {" "}
              {strMedium}{" "}
            </td>
          </tr>
          {/* <tr>
            <td className="greybluetext10">
              <b>Institution </b>
            </td>
            <td className="greybluetext10">
              <b> : </b>
            </td>
            <td className="greybluetext10" colspan={4}>
              {" "}
              {institutionName}{" "}
            </td>
          </tr> */}
          <tr>
            <td className="greybluetext10" width="20%">
              <b>Total No. of Questions </b>
            </td>
            <td className="greybluetext10" width="5%">
              <b> : </b>
            </td>
            <td className="greybluetext10" width="25%">
              {" "}
              {qnsSum}{" "}
            </td>
            <td className="greybluetext10" width="20%">
              <b>Total Marks </b>
            </td>
            <td className="greybluetext10" width="5%">
              <b> : </b>
            </td>
            <td className="greybluetext10" width="25%">
              {" "}
              {totalMarks}{" "}
            </td>
          </tr>
          <tr>
            <td className="greybluetext10">
              <b>No. of Attempted Questions </b>
            </td>
            <td className="greybluetext10">
              <b> : </b>
            </td>
            <td className="greybluetext10"> {attQns} </td>
            <td className="greybluetext10">
              <b>No. of Unattempted Questions </b>
            </td>
            <td className="greybluetext10">
              <b> : </b>
            </td>
            <td className="greybluetext10"> {unAttQns} </td>
          </tr>
          <td colspan={6} className="greybluetext10" bgcolor="#D1E0EF">
            <b className="arial11a">Questions & Answers Report</b>
          </td>
          {aQuestionsLength !== 0 && (
            <tr>
              <td colSpan={6}>
                <table
                  align="center"
                  width="100%"
                  cellPadding={2}
                  cellSpacing={2}
                >
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Answers</th>
                      <th>S.No</th>
                      <th>Answers</th>
                      <th>S.No</th>
                      <th>Answers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questionTextArray.map((questionText, index) => {
                      // Only create a new row for every third item
                      if (index % 3 === 0) {
                        return (
                          <tr key={index}>
                            {[0, 1, 2].map((offset) => {
                              const currentIndex = index + offset;
                              if (currentIndex < questionTextArray.length) {
                                return (
                                  <>
                                    <td className="greybluetext10">
                                      {currentIndex + 1}
                                    </td>
                                    <td className="greybluetext10">
                                      {markedAnswerArray[currentIndex] !== "" &&
                                      markedAnswerArray[currentIndex] !==
                                        "NULL" ? (
                                        strMedium === "HINDI" ? (
                                          <span className="ans">
                                            {mAns[currentIndex]}
                                          </span>
                                        ) : (
                                          <b>{mAns[currentIndex]}</b>
                                        )
                                      ) : (
                                        <span> - </span>
                                      )}
                                    </td>
                                  </>
                                );
                              } else {
                                return (
                                  <>
                                    <td className="greybluetext10"> - </td>
                                    <td className="greybluetext10"> - </td>
                                  </>
                                );
                              }
                            })}
                          </tr>
                        );
                      }
                      return null; // Skip if not at the start of a new row
                    })}
                  </tbody>
                </table>
              </td>
            </tr>
          )}
        </table>
      </div>
    </div>
  );
};
export default CandidateReport;
