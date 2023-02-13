import React, { useEffect, useRef, useState } from 'react';
import { database, db } from './components/firebase';
import pc from './components/webrtc';
import styles from './app.module.css';
import {
  addDoc,
  collection,
  connectFirestoreEmulator,
  doc,
  onSnapshot,
  query,
  setDoc,
} from 'firebase/firestore';
import { nanoid } from 'nanoid';
export default function Aspp() {
  //id
  const id = nanoid();
  const [getid, setGetId] = useState('');
  //localstream
  const localStreamRef = useRef();
  const [creatorUser, setCreatorUser] = useState();
  const constraints = { audio: false, video: { width: 380, height: 380 } };
  //yourStreamRef
  const yourStreamRef = useRef();
  let remoteStream;
  //On & off(camera / audio)
  const [cameraOn, setCameraOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);

  //roomName
  const roomNameRef = useRef();
  const [roomName, setRoomName] = useState();

  //main && join
  const [openVideo, setOpenVideo] = useState(false);
  const [welcome, setWelcom] = useState(false);
  //offer && answer
  const [offer, setOffer] = useState();
  let inputValueFind;
  const [answerRemote, setAnswerRemote] = useState();
  const localStream = async (inputValue) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current.srcObject = stream;
      setCreatorUser(stream);

      remoteStream = new MediaStream();
      console.log(remoteStream);
      yourStreamRef.current.srcObject = remoteStream;

      stream.getTracks().forEach((track) => {
        console.log('track2', track);
        pc.addTrack(track, stream);
      });
      console.log('작동확인');
      pc.ontrack = (e) => {
        console.log(e);
        e.streams[0].getTracks().forEach((track) => {
          console.log('track3', track);

          remoteStream.addTrack(track);
        });
      };

      console.log(inputValue);

      setOffer(offer.sdp);
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

  const roomJoinSubmit = async (e) => {
    e.preventDefault();
    const inputValue = roomNameRef.current.value;
    roomNameRef.current.value = '';

    inputValueFind = getid && getid?.find((i) => i.inputValue === inputValue);
    // console.log(inputValueFind);
    if (!inputValueFind) {
      setWelcom(true);
      localStream(inputValue).then(async () => {
        const offer = await pc.createOffer();
        await addDoc(collection(db, `Room`), {
          sdp: offer.sdp,
          type: offer.type,
          id,
          inputValue,
        });
        await pc.setLocalDescription(offer);
        console.log('room create');
      });
    } else {
      localStream(inputValue).then(() => {
        console.log('join');
        const offerSession = new RTCSessionDescription({
          sdp: inputValueFind.sdp,
          type: inputValueFind.type,
        });
        pc.setRemoteDescription(offerSession).then(async () => {
          const answer = await pc.createAnswer();
          console.log(answer);
          await pc.setLocalDescription(answer);
          console.log(answer);
          await addDoc(collection(db, `Room`), {
            inputValue,
            sdp: answer.sdp,
            type: answer.type,
          });
        });
        // remoteAnswer(inputValueFind);
        setAnswerRemote(inputValueFind);
        console.log('remote 완료');
      });
    }
    setRoomName(inputValue);
  };

  const remoteAnswer = async () => {
    console.log(answerRemote);
    const answerSession = new RTCSessionDescription({
      sdp: answerRemote.sdp,
      type: answerRemote.type,
    });
    pc.setRemoteDescription(answerSession);
    console.log('answer완료');
  };

  useEffect(() => {
    const q = query(collection(db, `Room`));
    const unsub = onSnapshot(q, (query) => {
      let a = [];
      query.forEach((doc) => {
        a.push(doc.data());
        setGetId(a);
      });
      setOffer(a?.sdp);
    });

    return () => {
      unsub();
    };
  }, [roomName, offer, remoteStream, answerRemote]);
  console.log(answerRemote);
  console.log(welcome);
  return (
    <div className={styles.App}>
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
      <button onClick={remoteAnswer}> answer Remote</button>
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
    </div>
  );
}
