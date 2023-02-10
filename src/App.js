import React, { useEffect, useRef, useState } from 'react';
import styles from './app.module.css';
export default function App() {
  //localstream
  const localStreamRef = useRef();
  const [creatorUser, setCreatorUser] = useState();
  const constraints = { audio: false, video: { width: 380, height: 380 } };

  const localStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current.srcObject = stream;
      setCreatorUser(stream);
    } catch (error) {
      console.error('no connact localStream');
    }
  };
  useEffect(() => {
    localStream();
  }, []);
  return (
    <div className={styles.App}>
      <video
        className={styles.localStream}
        ref={localStreamRef}
        autoPlay
        playsInline></video>
    </div>
  );
}
