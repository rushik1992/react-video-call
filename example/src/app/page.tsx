"use client";
import React, { useEffect, useState } from "react";
import firebaseConfig from "./../../firebasecrads.json";
// import { ReactVideoCall } from 'react-video-call';
import { ReactVideoCall } from '../../../src/components/index';

export default function Home() {

  const [roomName, setRoomName] = useState("");

  const configuration = {

    iceServers:
      [
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        // {
        //   urls: ["stun:bn-turn2.xirsys.com"]
        // }, 
        {
          username: "174818007989396294",
          credential: "oFL3QftEAny9YWlvqnb06A41MP0=",
          urls: [
            "turn:relay1.expressturn.com:3480"
          ]
        }]
  };

  useEffect(() => {
  }, []);

  return (
    <>
    <div className="items-center flex flex-col h-full font-[family-name:var(--font-geist-sans)]">
      <div className="flex w-full">
        <input
          type="text"
          onChange={(e) => { setRoomName(e?.target?.value) }}
          placeholder={"Enter same room name both users"}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-gray-200"
        />
      </div>
      <div className="flex-1 w-full p-2">
        <ReactVideoCall roomName={roomName} firebaseConfig={firebaseConfig} RTCConfiguration={configuration}></ReactVideoCall>
      </div>
    </div>
    </>
  );
}
