import servers from './stunSever';

const pc = new RTCPeerConnection(servers);
console.log(pc);

export default pc;
