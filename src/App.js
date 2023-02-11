import React, { useEffect, useRef, useState } from 'react';
import { database } from './components/firebase';
import pc from './components/webrtc';
import { push, ref, getDatabase, onValue } from 'firebase/database';
import styles from './app.module.css';
import { uuidv4 } from '@firebase/util';
export default function Aspp() {
  //localstream
  const localStreamRef = useRef();
  const [creatorUser, setCreatorUser] = useState();
  const constraints = { audio: false, video: { width: 380, height: 380 } };
  //yourStreamRef
  const yourStreamRef = useRef();

  //On & off(camera / audio)
  const [cameraOn, setCameraOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);

  //roomName
  const roomNameRef = useRef();
  const [roomName, setRoomName] = useState();

  //main && join
  const [openVideo, setOpenVideo] = useState(false);

  //realTime data
  const getRealTimaData = getDatabase();

  const localStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current.srcObject = stream;
      yourStreamRef.current.srcObject = stream;
      setCreatorUser(stream);
    } catch (error) {
      console.error('no connact localStream');
    }
  };
  // video && audio off/on
  const videoSwitch = () => {
    const cameraTracks = creatorUser.getVideoTracks();
    cameraTracks.forEach((i) => {
      i.enabled = !i.enabled;
      setCameraOn(i.enabled);
    });
  };

  const audioSwitch = () => {
    const audioTracks = creatorUser.getAudioTracks();
    audioTracks.forEach((i) => {
      i.enabled = !i.enabled;
      setAudioOn(i.enabled);
    });
  };

  const roomJoinSubmit = (e) => {
    e.preventDefault();

    const inputValue = roomNameRef.current.value;
    setRoomName(inputValue);
    roomNameRef.current.value = '';
    setOpenVideo(true);
    localStream();
    offerHandler(inputValue);
  };

  const locate = ref(database, `join`);
  // 오퍼가 있는지 없는지 확인 있다면 리모트 오퍼
  const offerHandler = async (inputValue, answer) => {
    const offerLocate = ref(database, `offer/${roomName}`);
    const getAnswerLocate = ref(database, `offer/${roomName}`);
    //offer 시그널서버로 전달

    onValue(getJoin, async (snapshot) => {
      const data = snapshot.val();
      console.log(data);
      const realFindRoom = Object.values(data);
      console.log(realFindRoom);
      if (answer) {
        const remoteAnswerDesc = new RTCSessionDescription(answer);
        await pc.setRemoteDescription(remoteAnswerDesc);
      }
    });
    const offer = await pc.createOffer();
    const jsonOffer = JSON.stringify(offer);
    push(offerLocate, jsonOffer);
    push(locate, {
      roomName: inputValue,
      message: '누군가 왔다',
      isJoin: true,
    });
  };
  // offer remote
  const getOffer = ref(getRealTimaData, 'offer');
  const remoteOffer = async () => {
    onValue(getOffer, async (snapshot) => {
      const fireGetOffer = Object.values(snapshot.val());
      const remoteSessionOffer = new RTCSessionDescription(fireGetOffer);
      await pc.setRemoteDescription(remoteSessionOffer);
      console.log(remoteSessionOffer);
    });
  };
  //isOffer ?

  // 참가자가 들어왔음 알리는 메세지
  const getJoin = ref(getRealTimaData, 'join');

  onValue(getJoin, (snapshot) => {
    const data = snapshot.val();
    console.log(data);
    const realFindRoom = Object.values(data);
    console.log(realFindRoom);

    const rd = realFindRoom.filter((i) => i.roomName === roomName);
    if (rd.length > 1) {
      rd.find((i) => console.log(i.message));
    } else if (rd.length === 1) {
      console.log('방생성');
    }
  });

  return (
    <div className={styles.App}>
      {!openVideo ? (
        <form onSubmit={roomJoinSubmit}>
          <div className={styles.roomNameBox}>
            <label id='roomName'>
              <h1>ROOM JOIN</h1>
            </label>
            <input
              className={styles.roomNameInput}
              id='roomName'
              type='text'
              ref={roomNameRef}
            />
            <button>JOIN</button>
          </div>
        </form>
      ) : (
        <div className={styles.vidoeBox}>
          <video
            className={styles.localStream}
            ref={localStreamRef}
            autoPlay
            playsInline></video>
          <button onClick={videoSwitch}>
            {cameraOn ? 'CAMERA OFF' : 'CAMERA ON'}
          </button>
          <button onClick={audioSwitch}>
            {audioOn ? 'AUDIO OFF' : 'AUDIO ON'}
          </button>
          <video
            className={styles.localStream}
            ref={yourStreamRef}
            autoPlay
            playsInline></video>
          <button onClick={videoSwitch}>
            {cameraOn ? 'CAMERA OFF' : 'CAMERA ON'}
          </button>
          <button onClick={audioSwitch}>
            {audioOn ? 'AUDIO OFF' : 'AUDIO ON'}
          </button>
        </div>
      )}
    </div>
  );
}
