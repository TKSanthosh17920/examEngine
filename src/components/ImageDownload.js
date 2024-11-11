import React, { useState, useEffect } from "react";
import axios from "axios";

const ImageDownload = () => {
  const [centerCode, setCenterCode] = useState("");
  const [serverNo, setServerNo] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/get-center-server-no");
        setCenterCode(res.data.center_code);
        setServerNo(res.data.serverno);
      } catch (err) {
        console.error(err);
      }
    };
  
    fetchData();
  
    return () => {
      console.log("Cleanup function is being called");
    };
  }, []);
  
  const downloadFile=async (fileName)=>{
    try{
        const status = centerCode+"_"+fileName;
        const res = await axios.get(`http://localhost:5000/download-file/${status}`)

    }catch(err){
        console.error(err);
    }
  }

  return (
    <div>
      <div>
        <p>
          Center Code : <span>{centerCode}</span>
        </p>
      </div>
      <div>
        <p>
          Server No: <span>{serverNo}</span>
        </p>
      </div>
<div>
    {/* <div>
        Download Image : <button className="btn" >Download</button>
    </div> */}
    <div>
        Download Photo : <button className="btn " onClick={()=>{downloadFile("photo")}}>Download</button>
    </div>
    <div>
        Download Signature : <button className="btn " onClick={()=>{downloadFile("sign")}}>Download</button>
    </div>
    <div>
        Check Status : <button className="btn ">Download</button>
    </div>

</div>

    </div>
  );
};

export default ImageDownload;
