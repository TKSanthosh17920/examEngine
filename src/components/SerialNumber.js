import React, { useEffect, useState } from 'react';

const SerialNumber = ({ onSerialNumberChange }) => {
  const [serialNumber, setSerialNumber] = useState('');

  useEffect(() => {
    
    fetch('http://localhost:5000/serial-number')
      .then(response => response.json())
      .then(data => {
        setSerialNumber(data.serialNumber);
        onSerialNumberChange(data.serialNumber); // Call the parent function with the new serial number
      })
      .catch(error => console.error('Error fetching serial number:', error));
  }, []);

  return (
    <>
       <p style={{fontSize:"10px",textAlign:"center"}}>SERIAL NUMBER :</p>{serialNumber} 
    </>
  );
};

export default SerialNumber;
