// ExamForm.js
import React, { useState,useEffect } from 'react';
import './Exam.css'; 
import Timer from './Timer';
import { Link } from 'react-router-dom';
import sifyLogo from './assets/images/sify.png';
import studentDefault from './assets/images/student.png';
import signDefault from './assets/images/signature.png';
import themePng from './assets/images/theme.png';
import shutDown from './assets/images/shutdown.png';

const ExamForm = () => {
    // const [user, setUser] = useState('Blank');
    const [candidateInfo, setCandidateInfo] = useState([]);
    const [examStatus, setExamStatus] = useState(0);
    const [acScore, setAcScore] = useState(0);
    const [TotalScore, setTotalScore] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [questions, setQuestions] = useState([
    {
        id: '1',
        text: 'I love India 1 ?',
        subject_code: '111',
        options: [
        { id: 'a', text: 'Option 1' },
        { id: 'b', text: 'Option 2' },
        { id: 'c', text: 'Option 3' },
        { id: 'd', text: 'Option 4' },
        ],
        correct_ans: 'd',
        mark: 1
    }
    ]);
    const timer = 3000;


    useEffect(() => {
        // Retrieve data from sessionStorage
        const userAuthData = sessionStorage.getItem('candidateInfo');
        //console.log(userAuthData)
    
        if (userAuthData) {
          try {
            // Parse the stored JSON string
            const parsedData = JSON.parse(userAuthData);
            // console.log('pppaaarse',parsedData)
            // Check if the parsed data has the expected structure
            if (parsedData && parsedData.user) {
                setCandidateInfo({user:parsedData.user,subject_code: parsedData.subject_code, exam_date: parsedData.exam_date });
            } else {
              console.error('Invalid user data structure in sessionStorage.');
            }
          } catch (error) {
            console.error('Error parsing user data from sessionStorage:', error);
          }
        }
      }, []);
    // console.log(candidateInfo);
    // const [timer, setTimer] = useState(20);
    
  
  useEffect(() => {
    
    const fetchSelQuestions = async () => {
        try {
          const response = await fetch(`http://localhost:5000/questions/${candidateInfo.subject_code}`);
          const data = await response.json();
      
          // Loop through each question and add it to the state
          data.forEach((question, index=2) => {
            const newData = {
              id: index+1,
              text: question.question_text,
              subject_code: question.subject_code,
              options: [
                { id: 'a', text: question.option_a },
                { id: 'b', text: question.option_b },
                { id: 'c', text: question.option_c },
                { id: 'd', text: question.option_d },
              ],
              correct_ans: question.correct_ans,
              mark: question.mark,
            //   incrementingValue: index + 1,
            };
      
            setQuestions((prevQuestions) => [...prevQuestions, newData]);
            
          });
        } catch (error) {
          console.error('Error fetching candidate info:', error);
        }
      };
      
    // Call the function to fetch and merge questions when the component mounts
    fetchSelQuestions();
  }, [candidateInfo.subject_code]); // Include candidateInfo.subject_code as a dependency
  

  
  // Define the questions array within the component

//   console.log('quest',questions);

  const handleOptionChange = (questionId, optionId) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: optionId,
    }));
  };

  const renderOptions = (options, questionId) => {
    return options.map((option) => (
      <div key={option.id} className="option">
        <input
          type="radio"
          id={`option_${option.id}`}
          name={`question_${questionId}`}
          value={option.id}
          checked={answers[questionId] === option.id}
          onChange={() => handleOptionChange(questionId, option.id)}
        />
        <label className='option-text' htmlFor={`option_${option.id}`}>{option.text}</label>
      </div>
    ));
  };

  const renderCurrentQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];

    return (
      <div key={currentQuestion.id} className="question">
        <p><span className='qlabel'>Q.{currentQuestion.id})</span>  <span className='qtext'>{currentQuestion.text}</span> <span className='mark-label'>Subject: {currentQuestion.subject_code} | Marks: {currentQuestion.mark}</span>   </p>
        {renderOptions(currentQuestion.options, currentQuestion.id)}
      </div>
    );
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    console.log('Submitted Answers:', answers);

  };

  const handleBackQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
    console.log('Submitted Answers:', answers);

  };

  

  const handleSubmit = () => {
    // Handle form submission with answers
    console.log('Exam done!');
    console.log(questions)
    
  
      
      // Calculate the total score
      const totalScore = questions.reduce((score, question) => {
        const answerObject = question.mark;
        const userAnswer = answers;
        const questionid=question.id;
      console.log(userAnswer[questionid]);
        // Check if the user's answer is correct
        if (userAnswer[questionid] === question.correct_ans) {
          return score + question.mark;
        }
      
        return score+=answerObject;
      }, 0);
      const acscore = questions.reduce((score, question) => {
        // const answerObject = question.mark;
        const userAnswer = answers;
        const questionid=question.id;
      console.log(userAnswer[questionid]);
        // Check if the user's answer is correct
        if (userAnswer[questionid] === question.correct_ans) {
          return score += question.mark;
        }
      
        return score
      }, 0);
      
      console.log('Total Score:', totalScore);
      console.log('Score:', acscore);
      setAcScore(acscore);
      setTotalScore(totalScore);
      
    alert('Exam Completed!');
    // setTimer(30);
    setExamStatus(1);
    // console.log('Timmmeee  '+timer);

    
  };


  const colors = ['yellowgreen', '#f3a063', '#63aff3'];
  const colors0 = ['#666d72', '#dd6d1b', '#3d7db7'];
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [currentColorIndex0, setCurrentColorIndex0] = useState(0);

  // Function to handle color change
  const handleColorChange = () => {
    const newIndex = (currentColorIndex + 1) % colors.length;
    setCurrentColorIndex(newIndex);
    const newIndex0 = (currentColorIndex0 + 1) % colors.length;
    setCurrentColorIndex0(newIndex0);
  };
  return (
    <>
    
        <div className='row header' style={{ '--dynamic-color0': colors0[currentColorIndex0] }}>
                <img src={sifyLogo} style={{width:'215px'}}/>
        </div>
        <div className='timer-header' style={{ '--dynamic-color': colors[currentColorIndex] }}>
        {/* <button >Change Color</button> */}
        <img src={themePng} className='themescss' onClick={handleColorChange}></img>
        {examStatus == 0 ? (
            <Timer timer={timer} onTimerComplete={handleSubmit} dynamicColor={colors0[currentColorIndex0]}   />
        ):(<>
            
            </>)}
        </div>
    <div className='row'>
    <div className="col-md-9 examform" style={{ '--dynamic-color0': colors0[currentColorIndex0] }}>
        
       
        {examStatus == 0 ? (
            <>
            
       
        
      {renderCurrentQuestion()}
     
      {currentQuestionIndex !== 0 && (
        <>
            <button className='space' onClick={handleBackQuestion}>Previous Question</button>
            {/* <button onClick={handleNextQuestion}>Next Question</button> */}
        </>
        )}
        {currentQuestionIndex < questions.length - 1 && (
         <button onClick={handleNextQuestion}>Next Question</button>
        )}
        {currentQuestionIndex === questions.length - 1 && (
         <button  onClick={handleSubmit}>Submit Answers</button>
        )}
         </>):(<><h3>Total Score:</h3><h5>{TotalScore}</h5><br/>
         <h3>Score:</h3><h5>{acScore}</h5><br></br> <Link to='/'>Go Back</Link></>)}
        <Link  to='/'><img className='logout' src={shutDown} style={{width:"40px"}}/></Link>
    </div>
    <div className="col-md-3 candinfo" style={{ '--dynamic-color': colors[currentColorIndex] }}>
        <div className='row candidate-segment'>
            <div className='col-md-6'>
                <img src={studentDefault}/>
               
                <img src={signDefault}/>
            </div>
            <div className='col-md-6'>
                <p className='context-label'>Candidate Roll Number<br/><span className='context'>DRUN00001</span></p>
                <p className='context-label'>Candidate Name<br/><span className='context'>{candidateInfo.user}</span></p>

            </div>
        </div>
            
    </div>
    </div>
    </>
  );
};

export default ExamForm;
