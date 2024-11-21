import React, { useState } from 'react';
import './ReportTable.css'; // Import CSS for styling
import AttendanceReport from './AttendanceReport'; 
import IncompleteReport from './IncompleteReport'; 
import TimejustificationReport from './TimejustificationReport'; 
import TrackingfeedReport from './TrackingfeedReport'; 
import CandidateReport from './CandidateReport'; 
import CandidateDurationReport from './CandidateDurationReport'; 
import ExtendBulkTime from './ExtendBulkTime';
import ChangeMedium from './ChangeMedium';
import BulkTimeExtension from './BulkTimeExtension';
import GraceTimeExtension from './GraceTimeExtension';
import ImageDownload from './ImageDownload';
import DBPatch from './DBPatch';



const examReports = [
    { id: 1, name: 'Attendance Report' },
    { id: 2, name: 'Incomplete Status Report' },
    { id: 3, name: 'Candidate Report' },
    { id: 4, name: 'Time Justification Report' },
    { id: 5, name: 'Candidate Duration Report' },
    { id: 6, name: 'Tracking Report' },
    // { id: 7, name: 'Exam Closure Summary' },
  
  ];

const bioReports = [
{ id: 1, name: 'API Service'},
{ id: 2, name: 'Seat Allocation'},
{ id: 3, name: 'Skip Validation' },

];

const miscellaneousReports = [
// { id: 1, name: 'Change Bulk Time Slot'},
{ id: 2, name: 'Change Medium'},
// { id: 3, name: 'Candidate Score generation'}, 
{ id: 4, name: 'Image Download'},
{ id: 5, name: 'DB Patch update'},
{ id: 6, name: 'Bulk Time Extension'},
// { id: 7, name: 'Scanner Upload'},
{ id: 8, name: 'Grace Time Extension'}, 

];

// Utility function to split reports into chunks
const chunkArray = (array, size) => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

function formatDate(dateString) {
    return new Date(dateString).toISOString().split('T')[0];
  }

const ReportTable = ({ type, onReportSelect }) => {
  const [selectedReport, setSelectedReport] = useState(null);
  // const [attendanceReport, setData] = useState([]);
  // const [incompletestatusReport, setDataIncomplete] = useState([]);
  

  const handleReportClick = async (report) => {
    setSelectedReport(report);
    onReportSelect(report);
    // alert(report.id);
    // const exam_date = '2024-09-16';
    // if(report.id==1) {
    //     const response = await fetch(`http://localhost:5000/attendance-report/1`);
    //     const attendanceReport = await response.json();
    //     // alert(attendanceReport);
    //     setData(attendanceReport); // Update state with the fetched data
    //   }else if(report.id==2){
    //     const response = await fetch(`http://localhost:5000/incomplete-status-report/2`);
    //     const incompletestatusReport = await response.json();
    //     // alert(incompletestatusReport);
    //     setDataIncomplete(incompletestatusReport); // Update state with the fetched data
    //   }
  };

  const handleClosePopup = () => {
    setSelectedReport(null);
    onReportSelect(null);

  };

  // Split reports into chunks of 4 per row
  let reports = [];
  if (type === 'exam') {
    reports = examReports;
  } else if (type === 'biometric') {
    reports = bioReports;
  } else if (type === 'miscellaneous') {
    reports = miscellaneousReports;
  }
  const rows = chunkArray(reports, 2);

  return (
    <div className="report-table-container">
      <table className="report-table">
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((report) => (
                <td key={report.id} onClick={() => handleReportClick(report)}>
                  {report.name}
                </td>
              ))}
              {row.length < 4 && (
                <td colSpan={6 - row.length}></td> // Add empty cells if row has less than 4 items
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {selectedReport && (
        <div className="popup">
          <div className="popup-content" style={{overflow:"auto"}}>
            <span className="close-btn" onClick={handleClosePopup}>&times;</span>
            <h4>{selectedReport.name}</h4>
            {/* Exam Reports */}
                {type == 'exam' && selectedReport.id == 1 && <AttendanceReport />}
                {type == 'exam' && selectedReport.id == 2 && <IncompleteReport />}
                {type == 'exam' && selectedReport.id == 3 && <CandidateReport />}
                {type == 'exam' && selectedReport.id == 4 && <TimejustificationReport />}
                {type == 'exam' && selectedReport.id == 5 && <CandidateDurationReport />}
                {type == 'exam' && selectedReport.id == 6 && <TrackingfeedReport />} 

            {/* Miscellaneous */}
                {type == 'miscellaneous' && selectedReport.id == 1 && <ExtendBulkTime />}
                {type == 'miscellaneous' && selectedReport.id == 2 && <ChangeMedium />}
                {type == 'miscellaneous' && selectedReport.id == 6 && <BulkTimeExtension />}
                {type == 'miscellaneous' && selectedReport.id == 8 && <GraceTimeExtension />}
                {type == 'miscellaneous' && selectedReport.id == 4 && <ImageDownload />}
                {type == 'miscellaneous' && selectedReport.id == 5 && <DBPatch />}

          </div>
        </div>
      )}
    </div>
  );
};

export default ReportTable;
