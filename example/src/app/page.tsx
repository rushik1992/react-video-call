"use client";
import React, { useState } from "react";
import firebaseConfig from "./../../firebasecrads.json";
import { ReactVideoCall } from 'react-video-call';

export default function Home() {

  const [roomName, setRoomName] = useState("");

  const configuration = {

    iceServers:
      [
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        {
          urls: ["stun:bn-turn2.xirsys.com"]
        },
        {
          username: "MR30rcWzcXsqDI6iPIie5uENagfiKKUqustgR92-N1yOyNF2hMb4tNHRZmlYl0eSAAAAAGgpqIJyb2hhbjE5OTE=",
          credential: "9eb931c2-33ca-11f0-8b8c-0242ac140004",
          urls: [
            "turn:bn-turn2.xirsys.com:80?transport=udp",
            "turn:bn-turn2.xirsys.com:3478?transport=udp",
            "turn:bn-turn2.xirsys.com:80?transport=tcp",
            "turn:bn-turn2.xirsys.com:3478?transport=tcp",
            "turns:bn-turn2.xirsys.com:443?transport=tcp",
            "turns:bn-turn2.xirsys.com:5349?transport=tcp"
          ]
        }]
  };


  return (

    <div className="items-center flex flex-col h-full font-[family-name:var(--font-geist-sans)]">
      <div className="flex w-full p-1">
        <input
          type="text"
          onChange={(e) => { setRoomName(e?.target?.value) }}
          placeholder={"Enter same room name both users"}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-gray-200"
        />
      </div>
      <div className="flex-1 w-full p-4">
        <ReactVideoCall roomName={roomName} firebaseConfig={firebaseConfig} RTCConfiguration={configuration}></ReactVideoCall>
      </div>
    </div>
  );
}
