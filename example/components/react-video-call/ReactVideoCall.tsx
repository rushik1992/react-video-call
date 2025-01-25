
"use client";

import { RefObject, useEffect, useRef, useState } from "react";
import "./ReactVideoCall.scss";
import { FirebaseWrapper } from "./libs/firebaseLib";
import { WebRTCManager } from "./libs/webrtcManager";
export interface ReactVideoCallProps {

}
export default function ReactVideoCall({ }: ReactVideoCallProps) {

    const [webrtcManager, setWebRtcManager] = useState<WebRTCManager | null>();
    const [connectionStatus, setconnectionStatus] = useState<string | null>(null);
    const [selectedCamera, setSelectedCamera] = useState<any>();
    const [selectedAudio, setSelectedAudio] = useState<any>();
    const [videoDevices, setvideoDevices] = useState<any>([]);
    const [audioDevices, setaudioDevices] = useState<any>([]);
    const localVidRef = useRef<HTMLVideoElement>(null);
    const remortVidRef = useRef<HTMLVideoElement>(null);

    const initRTCConnection = async () => {
        console.log("initializing")
        setconnectionStatus(null);
        const manager = new WebRTCManager(localVidRef as RefObject<HTMLVideoElement>, remortVidRef as RefObject<HTMLVideoElement>)
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
                    className="block appearance-none w-full bg-black/[.05] border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedCamera} onChange={(e) => {
                        setSelectedCamera(e.target.value);
                    }}>
                    <option>Select Camera</option>
                    {
                        videoDevices.map((m: any) => (
                            <option value={m.value} key={m.value}>{m.label}</option>
                        ))
                    }
                </select>

                <select
                    className=" bg-black/[.05] block appearance-none w-full border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedAudio} onChange={(e) => {
                        setSelectedAudio(e.target.value);
                    }}>
                    <option>Select mic</option>
                    {
                        audioDevices.map((m: any) => (
                            <option value={m.value} key={m.value}>{m.label}</option>
                        ))
                    }
                </select>
            </div>
            <div className="rv-video-container">
                <video className="local-video" ref={localVidRef} autoPlay playsInline muted={true} />
                <video className="remort-video" ref={remortVidRef} autoPlay playsInline controls muted={true} />

                <div className="control-bar">
                    {

                        connectionStatus === null || connectionStatus === "" ?
                            (
                                <>
                                    <button type="button"
                                        className="bg-white text-blue-600 font-medium mx-4 py-2 px-6 rounded-full shadow-md hover:bg-gray-100 focus:bg-gray-100"
                                        onClick={() => {
                                            if (webrtcManager) {
                                                webrtcManager.createRoom("Rushik1")
                                            }
                                        }}>C</button>
                                    <button type="button"
                                        className="bg-white text-blue-600 font-medium py-2 px-6 rounded-full shadow-md hover:bg-gray-100 focus:bg-gray-100"
                                        onClick={() => {
                                            if (webrtcManager) {
                                                webrtcManager.joinRoom("Rushik1")
                                            }
                                        }}>J</button>
                                </>
                            )

                            : (
                                <>
                                    <span>{connectionStatus}</span>

                                    <button type="button"
                                        className="bg-white text-blue-600 font-medium py-2 px-6 rounded-full shadow-md hover:bg-gray-100 focus:bg-gray-100"
                                        onClick={() => {
                                            if (webrtcManager) {
                                                webrtcManager.disconnectAll();
                                                setconnectionStatus(null);
                                                setWebRtcManager(null);
                                            }
                                        }}>D</button>
                                </>
                            )}
                </div>
            </div>
            {/* <a href="#" className="bg-white text-blue-600 font-medium py-2 px-6 rounded-full shadow-md hover:bg-gray-100">Get Started</a> */}

        </div>
    )

};
