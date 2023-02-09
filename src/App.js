import React, { useEffect, useRef, useState } from 'react';
import { db, database } from './components/firebase';
import { addDoc, collection, getDocs, doc } from 'firebase/firestore';
import { push, ref } from 'firebase/database';
import { nanoid, customAlphabet } from 'nanoid';
import pc from './components/webrtc';

import styled from 'styled-components';

function App() {
  // console.log(pc);
  const creatorVideoRef = useRef();
  const joinVideoRef = useRef();
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
    nickName: 'tory',
  };

  //파이어베이스 ------------store
  const videoState = collection(db, 'video');

  const addData = async () => {
    try {
      const res = await addDoc(videoState, mediaState);
      console.log(res);
    } catch (e) {
      console.log(e);
    }
  };
  // const getData = async () => {
  //   const data = await getDocs(videoState);
  //   data.forEach((res) => {
  //     console.log(res.data().nickName);
  //   });
  // };
  //파이어베이스 실시간
  const locate = ref(database, '0gunKimTest');

  async function makeCall() {
    const offer = await pc.createOffer();
    console.log(offer);
    await pc.setLocalDescription(offer);
    push(locate, { offer });
  }

  let localStream = null;

  const viewCamera = async () => {
    try {
      const stream =
        video === true
          ? await navigator.mediaDevices.getUserMedia(mediaState)
          : null;
      creatorVideoRef.current.srcObject = stream;
    } catch (e) {
      console.error('Error accessing media devices.', e);
    }
  };
  const joinCamera = async () => {
    try {
      const stream =
        video === true
          ? await navigator.mediaDevices.getUserMedia(mediaState)
          : null;
      joinVideoRef.current.srcObject = stream;
    } catch (e) {
      console.error('Error accessing media devices.', e);
    }
  };
  const videoHandler = () => {
    setVideo(!video);
    if (video === false) {
    }
  };
  // console.log(video);
  useEffect(() => {
    viewCamera();
    joinCamera();
    // getData();
  }, [video]);

  return (
    <div className='App'>
      creatorVideo
      <StCreatorVideo
        autoPlay
        playsInline
        ref={creatorVideoRef}></StCreatorVideo>
      <button onClick={makeCall}>offer</button>
      <button onClick={videoHandler}>video on/off</button>
      <StJoinVideo
        autoPlay
        playsInline
        ref={joinVideoRef}></StJoinVideo>
      joinVideo
    </div>
  );
}
const StCreatorVideo = styled.video`
  background-color: orange;
  height: 200px;
  width: 300px;
`;
const StJoinVideo = styled.video`
  background-color: orange;
  height: 200px;
  width: 300px;
`;

export default App;
