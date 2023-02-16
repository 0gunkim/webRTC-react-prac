import React from 'react';
import { useRef } from 'react';
import styles from './Video.module.css';
import pc from './webrtc';
import { addDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { query } from 'firebase/database';
export default function Video(props) {
  const { page, roomName, join, joinRoomName } = props;
  const localStreamRef = useRef();
  const remoteStreamRef = useRef();
  //Video init
  const constraints = {
    video: { width: 380, height: 220 },
    audio: true,
  };
  //Connact Video

  const localStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      const remoteStream = new MediaStream();

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
      pc.ontrack = (e) => {
        e.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
      };

      if (!join) {
        const postData = collection(db, `${roomName}`);
        const offerCandidate = collection(db, 'offerCadidate');
        const answerCandidate = collection(db, 'answerCandidate');

        const createOfferDescription = await pc.createOffer();
        await pc.setLocalDescription(createOfferDescription);
        const offer = {
          sdp: createOfferDescription.sdp,
          type: createOfferDescription.type,
          roomName,
        };

        addDoc(postData, offer);

        pc.onicecandidate = (e) => {
          if (e.candidate) {
            const candy = {
              candy: e.candidate.toJSON(),
              roomName,
            };
            addDoc(offerCandidate, candy);
          }
        };
        const locate = query(postData);
        onSnapshot(locate, (snap) => {
          let data = [];
          snap.forEach((doc) => {
            data.push(doc.data());
          });
          const findAnswer = data.find((i) => i.type === 'answer');

          if (findAnswer) {
            const answer = {
              sdp: findAnswer.sdp,
              type: findAnswer.type,
            };
            const answerDescription = new RTCSessionDescription(answer);
            pc.setRemoteDescription(answerDescription);
            console.log('Merry 님이 접속했습니다.');
          }
        });

        const candidateLocate = query(answerCandidate);
        onSnapshot(candidateLocate, (snap) => {
          snap.forEach((doc) => {
            if (doc.data().joinRoomName === roomName) {
              const answerCandy = doc.data();
              pc.addIceCandidate(new RTCIceCandidate(answerCandy.candy));
            }
          });
        });
      } else if (join) {
        const postData = collection(db, `${joinRoomName}`);
        const offerCandidate = collection(db, 'offerCadidate');
        const answerCandidate = collection(db, 'answerCandidate');

        // answer create
        pc.onicecandidate = (e) => {
          if (e.candidate) {
            const candy = {
              candy: e.candidate.toJSON(),
              joinRoomName,
            };
            addDoc(answerCandidate, candy);
          }
        };

        const getOffer = await getDocs(postData);
        let offer;
        getOffer.forEach((doc) => {
          offer = doc.data();
        });
        await pc.setRemoteDescription(
          new RTCSessionDescription({ sdp: offer.sdp, type: offer.type })
        );
        const createAnswerDescription = await pc.createAnswer();
        await pc.setLocalDescription(createAnswerDescription);

        const answer = {
          sdp: createAnswerDescription.sdp,
          type: createAnswerDescription.type,
          joinRoomName,
        };
        await addDoc(postData, answer);

        // offer candidate get
        try {
          const candidateLocate = query(offerCandidate);
          onSnapshot(candidateLocate, (snap) => {
            snap.forEach((doc) => {
              if (doc.data().roomName === joinRoomName) {
                const offerCandy = doc.data();
                pc.addIceCandidate(new RTCIceCandidate(offerCandy.candy));
              }
            });
          });
        } catch (e) {
          console.log(e);
        }
      }
      localStreamRef.current.srcObject = stream;
      remoteStreamRef.current.srcObject = remoteStream;
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <div className={styles.containel}>
      <h1>{join ? 'JOIN ROOM' : 'CREATE ROOM'}</h1>
      <div className={styles.roomName}>
        ROOM-NAME: <span>{join ? joinRoomName : roomName}</span>
      </div>
      <video
        autoPlay
        ref={localStreamRef}></video>
      <button onClick={localStream}>Video Start</button>
      <video
        autoPlay
        ref={remoteStreamRef}></video>
    </div>
  );
}
