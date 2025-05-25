
# ReactVideoCall

**ReactVideoCall** is a simple yet powerful WebRTC-based video call component for React. It uses Firebase for signaling and supports both **desktop** and **mobile** views with minimal setup.

## ✨ Features

- 📞 Peer-to-peer video calling using WebRTC
- 🔐 Firebase-based signaling (with security rules)
- 📱 Responsive UI for mobile and desktop
- 🔧 Easily configurable ICE/TURN servers
- ⚡ Quick integration with just a few lines

---

## 📦 Installation

Install via npm:

```bash
npm install react-video-call
```

---

## 🔗 Demo

👉 [Live Demo](https://teli-call.web.app/)

---

## 📥 Component Props

| Prop              | Type                | Description |
|-------------------|---------------------|-------------|
| `roomName`        | `string`            | Common room name used by both users to connect. |
| `firebaseConfig`  | `FirebaseOptions`   | Firebase configuration object for signaling. Use secure Firebase Auth and Firestore Rules. |
| `RTCConfiguration`| `RTCConfiguration`  | WebRTC configuration including `iceServers`. You can use your own TURN servers or services like [Xirsys](https://xirsys.com/). |

---

## 🚀 Example (App.tsx)

```tsx
"use client";
import React, { useState } from "react";
import firebaseConfig from "./../../firebasecrads.json";
import { ReactVideoCall } from 'react-video-call';

export default function Home() {
  const [roomName, setRoomName] = useState("");

  const configuration = {
    iceServers: [
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
    ]
  };

  return (
    <div className="flex flex-col items-center h-full font-[family-name:var(--font-geist-sans)]">
      <div className="w-full p-1">
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Enter the same room name for both users"
          className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      <div className="flex-1 w-full p-4">
        <ReactVideoCall
          roomName={roomName}
          firebaseConfig={firebaseConfig}
          RTCConfiguration={configuration}
        />
      </div>
    </div>
  );
}
```

---

## 🔐 Firebase Security Recommendation

For production use, apply proper Firebase Authentication and Firestore Rules to restrict access and ensure user privacy.

---

## 🧠 Notes

- Both users must enter the **same room name** to establish a connection.
- Ensure TURN servers are properly configured if behind firewalls or NAT (especially on mobile networks).

---

## 📄 License

MIT © [Your Name or Org]
