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

  //On & off(camera / audio)
  const [cameraOn, setCameraOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);

  //roomName
  const roomNameRef = useRef();
  const [roomName, setRoomName] = useState();

  //main && join
  const [openVideo, setOpenVideo] = useState(false);

  const locate = ref(database, `join`);
  const offerLocate = ref(database, 'offer');

  const localStream = async () => {
    try {
      if (openVideo) {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStreamRef.current.srcObject = stream;
        setCreatorUser(stream);
      }
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
    setOpenVideo(!openVideo);
    console.log(roomName);
    offerHandler(inputValue);
  };

  const offerHandler = async (inputValue) => {
    const offer = await pc.createOffer();
    const jsonOffer = JSON.stringify(offer);
    push(offerLocate, jsonOffer);
    push(locate, { roomName: inputValue });
  };

  // 참가자가 들어왔음 알리는 메세지
  const welcomMessage = getDatabase();
  const getJoin = ref(welcomMessage, `join`);
  onValue(getJoin, (data) => {
    const realFindRoom = Object.values(data.val());
    const rd = realFindRoom.filter((i) => i.roomName === roomName);
    rd.length === 2 && console.log('누군과 왔다.');
  });
  useEffect(() => {
    openVideo && localStream();
  }, [openVideo]);
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
            <button type='button'>JOIN</button>
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
        </div>
      )}
    </div>
  );
}
