import React, { useEffect, useRef, useState } from 'react';
import { db } from './components/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { nanoid, customAlphabet } from 'nanoid';
import pc from './components/webrtc';
import styled from 'styled-components';

function App() {
  console.log(pc);
  const videoRef = useRef();
  const id = nanoid();
  const roomIdCustom = customAlphabet('abcde0123456789', 6);
  const roomId = roomIdCustom();
  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(false);

  const mediaState = {
    video,
    audio,
    id,
    roomId,
  };
  const videoState = collection(db, 'video');

  const addData = async () => {
    try {
      const res = await addDoc(videoState, mediaState);
      console.log(res);
    } catch (e) {
      console.log(e);
    }
  };

  const viewCamera = async () => {
    try {
      const stream =
        video === true
          ? await navigator.mediaDevices.getUserMedia(mediaState)
          : null;
      videoRef.current.srcObject = stream;
    } catch (e) {
      console.error('Error accessing media devices.', e);
    }
  };
  const videoHandler = () => {
    setVideo(!video);
    if (video === false) {
      console.log(videoRef.current);
    }
  };
  console.log(video);
  useEffect(() => {
    viewCamera();
  }, [video]);

  return (
    <div className='App'>
      <StVideo
        autoPlay
        ref={videoRef}></StVideo>
      <button onClick={addData}>버튼</button>
      <button onClick={videoHandler}>video on/off</button>
    </div>
  );
}
const StVideo = styled.video`
  background-color: orange;
  height: 200px;
  width: 300px;
`;

export default App;
