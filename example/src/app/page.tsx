"use client";
import ReactVideoCall from "../../components/react-video-call/ReactVideoCall";
import firebaseConfig from "./../../firebasecrads.json";

// const ReactVideoCall = dynamic(import("../../components/react-video-call/ReactVideoCall"), {
//   ssr: false});
export default function Home() {

  
const configuration = {

  iceServers: 
  // [
  //     {
  //         "username": "vjuQ952bz7IZKhG0g8fVwEQDjaxck6FfhAF3ucY2KcUZyOPV3QqMkfgzt7VtdJudAAAAAGeUq-hyYW1lc2gxOTky",
  //         "urls": [
  //             "stun:bn-turn2.xirsys.com",
  //             "turn:bn-turn2.xirsys.com:80?transport=udp",
  //             "turn:bn-turn2.xirsys.com:3478?transport=udp",
  //             "turn:bn-turn2.xirsys.com:80?transport=tcp",
  //             "turn:bn-turn2.xirsys.com:3478?transport=tcp",
  //             "turns:bn-turn2.xirsys.com:443?transport=tcp",
  //             "turns:bn-turn2.xirsys.com:5349?transport=tcp"
  //         ],
  //         "credential": "0c7bbc2e-dafd-11ef-bb47-0242ac140004"
  //     }
  // ]

  [
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
  ],
};


  return (
    <div className="items-center justify-items-center h-full font-[family-name:var(--font-geist-sans)]">
      <ReactVideoCall firebaseConfig={firebaseConfig} RTCConfiguration={configuration}></ReactVideoCall>
    </div>
  );
}
