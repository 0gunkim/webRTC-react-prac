import React, { useEffect, useRef, useState } from 'react';
import { db, database } from './components/firebase';
import { addDoc, collection, getDocs, doc } from 'firebase/firestore';
import { push, ref, getDatabase, onValue } from 'firebase/database';
import { nanoid, customAlphabet } from 'nanoid';
import pc from './components/webrtc';

import './App.css';
import styled from 'styled-components';

function App() {
  // console.log(pc);
  const [stream, setStream] = useState();
  const [devices, setDevices] = useState();
  const [videoOff, setvideoOff] = useState();
  const creatorVideoRef = useRef();
  const joinVideoRef = useRef();

  const initVideo = {
    audio: false,
    video: { facingMode: { exact: 'environment' } },
  };
  const mediaState = {
    audio: false,
    video: { facingMode: 'user' },
    nickName: 'tory',
  };

  //파이어베이스 ------------store
  const videoState = collection(db, 'video');

  // const addData = async () => {
  //   try {
  //     const res = await addDoc(videoState, mediaState);
  //     console.log(res);
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };

  // const getData = async () => {
  //   const data = await getDocs(videoState);
  //   data.forEach((res) => {
  //     console.log(res.data().nickName);
  //   });
  // };
  //파이어베이스 실시간
  const addLocate = ref(database, 'offer');
  async function makeCall() {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    const offerData = {
      spd: offer.sdp,
      type: offer.type,
    };
    push(addLocate, offerData);
  }
  // const getData = getDatabase();
  // const getLocate = ref(getData, '0gunKimTest');
  // const getSdp = () => {
  //   onValue(getLocate, (data) => {
  //     const obj = data.val();
  //     console.log(Object.values(obj));
  //   });
  // };

  // 디바이스 가져오기
  // const getVideo = async () => {
  //   try {
  //     const devices = await navigator.mediaDevices.enumerateDevices();
  //     const cameras = devices.filter((device) => device.kind === 'videoinput');
  //     cameras.forEach((deviceId) => setDevices(deviceId.deviceId));
  //   } catch (e) {
  //     console.error('비디오를 가져오지 못했습니다');
  //   }
  // };
  const localStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(mediaState);
      setStream(stream);
      creatorVideoRef.current.srcObject = stream;
    } catch (e) {
      console.error('Error accessing media devices.', e);
    }
  };

  const offVideo = async () => {
    await stream
      .getVideoTracks()
      .forEach((enabled) => setvideoOff((enabled.enabled = !enabled.enabled)));
  };

  useEffect(() => {
    // getVideo();
    localStream();
    // getSdp();
  }, []);

  return (
    <div className='App'>
      creatorVideo
      <StCreatorVideo
        autoPlay
        playsInline
        ref={creatorVideoRef}></StCreatorVideo>
      <button onClick={offVideo}>{videoOff ? 'off' : 'on'}</button>
      <button onClick={makeCall}>offer</button>
      {/* <button onClick={getSdp}>answer</button> */}
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
