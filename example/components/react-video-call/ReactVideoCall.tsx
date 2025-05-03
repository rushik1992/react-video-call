
"use client";

import { RefObject, useEffect, useRef, useState } from "react";
import "./ReactVideoCall.scss";
import { Idevice, WebRTCManager } from "./libs/webrtcManager";
import { Icon } from "../icons";
import { FirebaseOptions } from "firebase/app";
export interface ReactVideoCallProps {
    roomName: string;
    firebaseConfig: FirebaseOptions;
    RTCConfiguration: RTCConfiguration;
}
export default function ReactVideoCall({ roomName, firebaseConfig, RTCConfiguration }: ReactVideoCallProps) {

    const [webrtcManager, setWebRtcManager] = useState<WebRTCManager | null>();
    const [connectionStatus, setconnectionStatus] = useState<string | null>(null);
    const [selectedCamera, setSelectedCamera] = useState<string>();
    const [selectedAudio, setSelectedAudio] = useState<string>();
    const [videoDevices, setvideoDevices] = useState<Idevice[]>([]);
    const [audioDevices, setaudioDevices] = useState<Idevice[]>([]);
    const [isMicMuted, setisMicMuted] = useState<boolean>(false);
    const [isVolumeMute, setisVolumeMute] = useState<boolean>(true);
    const localVidRef = useRef<HTMLVideoElement>(null);
    const remortVidRef = useRef<HTMLVideoElement>(null);

    const initRTCConnection = async () => {
        setconnectionStatus(null);
        const manager = new WebRTCManager(
            firebaseConfig,
            localVidRef as RefObject<HTMLVideoElement>,
            remortVidRef as RefObject<HTMLVideoElement>,
            RTCConfiguration
        )
        const { videoDevices, audioDevices } = await manager.getDevices();
        manager.onStateChange = (status: string) => {
            setconnectionStatus(status);
        }
        setWebRtcManager(manager);
        setvideoDevices(videoDevices);
        setaudioDevices(audioDevices);

    }

    useEffect(() => {
        if (!webrtcManager && remortVidRef && localVidRef) {
            initRTCConnection();
        }
    }, [localVidRef, remortVidRef, webrtcManager]);

    useEffect(() => {
        if (webrtcManager) {
            webrtcManager.selectDevice(selectedCamera, selectedAudio);
        }
    }, [selectedCamera, selectedAudio, webrtcManager]);

    return (
        <div className="rv-call-container">
            <div className="device-selection">
                <select
                    id="camera-select"
                    className="block appearance-none w-full bg-black/[.05] border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedCamera} onChange={(e) => {
                        setSelectedCamera(e.target.value);
                    }}
                    suppressHydrationWarning={true}
                >

                    <option>Select Camera</option>
                    {
                        videoDevices.map((m) => (
                            <option value={m.value} key={m.value}>{m.label}</option>
                        ))
                    }
                </select>

                <select
                    id="audio-select"
                    className=" bg-black/[.05] block appearance-none w-full border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedAudio} onChange={(e) => {
                        setSelectedAudio(e.target.value);
                    }}
                    suppressHydrationWarning={true}
                >
                    <option>Select mic</option>
                    {
                        audioDevices.map((m) => (
                            <option value={m.value} key={m.value}>{m.label}</option>
                        ))
                    }
                </select>
            </div>
            <div className="rv-video-container">
                {connectionStatus && <span className="status">{connectionStatus}</span>}
                <video className="local-video" ref={localVidRef} autoPlay playsInline muted={true} />
                <video className="remort-video" ref={remortVidRef} autoPlay playsInline muted={isVolumeMute} />


            </div>
            <div className="control-bar">
                {

                    connectionStatus === null || connectionStatus === "" ?
                        (
                            <>
                                <button type="button"
                                    className="bg-white text-blue-600 font-medium mx-4 py-2 px-6 rounded-full shadow-md hover:bg-gray-100 focus:bg-gray-100"
                                    onClick={() => {
                                        if (webrtcManager && roomName) {
                                            webrtcManager.joinOrStartRoom(roomName)
                                            setconnectionStatus("waiting...")
                                        }
                                    }}>Start</button>                                
                            </>
                        )

                        : (
                            <>

                                <button type="button"
                                    className="bg-white text-blue-600 font-medium py-2 px-6 rounded-full shadow-md hover:bg-gray-100 focus:bg-gray-100"
                                    onClick={() => {
                                        if (webrtcManager) {
                                            webrtcManager.muteMic(!isMicMuted);
                                            setisMicMuted(!isMicMuted)
                                        }
                                    }}>

                                    <Icon type={isMicMuted ? "mic-off" : "mic"}></Icon>

                                </button>


                                <button type="button"
                                    className="bg-white text-blue-600 font-medium py-2 px-6 rounded-full shadow-md hover:bg-gray-300 focus:bg-gray-300 active:bg-gray-300"
                                    onClick={() => {
                                        setisVolumeMute(!isVolumeMute)
                                    }}>
                                    <Icon type={isVolumeMute ? "volume-off" : "volume"}></Icon>
                                </button>

                                <button type="button"
                                    className="bg-red-800 text-white font-medium py-2 px-6 rounded-full shadow-md active:bg-red-500 hover:bg-red-500 focus:bg-red-500"
                                    onClick={() => {
                                        if (webrtcManager) {
                                            webrtcManager.disconnectAll();
                                            setconnectionStatus(null);
                                            setWebRtcManager(null);
                                            setisMicMuted(false);
                                        }
                                    }}>

                                    <Icon type="hangup"></Icon>

                                </button>
                            </>
                        )}
            </div>
        </div>
    )

};
