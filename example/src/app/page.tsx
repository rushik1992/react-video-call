"use client";
import { useState } from "react";
import ReactVideoCall from "../../components/react-video-call/ReactVideoCall";
import firebaseConfig from "./../../firebasecrads.json";

// const ReactVideoCall = dynamic(import("../../components/react-video-call/ReactVideoCall"), {
//   ssr: false});
export default function Home() {

  const [roomName, setRoomName] = useState("");

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
    <div className="items-center flex flex-col h-full font-[family-name:var(--font-geist-sans)]">
      <div className="flex w-full p-1">
        <input
          type="text"
          // value={roomName}
          onChange={(e) => { setRoomName(e?.target?.value) }}
          placeholder={"Room Name"}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-gray-200"
        />
      </div>
      <div className="flex-1 w-full p-4">
        <ReactVideoCall roomName={roomName} firebaseConfig={firebaseConfig} RTCConfiguration={configuration}></ReactVideoCall>
      </div>
    </div>
  );
}
