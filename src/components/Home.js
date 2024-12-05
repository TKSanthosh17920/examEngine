import React, { useState, useEffect } from 'react';
import Login from './Login';
import ErrorBoundary from './ErrorBoundary';
import ServerStatus from './ServerStatus';
import { useNavigate } from 'react-router-dom';
import { useDispatch,useSelector } from 'react-redux';
import { setFormattedDate } from '../redux/dateSlice';
import sifyLogo from './assets/images/sify.png';
import './Home.css';
import axios from 'axios';

import studentDefault from './assets/images/student.png';
import signDefault from './assets/images/signature.png';
import { formatTime,fetchClientIp } from './utils';

const Main = () => {
  const [user, setUser] = useState(null);
  const [candidateInfo, setCandidateInfo] = useState([]);
  const [examSettings, setExamSettings] = useState([]);
  const dispatch = useDispatch();
  const formattedDate = useSelector((state)=> state.date.formattedDate);
  const [imageExists, setImageExists] = useState(false);
  const [imagePUrl, setPImageUrl] = useState('');
  const [imageSUrl, setSImageUrl] = useState('');
  const [testStatus, setTestStatus] = useState(null);
  const [hostIp, setHostIp] = useState('');
  const navigate = useNavigate();
  const [mediumSettings, setMediumSettings] = useState({});
  const [subjectLanguages, setSubjectLanguages] = useState([]);
  // const [mediumCode, setMediumCode] = useState("");
  const [mediumCode, setMediumCode] = useState(
    sessionStorage.getItem('candidate-medium') || 'EN'
  );
  const [arrLang, setArrLang] = useState({});
  const [session, setSession] = useState({});

  const medium = sessionStorage.getItem('candidate-medium') || 'EN';

 
  const renderMediumCode = () => {
    if (session.ta_override != "Y") {
      if (mediumSettings.display_medium == "Y") {
        return mediumSettings.display_medium_dropdown == "Y" ? (
            <select
            id="langlist"
            className="listbox"
            name="lstmedium"
            value={medium}
            onChange={(e) => {
              const selectedMedium = e.target.value;
              setMediumCode(selectedMedium); // Update the state
              sessionStorage.setItem('candidate-medium', selectedMedium); // Store in sessionStorage
            }}
          >
            {subjectLanguages.map((langCode) => (
              <option key={langCode} value={langCode}>
                {arrLang[langCode]}
              </option>
            ))}
          </select>
          
        ) : (
          <>
            {arrLang[subjectLanguages[0]]}
            <input type="hidden" value={subjectLanguages[0]} name="lstmedium" />
          </>
        );
      } else {
        return <input type="hidden" value={subjectLanguages[0]} name="lstmedium" />;
      }
    } else if (mediumSettings.display_medium == "Y") {
      return <>{arrLang[session.mc]}</>;
    }
  
    return null; // Fallback return if no conditions are met
  };
  

  useEffect(() => {
    const getIp = async () => {
      try {
        const ip = await fetchClientIp();
        setHostIp(ip);
        console.log('Your IP address is:', ip);
      } catch (error) {
        console.error('Failed to fetch IP address:', error);
      }
    };

    getIp();
  }, []);
  const handleLogin = (username) => {
    setUser(username);
  };

  useEffect(() => {
    const fetchCandidateInfo = async () => {
      try {
        const response = await fetch(`http://localhost:5000/candidate_details/${user}`);
        const data = await response.json();
        // console.log(mediumCode);
        const newCandidateInfo = { 
            user: user, 
            candidate_name: data.CandidateName,
            address: data.Address, 
            exam_venue: data.examVenue,  
            exam_code: data.examCode, 
            subject_code: data.subjectCode, 
            subject_duration: data.subjectDuration,
            duration_prevent: data.durationPrevent, 
            display_sectionname: data.displaySectionname,
            display_score: data.displayScore,
            display_result: data.displayResult,
            exam_name: data.examName,  
            subject_name: data.subjectName, 
            exam_date: data.examDate, 
            question_paper_no: data.questionPaperNo,
            encryptKey: data.encryptKey,
            pass_mark: data.pass_mark,
            total_marks : data.total_marks,
            medium : mediumCode
           };
           // Store in sessionStorage
        // console.log('new-userrr',newCandidateInfo);

        // Clear existing data and set new data
        setCandidateInfo([newCandidateInfo]);
        // console.log('userr',candidateInfo[0]); 

        // dispatch(setFormattedDate(candidateInfo[0].exam_date))

        // Store in sessionStorage
        sessionStorage.setItem('candidateInfo', JSON.stringify(newCandidateInfo));
        sessionStorage.setItem('candidate-medium', mediumCode); 
        console.log("session"+sessionStorage.getItem('candidate-medium'))
          //  console.log(mediumCode)
      } catch (error) {
        console.error('Error fetching candidate info:', error);
      }
    };

    // alert(medium);

    const fetchExamSettings = async () => {
        console.log('exam settings 0');
        try {
        console.log('exam settings 1');

          const response = await fetch(`http://localhost:5000/api/exam-settings`);
          const data = await response.json();
          
          
            // Convert the object to a JSON string
            const jsonData = JSON.stringify(data);

            // Store it in sessionStorage
            sessionStorage.setItem('examSettings', jsonData);
          
        } catch (error) {
          console.error('Error fetching candidate info:', error);
        }
      };


    if (user) {
      fetchCandidateInfo();
      fetchExamSettings();
    }
  }, [user]);

  useEffect(() => {
    const fetchTestStatus = async () => {
            try {
                const response = await fetch(`http://localhost:5000/get-test-status/${user}/${hostIp}`); // Adjust query parameter as needed
                const data = await response.json();
                console.log('Fetched test status:', data); // Debugging statement
                setTestStatus(data.status);
            } catch (error) {
                console.error('Error fetching test status:', error);
                setTestStatus(null); // Default to no entry
            }
        };

        fetchTestStatus();
  },[user]);

    
  useEffect(() => {
    const checkImage = async () => {
        console.log('useeeeeee',user);
        try {
            const response = await axios.get(`http://localhost:5000/fetch-photo/${user}`, {
                responseType: 'blob' // important to get the image as a blob
            });
            setImageExists(true);
            const imageURL = URL.createObjectURL(response.data);
            setPImageUrl(imageURL); 
        } catch (error) {
            setImageExists(false);
            console.error('Image not found', error);
            
        }
    };

    const checkSImage = async () => {
        console.log('useeeeeee',user);
        try {
            const response = await axios.get(`http://localhost:5000/fetch-sign/${user}`, {
                responseType: 'blob' // important to get the image as a blob
            });
            setImageExists(true);
            const imageURL = URL.createObjectURL(response.data);
            setSImageUrl(imageURL); 
        } catch (error) {
            setImageExists(false);
            console.error('Image not found', error);
            
        }
    };

    checkImage();
    checkSImage();
}, [user]);
 

const handleClick = (e) => {
    e.preventDefault(); // Prevent the default anchor action
    console.log('test_status',testStatus);
    if (testStatus === 'C') {
        alert('Exam completed.');
    } else if (testStatus === 'IC') {
        navigate('/exam'); // Redirect to /exam
    } else {
        navigate('/instruction'); // Redirect to /instruction if no entry
    }
};

// Determine button text based on testStatus
const getButtonText = () => {
    if (testStatus === 'C') {
        return 'Exam Completed';
    } else if (testStatus === 'IC') {
        return 'Re-Start Exam';
    } else {
        return 'Take Exam';
    }
};

useEffect(() => {
  // Fetch medium settings from backend
  // {candidateInfo[0] ? (
    if (candidateInfo.length > 0 && candidateInfo[0].subject_code) {
      // alert(candidateInfo[0].subject_code); // Use subject_code
      const subject_code=candidateInfo[0].subject_code;
   
// )}
  axios.get(`http://localhost:5000/medium-settings/${subject_code}`).then((response) => {
    // axios.get(`http://localhost:5000/medium-settings`).then((response) => {
    const { mediumSettings, subjectLanguages, mediumCode, arrLang, session } =
      response.data;
  //   sessionStorage.setItem('candidate-medium', mediumCode);
    setMediumSettings(mediumSettings);
    setSubjectLanguages(subjectLanguages);
    setMediumCode(mediumCode);
    setArrLang(arrLang);
    setSession(session);
  });
}
}, [candidateInfo]);

  return (
    <>
      {user ? (
        
        <>
        <ServerStatus pageValue={"client"}/>
        <div className='row header' style={{backgroundColor:"rgb(102, 109, 114)"}}>
                <img src={sifyLogo} style={{ width: '140px', height: '60px' }} />
        </div>
        {candidateInfo[0] ? (
            <>
        <div className='row' style={{marginTop:"50px"}}>
            <div className='col-md-6 leftpane'>
                        <div className='row'>
                            <div className='col-md-9 candidateinfo'  >
                                <h4>Candidate Details</h4>
                                <table className='candidate_details'>
                                    <tr><td>Candidate Name</td><td>:</td><th>{candidateInfo[0].candidate_name}</th></tr>
                                    <tr><td>Membership No</td><td>:</td><th>{candidateInfo[0].user}</th></tr>
                                    <tr><td>Center Code</td><td>:</td><th>1012313A</th></tr>
                                    <tr><td>Center Venue</td><td>:</td><th>{candidateInfo[0].exam_venue}</th></tr>
                                    <tr><td>Medium Code</td><td>:</td><th>{renderMediumCode()}</th></tr>
                                </table>
                            </div>
                            <div className='col-md-3'>
                                <table>
                                    
                                    <tr>
                                        <td>
                                            <img
                                            src={imageExists ? imagePUrl : studentDefault}
                                            alt="Student"
                                            style={{ width: "75%", marginTop: "80px" }}
                                            />
                                        </td>
                                        </tr>
                                        <tr>
                                        <td>
                                            <img
                                            src={imageExists ? imageSUrl : signDefault}
                                            alt="Signature"
                                            style={{ width: "75%", marginTop: "10px" }}
                                            />
                                        </td>
                                    </tr>
                                    
                                </table>
                            </div>
                        </div>
            </div>
            <div className='col-md-6 rightpane' >
             
                    <div className='box'>
                        <div className='row'>
                            <h4 style={{marginLeft:"-15px",marginTop:"-10px"}}>Exam Details</h4>
                            <br/>
                            <br/>
                            <br/>
                             
                                {candidateInfo[0] ? (
                                    <table className='table ' style={{width:"800px",textAlign:"center"}}>
                                         
                                        <tr>
                                            <th>
                                                Subject Name: {candidateInfo[0].subject_name} ({candidateInfo[0].subject_code})<hr/>
                                                 
                                                Exam Date: {candidateInfo[0].exam_date} | Exam Duration: {formatTime(candidateInfo[0].subject_duration)} hrs
                                            
                                            </th> 
                                            <th>
                                                 
                                                <button className='btn btn-primary' onClick={handleClick} style={{ marginTop: "-20px" }}>
                                                    {getButtonText()}
                                                </button>
                                            </th>
                                        </tr>
                                    </table>
                                    ):(<><h1>Loading...</h1></>)}
                                    
                                
                         
                            
                        </div>
                    
                    </div>
                 
            </div>
        </div>
        
        </>
        ):(<><h1>Loading...</h1></>)}
    
          
        </>
      ) : (
        <>
        <ServerStatus pageValue={"client"}/>
        <ErrorBoundary>
            <Login onLogin={handleLogin} />
        </ErrorBoundary>
        </>
      )}
    </>
  );
};

export default Main;