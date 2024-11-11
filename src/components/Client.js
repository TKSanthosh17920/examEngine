import React, { useState, useEffect } from 'react';
import ClientLogin from './ClientLogin';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setFormattedDate } from '../redux/dateSlice';
import sifyLogo from './assets/images/sify-logo.png';
import ServerStatus from './ServerStatus';
import Activate from './Activate';
import ExamTable from './ExamTable';
import ShutdownButton from './ShutdownButton';
import UtilityStatus from './UtilityStatus';
import RestartSystem from './RestartSystem';
import InternetSpeedChecker from './InternetSpeedChecker';
import SerialNumber from './SerialNumber'; // Import the SerialNumber component
import { getCurrentTime,getCurrentFormattedTime,getCurrentDate } from './utils';
import './Admin.css';
import BatteryStatus from './BatteryStatus';
import ErrorBoundary from './ErrorBoundary';
// import ErrorBoundary from './ErrorBoundary';


const Client = () => {
  const [user, setUser] = useState(localStorage.getItem('user') || null);
  const [qpStatus, setQpStatus] = useState(false); // New state for buttonDisabled
 const [photoCount, setPhotoCount] = useState(0); // State to store the photo count
 const [signCount, setSignCount] = useState(0); // State to store the photo count
 const [feedCount, setFeedCount] = useState(0); // State to store the photo count
 const [currentTime, setCurrentTime] = useState(getCurrentTime());
 const [currentDate, setCurrentDate] = useState(getCurrentDate());
 const [examData, setExamData] = useState([]);
 const [statusYCount, setStatusYCount] = useState(0);
 const [serialNumber, setSerialNumber] = useState('');

  const handleExamDataUpdate = (data) => {
    setExamData(data);
    // console.log('Updated exam data:', data); // Now you can use the examData in the parent component
  };
// Function to handle the change in serial number
const handleSerialNumberChange = (newSerialNumber) => {
    setSerialNumber(newSerialNumber);
    // You can perform additional actions here with the new serial number
    console.log('Serial number in parent:', newSerialNumber);
  };
//   console.log('ExamData -- ',examData);

  const dispatch = useDispatch();
  const formattedDate = useSelector((state) => state.date.formattedDate);
 
const handleQpStatusChange = (qpStatus) => {
    // console.log('Updated qpStatus:', qpStatus);
    // Handle the qpStatus as needed
    setQpStatus(qpStatus);
  };



// Function to handle the API call
const updateExamDate = async () => {
    try {
        const response = await fetch('http://localhost:5000/update-exam-date', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                examDate: getCurrentFormattedTime('date'), // Format the date as needed
            }),
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Exam date updated successfully:', result);
            alert(`Exam Data Updated to ${getCurrentFormattedTime('date_alone')} !`);
        } else {
            console.error('Failed to update exam date:', response.statusText);
        }
    } catch (error) {
        console.error('Error updating exam date:', error);
    }
};


const fetchStatusYCount = async () => {
     
    try {
      const response = await fetch('http://localhost:5000/api/feed-sync'); // Adjust API URL if needed
      if (!response.ok) {
        throw new Error('Error fetching status Y count');
      }

      const data = await response.json();
      setStatusYCount(data.statusYCount); // Set the count from the API response
    } catch (err) {
     console.log(err.message); // Set the error message
    } finally {
      return false; // Stop loading indicator
    }
  };

// useEffect to run the fetch every 1 minute
useEffect(() => {
// Call the function immediately on mount
fetchStatusYCount();
 
const interval = setInterval(fetchStatusYCount, 1000);

// Clear the interval when the component unmounts
return () => clearInterval(interval);
}, []); // Empty dependency array ensures it runs only on mount and sets the interval


useEffect(() => {
    const intervalId = setInterval(() => {
        setCurrentTime(getCurrentTime());
        setCurrentDate(getCurrentDate());
    }, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup the interval on component unmount
}, []);
useEffect(() => {
    if (user) {
      localStorage.setItem('user', user);
    }
}, [user]);

  const handleLogin = (username) => {
    setUser(username);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await fetch('http://localhost:5000/count-files');
        const data = await response.json(); 
        setPhotoCount(data.photoCount);
        setSignCount(data.signCount); 
      } catch (error) {
        console.error('Error fetching file counts:', error);
      }
    };

    fetchCounts();
  }, [qpStatus]);


useEffect(() => {
    const fetchFeedCounts = async () => {
      try {
        const response = await fetch('http://localhost:5000/count-files');
        const data = await response.json();
        console.log('feed cnt', data.feedCount);
        setFeedCount(data.feedCount);
      } catch (error) {
        console.error('Error fetching file counts:', error);
      }
    };

    // Initial fetch
    fetchFeedCounts();

    // Set up interval to fetch data every 1 minute (60,000 milliseconds)
    const intervalId = setInterval(fetchFeedCounts, 60000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      {user ? (
        <>
          <ServerStatus pageValue={"admin"} />
          <div className='row'>
            <div className='col-md-12'>
              <header>
                <img src={sifyLogo} style={{ width: '150px' }} />
                <span className='admindash'>ADMIN DASHBOARD</span>
                 
                    <InternetSpeedChecker />
                
                        <BatteryStatus />
                
                <button className='logout' onClick={handleLogout}>Logout</button>
              </header>
              <hr />
              <div className='col-md-12 client-box'>
                <h6>Hi <span className='client-welcome'>{user},</span> Welcome to Admin Dashboard!</h6>
                <span className='currenttime'><p className='date'>{currentDate}</p><p  className='time'>{currentTime}</p></span>
                <center>
                  <Activate username={user} examData={examData} serialNumber={serialNumber} onButtonQpStatus={handleQpStatusChange} />
                  {/* {buttonDisabled ?  ( */}
                    <>
                    <hr/>
                    <div className='row'>
                        <div className='container'>
                        <ExamTable username={user}  onExamDataUpdate={handleExamDataUpdate}/>
                        </div>
                    {qpStatus >= 3 ? (
                        <center>
                            <table   className="table table-bordered table-striped cnt-table">
                                <tr>
                                    {/* <th>Photo Count {qpStatus}: </th><td><span className='badge'>{photoCount}</span></td> */}
                                    <th>Photo Count&nbsp;&nbsp;&nbsp;</th><td><span className='badge'>{photoCount}</span></td>
                                    <th>Sign Count&nbsp;&nbsp;&nbsp;</th><td><span className='badge'>{signCount}</span></td>
                                    <th>Feed Count&nbsp;&nbsp;&nbsp;</th><td><span className='badge'>{feedCount}</span></td>
                                    <th>Feed Sync&nbsp;&nbsp;&nbsp;</th><td><span className='badge'>{statusYCount}</span></td>
                                </tr>
                            </table>
                        </center>
                    ):(<></>)}
                    </div>
                    </>
                    {/* ):(<></>)} */}
                </center>
                <div className='bottom-left'>
                    <span  style={{ cursor: "pointer" }} onClick={updateExamDate}><SerialNumber onSerialNumberChange={handleSerialNumberChange}  /></span>
                </div>
              </div>
            </div>
          </div>

            <UtilityStatus centrecode={user}  serialNumber={serialNumber} qpStatus={qpStatus}/>


        </>
      ) : (
        <>

            <UtilityStatus  centrecode={user}  serialNumber={serialNumber} qpStatus={qpStatus}/>
         
            <ServerStatus pageValue={"admin"} />
            <ClientLogin onLogin={handleLogin} />
          <span className='system-btn-span'>
            <ShutdownButton />
            <RestartSystem/>
          </span>
        </>
      )}
    </>
  );
};

export default Client;
