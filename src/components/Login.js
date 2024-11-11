import React, { useEffect, useState } from 'react';
import sifyLogo from './assets/images/sify-logo.png';
import refresh from './assets/images/refresh.gif';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { checkTableFunction } from './utils';

const Login = ({ onLogin }) => {
  const [taaccess, setTAAccess] = useState(0);
  const [username, setUsername] = useState('DRUN000001');
  const [password, setPassword] = useState('password');
  const [tausername, setTAUsername] = useState('iwfr_110086D');
  const [tapassword, setTAPassword] = useState('password');
  const [tableExists, setTableExists] = useState(null);
  const [countdown, setCountdown] = useState(10);
  const [alert, setAlert] = useState({ open: false, message: '', severity: '' });

  useEffect(() => {
    const checkTable = async () => {
      try {
        const exists = await checkTableFunction('iib_candidate_iway');
        setTableExists(exists);
      } catch (error) {
        console.error('Error checking table:', error);
        setTableExists(false);
      }
    };

    checkTable();
    const interval = setInterval(() => {
      checkTable();
      setCountdown(11); // Reset countdown after each check
    }, 10000); // Check every 10 seconds

    const countdownInterval = setInterval(() => {
      setCountdown((prevCountdown) => (prevCountdown > 0 ? prevCountdown - 1 : 11));
    }, 1000); // Update countdown every second

    return () => {
      clearInterval(interval); // Cleanup on component unmount
      clearInterval(countdownInterval); // Cleanup countdown interval
    };
  }, []);

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: btoa(password),
          centre_code: tausername.replace('iwfr_', '').toUpperCase()
        }),
      });
      if (response.ok) {
        // Successful login
        const data = await response.json();
        console.log('Login successful:', data);
        
        // Call the onLogin function or perform further actions
        onLogin(username);
      } else if (response.status === 402) {
        // Schedule failed
        setAlert({ open: true, message: 'No Exam Scheduled Today!', severity: 'error' });
      } else {
        // Failed login
        setAlert({ open: true, message: 'Invalid username or password', severity: 'error' });
      }
    } catch (error) {
      console.error('Error during login:', error);
      setAlert({ open: true, message: 'Error during login. Please try again.', severity: 'error' });
    }
  };


  const handleTALogin = async () => {
    try {
      const response = await fetch('http://localhost:5000/talogin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: tausername,
          password: tapassword,
        }),
      });
      if (response.ok) {
        // Successful login
        const data = await response.json();
        console.log('TA Login successful:', data);
        setAlert({ open: true, message: 'TA ACCESS GRANTED !', severity: 'success' });
        // Call the onLogin function or perform further actions
        setTAAccess(1);
      } else if (response.status === 402) {
        // Failed login
        setAlert({ open: true, message: 'Exam Completed !', severity: 'success' });
      } else {
        // Failed login
        setAlert({ open: true, message: 'Invalid TA Access', severity: 'error' });
      }
    } catch (error) {
      console.error('Error during login:', error);
      setAlert({ open: true, message: 'Error during login. Please try again.', severity: 'error' });
    }
  };


  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <div className="mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 loginform">
          <center>
            <img src={sifyLogo} style={{ width: '150px' }} alt="Sify Logo" />
          </center>
          {tableExists === null ? (
            'Checking table...'
          ) : tableExists ? (
            <>
            {taaccess == 0 ? (<>
            <h3>TA Login</h3>
              <hr />
              <div className='input-space'>
                <label>
                    TA Admin:
                  <input
                    type="text"
                    className='form-control'
                    style={{ display: 'inline', width: "127%" }}
                    value={tausername}
                    onChange={(e) => setTAUsername(e.target.value)}
                  />
                </label>
                <br />
                <label>
                    TA Password:
                  <input
                    type="password"
                    className='form-control'
                    style={{ display: 'inline', width: "118%" }}
                    value={tapassword}
                    onChange={(e) => setTAPassword(e.target.value)}
                  />
                </label>
              </div>
              <br />
              <br />
              <button onClick={handleTALogin}>Submit</button>
            </>):(
                <>
            {/* //////////////////////////////////////////////////////////////////// */}
                    <h3>Exam Login</h3>
                    <hr />
                    <div className='input-space'>
                        <label>
                        Membership No:
                        <input
                            type="text"
                            className='form-control'
                            style={{ display: 'inline' }}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        </label>
                        <br />
                        <label>
                        Password:
                        <input
                            type="password"
                            className='form-control'
                            style={{ display: 'inline', width: "118%" }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        </label>
                    </div>
                    <br />
                    <br />
                    <button onClick={handleLogin}>Login</button>
                </>)}
            </>
          ) : (
            <>
              <div>
                <center>
                  <h4 style={{ marginTop: "100px" }}>
                    Exam <span className='client-welcome'>Data</span> is not yet
                    <span className='client-welcome'> Ready</span>. Can't Take exam right now!
                  </h4>
                  <p>Reloading in {countdown} sec&nbsp;&nbsp;<img src={refresh} style={{ width: '30px' }} alt="Reloading" /></p>
                </center>
              </div>
            </>
          )}
        </div>
      </div>
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Login;
