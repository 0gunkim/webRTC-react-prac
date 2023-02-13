import servers from './stunSever';

const pc = new RTCPeerConnection(servers);

export default pc;
