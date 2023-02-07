import servers from './stunSever';

const pc = new RTCPeerConnection(servers);
let localStream = null;
let remoteStream = null;

export default pc;
