import React, { useEffect, useRef, useState } from 'react';
import styles from './app.module.css';
export default function App() {
  //localstream
  const localStreamRef = useRef();
  const [creatorUser, setCreatorUser] = useState();
  const constraints = { audio: true, video: { width: 380, height: 380 } };
  //On & off(camera / audio)
  const [cameraOn, setCameraOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);

  const localStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current.srcObject = stream;
      setCreatorUser(stream);
    } catch (error) {
      console.error('no connact localStream');
    }
  };

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
  console.log(audioOn);
  useEffect(() => {
    localStream();
  }, []);
  return (
    <div className={styles.App}>
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
    </div>
  );
}
