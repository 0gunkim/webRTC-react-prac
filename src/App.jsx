import React, { useState } from 'react';
import Video from './components/Video';
import Main from './components/Main';
export default function App() {
  const [page, setPage] = useState('main');
  const [roomName, setRoomName] = useState();
  const [join, setJoin] = useState(false);
  const [joinRoomName, setJoinRoomName] = useState();
  return (
    <>
      {page === 'meeting' ? (
        <Video
          page={page}
          join={join}
          joinRoomName={joinRoomName}
          // setPage={setPage} 차후 홈으로 이동할 때 이용
          roomName={roomName}></Video>
      ) : (
        <Main
          setPage={setPage}
          setRoomName={setRoomName}
          setJoin={setJoin}
          setJoinRoomName={setJoinRoomName}></Main>
      )}
    </>
  );
}
