import React,{useState} from 'react'

const RenderAlertForNotSaving = ({sendDataToExamForm}) => {

  const [isVisible, setIsVisible] = useState(true);

  const handleClick = () => {
    setIsVisible(false);
    sendDataToExamForm(false)
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // transparent background
        zIndex: 1000, // ensure it's on top
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center',
        }}
      >
        <p>Save Answer before switching questions</p>
        <button onClick={handleClick} style={{ padding: '10px 20px', marginTop: '10px' }}>
          Okay
        </button>
      </div>
    </div>
  );
}

export default RenderAlertForNotSaving
