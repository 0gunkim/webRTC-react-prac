import React, { useRef } from 'react';
import styles from './Main.module.css';
import { nanoid } from 'nanoid';
export default function Main(props) {
  const { setPage, setRoomName, setJoin, setJoinRoomName } = props;

  const joinValueRef = useRef();

  const roomName = nanoid();
  //Create
  const createRoomHandler = () => {
    setRoomName(roomName);
    setPage('meeting');
  };
  //Join
  const joinButtonHandler = () => {
    setPage('meeting');
    const joinInput = joinValueRef.current.value;
    setJoinRoomName(joinInput);
    setJoin(true);
  };
  return (
    <div>
      <button
        className={styles.createButton}
        onClick={createRoomHandler}>
        CREATE
      </button>
      <table>
        <tr>
          <td>dsf</td>
          <td>dsf</td>
        </tr>
        <tr>
          <td>dsf</td>
          <td>dsf</td>
        </tr>
        <tr>dsf</tr>
      </table>
      <input
        type='text'
        ref={joinValueRef}
      />
      <button
        className={styles.createButton}
        onClick={joinButtonHandler}>
        JOIN
      </button>
    </div>
  );
}
//유저 입장 기능설명
// 1. create button : nanoid를 생성하고  프롭스로 전달받은 setState로 state 변경
// 2. join Button : peer1에게 전달 받은 방이름을 setState 넘겨준다. 이후 오퍼레이터는 Video태그에서 진행
