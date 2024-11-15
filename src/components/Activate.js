import React, { useState, useEffect } from 'react';
import { startPm2Process,roundDownToNearestFive, handleClear } from './utils';
import ReusablePasswordDialog from './ReusablePasswordDialog';
import axios from 'axios';
import './Activate.css'; 
import { checkTableFunction } from './utils'; // Import the utility function
import { Switch, Card, CardContent, Typography, Box } from '@mui/material';
import ReportTable from './ReportTable';
// Newly added
import ExamClosureSummary from './ExamClosureSummary'; 
// import ExamClosureSummary, { handleSubmit } from './ExamClosureSummary';
// Newly added

function Activate({ username, examData, serialNumber, onButtonQpStatus }) {
  const [loading, setLoading] = useState(true);
  const [buttonText, setButtonText] = useState('Data Download');
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [buttonStyle, setButtonStyle] = useState('button-import active-btn');
  const [qpStatus, setQpStatus] = useState(0); // State to store the number of rows in qp_download
  const [slotCount, setSlotCount] = useState(0);
  const [clearStyles, setClearButtonStyles] = useState('active-btn');
  const [buttonTexts, setButtonTexts] = useState(['Import QP', 'Import QP', 'Import QP']); // Default texts
  const [buttonStyles, setButtonStyles] = useState(['button-import active-btn', 'button-import active-btn', 'button-import active-btn']); // Default styles
  const [actButtonDisabled, setactButtonDisabled] = useState([false, false, false]); // Array to manage disabled state for each button
  const [closureButtonDisabled, setactClosureButtonDisabled] = useState([true, true, true]); // Default texts
  const [batchStyles, setBatchButtonStyles] = useState(['active-btn-disabled','active-btn-disabled','active-btn-disabled']);
  const [actLoading, setactLoading] = useState([false, false, false]); // Array to manage disabled state for each button
  const [dialogOpen, setDialogOpen] = useState(false);
  const [batchact, setBatchAct] = useState('');
  const [passwordtype, setPasswordType] = useState(''); 
  const [error, setError] = useState('');
  const [showCardOne, setShowCardOne] = useState(false);
  const [showCardTwo, setShowCardTwo] = useState(false);
  const [showCardThree, setShowCardThree] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  // Newly added
  const [showExamClosureSummary, setShowExamClosureSummary] = useState(false);

  const handleReportClick = () => {
    handleClosePopup();
    if (examData.length > 0) {
      const zone_code_val = examData[examData.length - 1].zone_code;
      handleClosure('day', zone_code_val);
    } else {
      alert("No exam data available!");
    }
  };
  
  const handleClosePopup = () => {
    setShowExamClosureSummary(null);

  };

 
   // Newly added

  const handleReportSelect = (report) => {
    setSelectedReport(report); // Update state in parent component
    console.log('Selected Report:', report); // You can also perform other actions here
    
  };
 
  const handleToggleOne = () => {
    setShowCardOne(!showCardOne);
    if (!showCardOne) {
      setShowCardTwo(false);
      setShowCardThree(false);
    }
  };

  const handleToggleTwo = () => {
    setShowCardTwo(!showCardTwo);
    if (!showCardTwo) {
      setShowCardOne(false);
      setShowCardThree(false);
    }
  };

  const handleToggleThree = () => {
    setShowCardThree(!showCardThree);
    if (!showCardThree) {
      setShowCardOne(false);
      setShowCardTwo(false);
    }
  };
  const handleOpenDialog = (batch) => {
    setBatchAct(batch)
    setDialogOpen(true);
};

const handleCloseDialog = () => {
    setDialogOpen(false);
    setactLoading([false, false, false]);
};

const handleSubmitPassword = (password) => {
    // Handle password submission here
    console.log('Activation Password submitted:', password);
    
};


 
const handleValidAccess = (vaaccess) => {
    if(vaaccess==1){
        // Handle password submission here
        handleActivation(qpStatus,batchact);
    } else if(vaaccess==2){
        // Handle password submission here
        handleBatchClosure(qpStatus,batchact);
    } else if(vaaccess==3){
        // Handle password submission here
        handleDayClosure(qpStatus,batchact);
    } else {
        alert('Access Failed !')
    }
    
};
    const examDataTotal = examData.length;
    const col=(12/examData.length);
    const text = '';
    let candidate_cnt = 0;

    // Loop through examData to calculate the total number of candidates
    examData.forEach((data) => {
        candidate_cnt += data.totalScheduled;
    });

    // Calculate the average number of candidates
    const avg_cand_cnt = examData.length > 0 ? candidate_cnt / examData.length : 0;
     
    const handleCheckTable = async (qpStatus, batch) => {
         

        try {
          const batch_closure = await checkTableFunction('batchwise_closure_summary');
          
          if(qpStatus==5){
             
                handleFileUpload(qpStatus, batch);
         
          }else if(qpStatus==6){
            if(batch_closure==1){
                handleFileUpload(qpStatus, batch);
                 
            }else{
                return alert('Kindly do previous batch closure!')
            }
          }else if(qpStatus==7){
            if(batch_closure==2){
                handleFileUpload(qpStatus, batch); 
                            
            }else{
                return alert('Kindly do previous batch closure!')
            }
        }
        
        } catch (err) {
          console.log('Error checking table');
           
        }
    };

  useEffect(() => {
    const fetchSlotCount = async () => {
      try {
        const response = await fetch(`http://localhost:5000/exam-slot-count`);
        const data = await response.json();
        setSlotCount(data.slotCount);
      } catch (error) {
        console.error('Error fetching slot count:', error);
      }
    };

    fetchSlotCount();
  }, [qpStatus]);
  useEffect(() => {
 
    // Pass the buttonDisabled state to the parent whenever it changes
    onButtonQpStatus(qpStatus);
    
    // Fetch the qp_download status when the component loads
    const fetchQpStatus = async () => {
// console.log('act load',buttonTexts);
      try {
        const response = await fetch('http://localhost:5000/qp-status');
        const data = await response.json();
        setQpStatus(data.count); // Store the number of rows in qp_download
        if(data.count==0){
            
            localStorage.removeItem('user');
            window.location.reload(); // Refresh the page
         }
         const batch_closure = await checkTableFunction('batchwise_closure_summary');
         
         let texts = [];
         let styles = [];
         let batchstyles = [];
         let disabled = [];
         let batchdisabled = [];
        //  let loader = [];
         if (data.count === 5) {
            texts = ['Import QP', 'Import QP', 'Import QP'];
            styles = ['button-import active-btn', 'button-import disabled active-btn', 'button-import disabled active-btn'];
            batchstyles = ['active-btn disabled','active-btn disabled','active-btn disabled'];
            disabled = [false, true, true]; // Example disabled states
            batchdisabled = [true,true,true]; // Example disabled states

          } else if (data.count === 6) {
            texts = ['Activated', 'Import QP', 'Import QP'];
            styles = ['button-activated disabled active-btn', 'button-import  active-btn', 'button-import disabled active-btn'];
            disabled = [true, false, true]; // Example disabled states
            if(batch_closure==1){
                batchstyles = ['button-activated  active-btn disabled','active-btn disabled','active-btn disabled'];
                // batchdisabled = [true,true,true]; // Example disabled states
            }else{
                batchdisabled = [false,true,true]; // Example disabled states
                batchstyles = ['active-btn','active-btn disabled','active-btn disabled'];
            }

          } else if (data.count === 7) { 
            // alert('ss');
            texts = ['Activated', 'Activated', 'Import QP'];
            styles = ['button-activated disabled active-btn', 'button-activated disabled active-btn', 'button-import active-btn'];
            disabled = [true, true, false]; // Example disabled states

            if(batch_closure==2){
                batchstyles = ['button-activated  active-btn disabled','button-activated active-btn disabled','active-btn disabled'];
                // batchdisabled = [true,true,true]; // Example disabled states
            }else{
                batchdisabled = [true,false,true]; // Example disabled states
                batchstyles = ['button-activated  active-btn disabled','active-btn','active-btn disabled'];
            }

          } else  if (data.count === 8)  {
            texts = ['Activated', 'Activated', 'Activated'];
            styles = ['button-activated disabled active-btn', 'button-activated disabled active-btn', 'button-activated disabled active-btn'];
            disabled = [true, true, true]; // Example disabled states
            if(batch_closure==2){
                batchstyles = ['button-activated  active-btn disabled','button-activated active-btn disabled','button-activated active-btn disabled'];
                // batchdisabled = [true,true,true]; // Example disabled states
            }else{
                batchdisabled = [true,true,false]; // Example disabled states
                batchstyles = ['button-activated  active-btn disabled','button-activated  active-btn disabled','active-btn'];
            }
        }
          setButtonStyles(styles);
          setButtonTexts(texts);
          setactButtonDisabled(disabled);
          setBatchButtonStyles(batchstyles)
          setactClosureButtonDisabled(batchdisabled);
          
      } catch (error) {
        console.error('Error fetching QP status:', error);
      }
    };

    fetchQpStatus(); // Call the function to fetch the status
     // Set up an interval to fetch status every 2 seconds
     const intervalId = setInterval(fetchQpStatus, 2000);

     // Clean up the interval on component unmount
     return () => clearInterval(intervalId);

     
  }, [qpStatus, onButtonQpStatus]);

  
 

  const insertBase = async (status_msg) => {

    // Example usage
    const data = {
        centre_code: username,
        serverno: 'a',
        download_sec: status_msg
    };
    // alert(data.centre_code);
    try {
      const response = await fetch('http://localhost:5000/insert-base', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (response.ok) {
        const result = await response.text();
        console.log('Data inserted successfully:', result);
        // setButtonDisabled(false);
      } else {
        console.error('Failed to insert data:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };



  const handleActivation = async (qpStatus,batch) => {

    let status;
  
      // Determine the status based on qpStatus
      if (qpStatus === 1) {
        status = 'Base';
        setButtonText('Downloading...');
        setButtonDisabled(true);
        setClearButtonStyles('active-btn-disabled');
      } else if (qpStatus === 2) {
        status = username;
        setButtonText('Downloading...');
        setButtonDisabled(true);
        setClearButtonStyles('active-btn-disabled');

      } else 
      if (qpStatus === 5) {
        status = 'Act';
      } else if (qpStatus === 6) {
        status = 'Act';
      } else if (qpStatus === 7) {
        status = 'Act';
      }

    
      setLoading(true);
    
     
    setButtonStyle('button-activating active-btn');
    // setClearButtonStyles('active-btn-disabled');
    
    try {
        setactLoading([false, false, false]);
      const response = await fetch(`http://localhost:5000/activate/${status}/${batch}`, {
        method: 'POST',
      });
//   if (qpStatus === 5) {
//             setButtonTexts(['Activating', 'Import QP', 'Import QP']);
//         } else if (qpStatus === 6) {
//             setButtonTexts(['Activated', 'Activating', 'Import QP']);
//         }
      if (response.ok) {


        if(qpStatus==1){
            insertBase('Base QP');
            // setLoading(true);
            setButtonText('Download Centre QP');
            setClearButtonStyles('active-btn');
            setButtonDisabled(false);
            setButtonStyle('button-data-download active-btn');

        } else if(qpStatus==2){
            // console.log('Centre QP Done!');
            insertBase('Centre QP');
            setButtonText('Download Photos');
            setClearButtonStyles('active-btn');
            setButtonDisabled(false);
            setButtonStyle('button-data-download active-btn');
 
        } else if (qpStatus === 5) {
            insertBase('Activated-11:00:00');
          } else if (qpStatus === 6) {
            insertBase('Activated-15:00:00');


          } 
  
        // Start the PM2 process using the new function
        await startPm2Process();
      } else {

        alert('QP Activation Failed.');
        setButtonText('Import QP');
        setButtonStyle('button-import active-btn');
        // // setButtonTexts(['Import QP', 'Import QP', 'Import QP']);
        // if (qpStatus === 5) {
        //     setButtonTexts(['Activating', 'Import QP', 'Import QP']);
        // } else if (qpStatus === 6) {
        //     setButtonTexts(['Activated', 'Activating', 'Import QP']);
        // }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while uploading the file.');
      setButtonText('Data Download ');
      setButtonStyle('button-import active-btn');

    } finally {
      setLoading(false);
     
    }
  };
 

 
  const handleFileUpload = async (qpStatus, batch) => {
 
    try {
      let status;
      setLoading(true);
  
      switch (qpStatus) {
        case 1:
            status = 'Base';
            // setButtonText('Downloading...');
            // setButtonStyle('button-data-download active-btn active-disabled');
            break;
        case 2:
            
            setButtonText('Downloading....');
            setButtonDisabled(true);
            setClearButtonStyles('active-btn-disabled');
            setButtonStyle('button-data-download active-btn active-disabled');
            status = username;
            break;
        case 3:
            setButtonText('Downloading photo...');
            setClearButtonStyles('active-btn-disabled');
            setButtonDisabled(true);
            setButtonStyle('button-data-download active-btn active-disabled');
            status = `${username}_photo`;
            break;
        case 4:
            setButtonText('Downloading sign...');
            setButtonDisabled(true);
            setButtonStyle('button-data-download active-btn active-disabled');
            setClearButtonStyles('active-btn-disabled');

            status = `${username}_sign`;
            break;
        case 5:
            status = 'Act';
            setButtonTexts(['Activating', 'Import QP', 'Import QP']);

            setactLoading([true, false, false]);
            break;
        case 6:
            status = 'Act';
            setButtonTexts(['Activated','Activating','Import QP']);

            setactLoading([false, true, false]);

            break;
        case 7:
            status = 'Act';
            setactLoading([false, false, true]);
            
            break;
        default:
          console.error('Unhandled QP Status:', qpStatus);
          return;
      }
  
      const response = await fetch(`http://localhost:5000/download-zip/${status}/${batch}`);
      
      const text = await response.text();
      console.log('resppp',batch);
  
      if ([1, 2].includes(qpStatus)) {

        handleActivation(qpStatus, batch);

        
      } else if ([5, 6, 7].includes(qpStatus)) {

        // handleActivation(qpStatus, batch);
        setPasswordType('activation')
        handleOpenDialog(batch);
        
      } else if (qpStatus === 3) {
        setButtonStyle('button-activating active-btn');
        insertBase('Photo');
        setButtonText('Download Sign');
        setButtonDisabled(false);
        setButtonStyle('button-data-download active-btn');
        setLoading(false);
      } else if (qpStatus === 4) {
        setButtonStyle('button-activating active-btn');
        insertBase('Sign');
        setButtonText('Import QP');
        setButtonStyle('button-import active-btn');
        setButtonDisabled(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleClosure = async (type, batch) => {
    console.log('batch cnt', batch);
    
    try {
        // Call the backend API to check if the batch has an entry
        const response = await axios.get(`http://localhost:5000/check-batch-closure/${batch}`);
        const { exists, count } = response.data;
        
        if (!exists) {
            console.log(`Batch closure entry found with count: ${count}`);
            // Proceed with your logic
            if (type === 'batch') {
                setPasswordType('batchclosure');
            } else if (type === 'day') {
                setPasswordType('dayclosure');
            }
            handleOpenDialog(batch);
        } else {
            console.log('No entry found for this batch');
            alert('Batch Closure has been already done!');
            // Optionally, show a message or take alternative action if no entry is found
        }
    } catch (err) {
        console.error('Error checking batch closure:', err);
    }
};

  const handleDayClosure = async (qpStatus, batch) => {

    try {
        const hostIp = '172.17.109.2';
        // Set loading to true if using a loading state
        setLoading(true);
          
        // Make GET request to batch closure API
        const response = await axios.get(`http://localhost:5000/handleDayClosure/${batch}/${hostIp}/${serialNumber}/${username}`);
    console.log('respppp',response.statusText);
        if(response.statusText=='OK'){
           
              // Display alert on successful batch closure
              alert(`Batch ${batch} completed. Day closure done!`);
              
               
              
        } 
      } catch (err) {
        // Handle error
        console.error('Error:', err);
        setError('Failed to process batch closure. Please try again.');
        alert('Failed to process batch closure. Please try again.');
      } finally {
        // Reset loading state to false if applicable
        setLoading(false);
      }

 

  };

  const handleBatchClosure = async (qpStatus, batch) => {
    
    try {
      const hostIp = '172.17.109.2';
      // Set loading to true if using a loading state
      setLoading(true);
        
      // Make GET request to batch closure API
      const response = await axios.get(`http://localhost:5000/handleBatchClosure/${batch}/${hostIp}/${serialNumber}/${username}`);
  console.log('respppp',response.statusText);
      if(response.statusText=='OK'){
         
            // Display alert on successful batch closure
            alert(`Batch ${batch} closure done!`);
            
             
            
      } 
    } catch (err) {
      // Handle error
      console.error('Error:', err);
      setError('Failed to process batch closure. Please try again.');
      alert('Failed to process batch closure. Please try again.');
    } finally {
      // Reset loading state to false if applicable
      setLoading(false);
    }
  };
  return (
    <div>
      <center>
      <div className="card-container">
        {/* <div className="card"> */}
        {/* {(!showCardOne && !showCardTwo && !showCardThree) && ( */}
        <div className={`card ${(!showCardOne && !showCardTwo && !showCardThree) ? 'card-show' : 'card-hide'}`}>
            {qpStatus < 5 ? ( <h4>Data Download </h4>) : (<h6>Activate Exam  </h6>)  }
            {/* <p>Status: {qpStatus} rows available in QP Download</p>   */}
          <hr/>
           
            <>
            <div className='msg-space'>
                {qpStatus == 2 ? (
                    loading ? ( <center> <div className="loader"></div> </center> ) : (
                    <p className='fade-text'>You have <span style={{fontSize:"25px",fontWeight:"700"}}>{slotCount}</span> <b>Exam Slots.</b></p>
                    )
                ) : qpStatus == 3 ? (
                    loading ? (<center> <div className="loader"></div> </center> ) : (
                        <p className='fade-text-1' style={{left:"10px !important"}}>You have <b>average</b> <span style={{fontSize:"25px",fontWeight:"700"}}>{roundDownToNearestFive(avg_cand_cnt)}+</span> <b>Candidates</b> in each batch.</p>
                    )
                ) : (qpStatus >= 5) && (
                    <div className='row' style={{ marginBottom: "-50px", zIndex: "10" }}>
                      {examData.map((data, index) => (
                        <div key={index} className={`col-md-${col}`}>
                          {actLoading[index] ? (
                            <center><div className={`loader${index + 1}`}></div></center>
                          ) : (
                            <>
                              <h5>{`Batch ${index + 1}`}</h5>
                              <h6>{data.zone_code}</h6>
                            </>
                          )}
                          <button
                            onClick={() => handleCheckTable(qpStatus, data.zone_code)}
                            disabled={actButtonDisabled[index]}
                            style={{ width: "100%" }}
                            className={buttonStyles[index]}
                          >
                            {buttonTexts[index]}
                          </button>
                            {examDataTotal==index+1 ? (
                            <>
                                {/* <button
                                onClick={() => handleClosure('day', data.zone_code)}
                                // Newly added
                                onClick={() => setShowExamClosureSummary(true)}
                                // Newly added
                                disabled={closureButtonDisabled[index]} 

                                style={{ width: "100%" }}
                                className={batchStyles[index]}
                                >
                                    Day Closure
                                </button> */}
                                <button
            onClick={
              qpStatus=='7'
                    ? () => handleClosure('day', data.zone_code) // First condition
                    : () => setShowExamClosureSummary(true) // Second condition
            }
            disabled={closureButtonDisabled[index]} // Ensure the button is clickable
            style={{ width: "100%" }}
            className={batchStyles[index]}
        >
            Day Closure
        </button>
                            </>
                            ):(
                            <>
                            <button
                                onClick={() => handleClosure('batch',data.zone_code)}
                                disabled={closureButtonDisabled[index]} 
                                style={{ width: "100%" }}
                                className={batchStyles[index]}
                            >
                             
                                Batch {index + 1} Closure
                            </button>
                            </>
                            )}
                        </div>
                      ))}
                     
                    </div>
                  )}
                  
                </div>
                
            </>
         
          {(qpStatus < 5) ? (
            <>
                <button onClick={() => handleFileUpload(qpStatus)} disabled={buttonDisabled} className={buttonStyle} >
                                    {buttonText}            
                </button>
                <button className={clearStyles} disabled={buttonDisabled}  onClick={handleClear}>Clear</button>
            </>
          ):(<></>)}
            
          {text}
        </div>
        <div className={`card ${showCardOne ? 'card-show' : 'card-hide'}`}>
             <h5>Exam Reports </h5>
                
            <hr/>
            {/* <h6><p>Status: {qpStatus} rows available in QP Download</p>  </h6> */}
            <ReportTable type='exam' onReportSelect={handleReportSelect}/>
        </div>

        <div className={`card ${showCardTwo ? 'card-show' : 'card-hide'}`}>
             <h5>Biometric Activities </h5>
                
            <hr/>
            {/* <h6><p>Status: {qpStatus} rows available in QP Download</p>  </h6> */}
            <ReportTable type='biometric' onReportSelect={handleReportSelect}/>
        </div>

        <div className={`card ${showCardThree ? 'card-show' : 'card-hide'}`}>
             <h5>Miscellaneous Activities </h5>
                
            <hr/>
            {/* <h6><p>Status: {qpStatus} rows available in QP Download</p>  </h6> */}
            <ReportTable type='miscellaneous' onReportSelect={handleReportSelect}/>
        </div>
        
        {selectedReport==null ? (
            <div className="switch-container row">
            <div className='col-md-4'>
            <Box className="switchbox  " display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography fontSize="12px">Reports</Typography>
              <Switch
                checked={showCardOne}
                onChange={handleToggleOne}
                color="primary"
                sx={{ ml: 2 }}
              />
            </Box>
            </div>
            <div className='col-md-4'>
            <Box className="switchbox " display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography fontSize="12px">Biometric</Typography>
              <Switch
                checked={showCardTwo}
                onChange={handleToggleTwo}
                color="primary"
                sx={{ ml: 2 }}
              />
            </Box>
            </div>
            <div className='col-md-4'>
            <Box className="switchbox " display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography fontSize="12px">Miscellaneous</Typography>
              <Switch
                checked={showCardThree}
                onChange={handleToggleThree}
                color="primary"
                sx={{ ml: 2 }}
              />
            </Box>
            </div>
          </div>
        ):(<></>)}
            
        </div>
       {showExamClosureSummary && <div className="popup" style={{top:"30px",left:"250px"}}>
          <div className="popup-content" style={{overflow:"auto"}}>
            <span className="close-btn" onClick={handleClosePopup}>&times;</span>
            <h4>Exam Closure Summary</h4>
            {/* {examData.map((data, index) => ( */}
            {/* <ExamClosureSummary onSubmitComplete={handleClosure('day', '1')} /> */}
            {/* ))} */}
            <ExamClosureSummary onSubmitSuccess={handleReportClick} />
            
          </div>
        </div>
} 
      </center>

      <ReusablePasswordDialog
                    open={dialogOpen}
                    onClose={handleCloseDialog}
                    validAccess={handleValidAccess}
                    onSubmit={handleSubmitPassword}
                    title="Enter Activation Password"
                    passwordtype={passwordtype}
                    batch={batchact}
                    />
    </div>
  );
}

export default Activate;
