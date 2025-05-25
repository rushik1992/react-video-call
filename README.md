# ReactVideoCall

`ReactVideoCall` is an React Component Allow Webrtc based Video call streaming with simple Firebase based signaling.
Very simple to integrate in react application with Desktop and Mobile view suppoer.

## Installation

```sh
$ npm install react-vidoe-call
```

## Demo Link
[Click Here](https://teli-call.web.app/)

## Component Inputs

|Name|Type|Description
|---|---|---|
|`roomName`|`String` | Pass name which need to be comman for both user who want to connect each other.
|`firebaseConfig`|`FirebaseOptions`| Firebase config info for allow to create room and use for signaling for both user. For Security use correct Firebase rule and Auth.
|`RTCConfiguration`|`RTCConfiguration`| WebRTC Configuration for iceServers you can use own Turn servers or Service provider like [https://xirsys.com/](https://xirsys.com/) or other


### Code App.tsx

```ts

"use client";
import React, { useState } from "react";
import firebaseConfig from "./../../firebasecrads.json";
import { ReactVideoCall } from 'react-video-call';

export default function Home() {

  const [roomName, setRoomName] = useState("");

  const configuration = {

    iceServers:
      [
        //Use TURN servers to make it work in internal network/Mobile Network
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
      ]
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

```


