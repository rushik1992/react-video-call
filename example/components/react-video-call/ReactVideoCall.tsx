
"use client";

import { useEffect, useRef, useState } from "react";
import "./ReactVideoCall.scss";
import { FirebaseWrapper } from "./libs/firebaseLib";

const configuration = {
    iceServers: [
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        //   { urls: 'stun:stun.stunprotocol.org:3478' },
        //   { urls: 'stun:stun.voipstunt.com' },
    ],
};
export interface ReactVideoCallProps {

}
export default function ReactVideoCall({ }: ReactVideoCallProps) {
    const [fireBaseDb, setFireBaseDb] = useState<FirebaseWrapper>(new FirebaseWrapper());

    const [peerConnection, setPeetConnection] = useState<RTCPeerConnection>(new RTCPeerConnection(configuration));
    const [conectionState, setConectionState] = useState<any>();
    const [localStream, setLoalStream] = useState<MediaStream>();
    const [remoteStream, setRemoteStream] = useState<MediaStream>();


    const [selectedCamera, setSelectedCamera] = useState<any>("");
    const [selectedAudio, setSelectedAudio] = useState<any>("");

    const [videoDevices, setvideoDevices] = useState<any>([]);
    const [audioDevices, setaudioDevices] = useState<any>([]);
    const localVidRef = useRef<HTMLVideoElement>(null);
    const remortVidRef = useRef<HTMLVideoElement>(null);


    useEffect(() => {
        loadDevices();
        peerConnection.ontrack = (event) => {
            if (remoteStream && remoteStream) {
                remoteStream.getTracks().forEach(track => {
                    track.stop();
                });
            }
            let newstrema= new MediaStream();
            event.streams[0].getTracks().forEach((track) => {
                newstrema.addTrack(track);
            });
            setRemoteStream(newstrema);
        };
        peerConnection.onconnectionstatechange = (e) => {
            console.log("connectionState", peerConnection.connectionState);
            // setConectionState(peerConnection.connectionState)
        }

        return () => {
            peerConnection.close();
        }
    }, []);


    useEffect(() => {
        if (selectedAudio && selectedCamera) {

            const constraints = {
                audio: { deviceId: selectedAudio ? { exact: selectedAudio } : undefined },
                video: { deviceId: selectedCamera ? { exact: selectedCamera } : undefined }
            };

            navigator.mediaDevices.getUserMedia(constraints).
                then((stream) => {
                    if (localStream) {
                        localStream.getTracks().forEach(track => {
                            track.stop();
                        });
                    }
                    setLoalStream(stream)

                    if (localStream) {
                        localStream.getTracks().forEach((track) => {
                            peerConnection.addTrack(track, localStream);
                        });
                    }
                }).catch((err) => {
                    console.log("Could not load stream", err)
                });

        }
    }, [selectedCamera, selectedAudio]);


    useEffect(() => {
        if (localStream && localVidRef.current) {
            localStream.getTracks().forEach((track) => {
                peerConnection.addTrack(track, localStream);
            });
            localVidRef.current.srcObject = localStream;
            localVidRef.current.volume = 0;
            localVidRef.current.play();
        }
    }, [localVidRef, localStream]);

    useEffect(() => {
        if (remoteStream && remortVidRef.current) {
            remoteStream.getTracks().forEach((track) => {
                peerConnection.addTrack(track, remoteStream);
            });
            remortVidRef.current.srcObject = remoteStream;
            remortVidRef.current.volume = 0;
            remortVidRef.current.play();
        }
    }, [remortVidRef, remoteStream]);

    const loadDevices = async () => {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        let deviceInfos: MediaDeviceInfo[] = await navigator.mediaDevices.enumerateDevices();
        let audioDevices = [], videoDevices = [];
        for (const deviceInfo of deviceInfos) {
            if (deviceInfo.kind === "audioinput") {
                audioDevices.push({
                    value: deviceInfo.deviceId,
                    label: deviceInfo.label
                })
            } else if (deviceInfo.kind === "videoinput") {
                videoDevices.push({
                    value: deviceInfo.deviceId,
                    label: deviceInfo.label
                })
            }
        }


        setvideoDevices(videoDevices);
        setaudioDevices(audioDevices)
    }


    const createRoom = async (name: string) => {


        peerConnection.onicecandidate = async (event: any) => {
            //Event that fires off when a new offer ICE candidate is created
            console.log("onicecandidate", event);
            if (event.candidate) {
                console.log("Offer CONFIGURED", peerConnection.localDescription)
                await fireBaseDb.updateRoom("offer", JSON.stringify(peerConnection.localDescription));
            }
        };
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        console.log("OFFRE created", offer)
        fireBaseDb.createRoom(name, async (data: any) => {
            console.log("onCreate", data)
            if (data.answer && !data.completed1) {
                peerConnection.setRemoteDescription(JSON.parse(data.answer));
                await fireBaseDb.updateRoom("completed1", true)
            }
        })

    }


    const joinRoom = async (name: string) => {

        peerConnection.onicecandidate = async (event) => {
            //Event that fires off when a new answer ICE candidate is created
            if (event.candidate) {
                await fireBaseDb.updateRoom("answer", JSON.stringify(peerConnection.localDescription));
                console.log('AnswerCreated', peerConnection.localDescription)
            }
        };


        fireBaseDb.joinRoom(name, async (data: any) => {
            console.log("onJoin", data)
            if (data.offer && !data.completed2) {
                await peerConnection.setRemoteDescription(JSON.parse(data.offer));
                let answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);
                await fireBaseDb.updateRoom("completed2", true);
            }
        });
    }

    return (
        <div className={`rv-call-container`} key={Date.now()} >
            <select value={selectedCamera} onChange={(e) => {
                setSelectedCamera(e.target.value);
            }}>
                <option>Select Camera</option>
                {
                    videoDevices.map((m: any) => (
                        <option value={m.value} key={m.value}>{m.label}</option>
                    ))
                }
            </select>

            <select value={selectedAudio} onChange={(e) => {
                setSelectedAudio(e.target.value);
            }}>
                <option>Select mic</option>
                {
                    audioDevices.map((m: any) => (
                        <option value={m.value} key={m.value}>{m.label}</option>
                    ))
                }
            </select>

            <div style={{ "margin": "10px" }}>
                <video ref={localVidRef} autoPlay playsInline controls muted={true} height={300} width={300}></video>
                <video ref={remortVidRef} autoPlay playsInline controls muted={true} height={300} width={300}></video>
                <span>{conectionState}</span>
            </div>
            <button type="button"
                className={"text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"}
                onClick={() => {
                    createRoom("Rushik1")
                }}>Create</button>

            <button type="button"
                className={"text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"}
                onClick={() => {
                    joinRoom("Rushik1")
                }}>Join</button>

        </div>
    )

};
