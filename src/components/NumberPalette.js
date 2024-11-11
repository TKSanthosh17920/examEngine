import React from 'react';
import PropTypes from 'prop-types';
import './NumberPalette.css'; // Add CSS for styling if needed
import CalculatorAndRoughSheet from './CalculatorAndRoughSheet'; // Import the CalculatorAndRoughSheet component
import SciCalculatorAndRoughSheet from './SciCalculatorAndRoughSheet'; // Import the CalculatorAndRoughSheet component

const NumberPalette = ({ totalQuestions, currentQuestionIndex, answeredQuestions, onQuestionSelect, taggedQuestions, MembershipNo, QuestionPNo, SubjectCode , ExamDate, Calculator, RoughtSheet }) => {
  const handleQuestionSelect = (index) => {
    onQuestionSelect(index);
  };

  const answerConvNum = answeredQuestions.map(Number);
  const anstagged = answerConvNum.filter(element => taggedQuestions.includes(element)).length;

  return (

    <>
    
      <div className="number-palette">
        <div className="row">
            <div className='col-md-8' style={{width:"100%"}}>
                <span className="titlenumber">Number of Questions</span>
            </div>
            {/* <div className='col-md-2'></div> */}
            <div className='col-md-4 divcalc'>
                <span className='calc-div'>
                    {Calculator=='Y' ? (<>
                        <SciCalculatorAndRoughSheet 
                        MembershipNo={MembershipNo}
                        QuestionPNo={QuestionPNo}
                        SubjectCode={SubjectCode}
                        ExamDate={ExamDate}
                        RoughtSheet={RoughtSheet}
                        />
                    </>):(<>
                        <CalculatorAndRoughSheet 
                        MembershipNo={MembershipNo}
                        QuestionPNo={QuestionPNo}
                        SubjectCode={SubjectCode}
                        ExamDate={ExamDate}
                        RoughtSheet={RoughtSheet}
                        />
                    </>)}
                    
                </span>
            </div>
          
            {/* <br/> */}
        </div>
        <div className="row numbersection">
          {Array.from({ length: totalQuestions }, (_, index) => (
            <button
            key={index}
            className={`number-button 
                        ${index === currentQuestionIndex ? 'active' : ''} 
                        ${answeredQuestions.includes((index + 1).toString()) && taggedQuestions.includes(index + 1)
                          ? 'taganswered' 
                          : answeredQuestions.includes((index + 1).toString()) 
                          ? 'answered' 
                          : taggedQuestions.includes(index + 1) 
                          ? 'tagged' 
                          : ''}`}
            onClick={() => handleQuestionSelect(index)}
          >
              {index < 9 ? `Q0${index + 1}` : `Q${index + 1}`} 
            </button>
          ))}
        </div>
        
        <div className="row" style={{position:"absolute",top:"170px",left:"25px",height:"110px"}}>
          <button className="number-button-ref answered">{answeredQuestions.length}</button> 
          <button className="number-button-ref tagged">{taggedQuestions.length - anstagged}</button> 
          <button className="number-button-ref taganswered" style={{marginLeft:"20px"}}>{anstagged}</button> 
          <button className="number-button-ref unattempt" style={{marginLeft:"40px"}}>{totalQuestions - answeredQuestions.length}</button> 
        </div>
        <div className="row" style={{position:"absolute",top:"200px",left:"20px",fontSize:"10px",fontWeight:"600"}}>
            <pre>Attempted    Tagged   Tagged & Attempted   Unattempted</pre>
        </div>
      </div>
    </>
  );
};

NumberPalette.propTypes = {
  totalQuestions: PropTypes.number.isRequired,
  currentQuestionIndex: PropTypes.number.isRequired,
  answeredQuestions: PropTypes.arrayOf(PropTypes.string).isRequired,
  onQuestionSelect: PropTypes.func.isRequired,
  taggedQuestions: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default NumberPalette;
