import React, { useRef } from 'react';
import styled from 'styled-components';
import './App.css';

function App() {
  const videoRef = useRef();
  const onClickGetVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    videoRef.current.srcObject = stream;
    console.log(stream);
  };

  return (
    <div className='App'>
      <StVideo
        autoPlay
        ref={videoRef}></StVideo>
      <button onClick={onClickGetVideo}>버튼</button>
    </div>
  );
}
const StVideo = styled.video`
  background-color: orange;
  height: 100px;
  width: 100px;
`;

export default App;
