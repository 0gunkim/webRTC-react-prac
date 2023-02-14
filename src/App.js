import React, { useEffect, useRef, useState } from 'react';
import { db } from './components/firebase';
import pc from './components/webrtc';
import styles from './app.module.css';
import { addDoc, collection, onSnapshot, query } from 'firebase/firestore';
import { nanoid } from 'nanoid';
export default function Aspp() {
  //id
  const id = nanoid();
  const [getid, setGetId] = useState(null);
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
  const answernameRef = useRef();

  //main && join
  // const [openVideo, setOpenVideo] = useState(false);
  // const [welcome, setWelcom] = useState(false);
  //offer && answer
  const [offer, setOffer] = useState();
  let inputValueFind;
  const [answerRemote, setAnswerRemote] = useState();
  const localStream = async (inputValue) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCreatorUser(stream);

      remoteStream = new MediaStream();

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
      console.log('작동확인');
      pc.ontrack = (e) => {
        e.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
      };

      localStreamRef.current.srcObject = stream;
      yourStreamRef.current.srcObject = remoteStream;
      console.log(inputValue);
    } catch (error) {
      console.log(error);
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

    let cadidateAdd;
    inputValueFind = getid?.filter((i) => i.inputValue);
    const findRoom = inputValueFind?.find((i) => i.inputValue === inputValue);
    console.log(inputValueFind);
    if (!findRoom) {
      localStream(inputValue).then(async () => {
        pc.onicecandidate = async (event) => {
          console.log('캔디데이트 전송완료');
          console.log(event);
          pc.addIceCandidate(event.candidate);
          // console.log(event.candidate.toJSON());
          console.log(event);
          cadidateAdd = event.candidate.toJSON();
          // cadidateAdd = JSON.stringify(event.candidate);
          console.log(cadidateAdd);
          await addDoc(collection(db, `Room`), {
            inputValue,
            type: 'offerCandidate',
            offerCadidate: cadidateAdd,
          });
        };
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
        console.log(inputValueFind);
        console.log('join');
        const findOfferType = inputValueFind.find((i) => i.type === 'offer');
        const offerSession = new RTCSessionDescription({
          sdp: findOfferType.sdp,
          type: findOfferType.type,
        });
        pc.setRemoteDescription(offerSession).then(async () => {
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await addDoc(collection(db, `Room`), {
            inputValue,
            sdp: answer.sdp,
            type: answer.type,
          });
        });

        setAnswerRemote(inputValueFind);
      });
      setRoomName(inputValue);

      const findTypeOfferCandy = inputValueFind.filter(
        (i) => i.type === 'offerCandidate' && i.inputValue === inputValue
      );
      try {
        pc.addIceCandidate(new RTCIceCandidate(findTypeOfferCandy));
        console.log('연결성공');
      } catch (e) {
        console.log(e);
      }

      console.log(findTypeOfferCandy);
    }
  };
  const remoteAnswer = async () => {
    const getRoomName = answernameRef.current.value;
    const findAnswer = getid.find((i) => i.inputValue === getRoomName);
    if (findAnswer.type === 'answer') {
      const answerSession = new RTCSessionDescription({
        sdp: findAnswer.sdp,
        type: findAnswer.type,
      });
      await pc.setRemoteDescription(answerSession);
      console.log('answer완료');
    }
  };
  const candy = () => {
    const q = query(collection(db, `Room`));
    const unsub = onSnapshot(q, (query) => {
      let arr = [];
      query.forEach((doc) => {
        arr.push(doc.data().inputValue);
        console.log(arr);
        const findOfferCandy = arr.filter((i) => i.inputValue === 'df');
        console.log(findOfferCandy);
      });
    });
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

  console.log(pc.curr);
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
      <button onClick={candy}> candiateOffer</button>
      <input
        type='text'
        ref={answernameRef}
      />
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
