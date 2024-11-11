import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation
import './Exam.css';
import ServerStatus from './ServerStatus';
import sifyLogo from './assets/images/sify.png';
import RenderHtmlContent from './RenderHtmlContent';

const Instruction = () => {
    const [candidateInfo, setCandidateInfo] = useState({});
    const [instructions, setInstructions] = useState('');
    const [error, setError] = useState('');
    const [isChecked, setIsChecked] = useState(false);
    const navigate = useNavigate(); // Use useNavigate for navigation
  
    // Function to handle checkbox change
  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  // Function to handle button click
  const handleButtonClick = (event) => {
    event.preventDefault(); // Prevent the default action

    if (!isChecked) {
      alert('Please read and agree to the instructions before proceeding.');
      return;
    }

    // If checkbox is checked, navigate to the next page
    navigate('/sampleqp');
  };
  
    useEffect(() => {
        // Retrieve data from sessionStorage
        const userAuthData = sessionStorage.getItem('candidateInfo');

        if (userAuthData) {
            try {
                const parsedData = JSON.parse(userAuthData);
                if (parsedData && parsedData.user) {
                    setCandidateInfo(parsedData);
                } else {
                    console.error('Invalid user data structure in sessionStorage.');
                }
            } catch (error) {
                console.error('Error parsing user data from sessionStorage:', error);
            }
        }
    }, []);

    useEffect(() => {
        if (candidateInfo.subject_code) {
            const fetchInstructions = async () => {
                try {
                    const response = await fetch(`http://localhost:5000/api/instructions/${candidateInfo.subject_code}`);
                    const data = await response.json();
                    setInstructions(data[0]['instruction_text']);
                } catch (err) {
                    setError('Failed to fetch instructions');
                }
            };

            fetchInstructions();
            console.log(instructions);
        }
    }, [candidateInfo.subject_code]);

    if (error) return <p>{error}</p>;

    return (
        <>
            <ServerStatus pageValue="client" />

            <div className="row header" style={{ backgroundColor: '#666d72' }}>
                <img src={sifyLogo} style={{ width: '140px', height: '60px' }} alt="Sify Logo" />
            </div>

            <div className="row">
                <center>
                    <div className="infoform">
                        <label className="info-title">Candidate Exam Result</label>
                        <div className="ins-content">
                            <RenderHtmlContent htmlString={instructions} />
                        </div>
                            
                        <span >
                            <input className='agree' type='checkbox' name='agree' required onChange={handleCheckboxChange}/>&nbsp;
                            
                        </span>
                        <a  className="next-button-ins"  onClick={handleButtonClick}>
                            I have read the instructions - मैंने निर्देश पढ़ लिये हैं
                        </a>
                    </div>
                </center>
            </div>
        </>
    );
};

export default Instruction;
