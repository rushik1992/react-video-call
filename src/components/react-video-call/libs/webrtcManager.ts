import { RefObject } from "react";
import { FirebaseWrapper } from "./firebaseLib";
import { DocumentData, Unsubscribe } from "firebase/firestore";
import { FirebaseOptions } from "firebase/app";


type OnUpdateStateCalBack = (state: RTCPeerConnectionState, event: Event) => void;


export interface Idevice {
    value: string;
    label: string;
    data: MediaDeviceInfo;
}

export class WebRTCManager {
    ref: string = new Date().toISOString();
    fireBaseDb: FirebaseWrapper;
    peerConnection: RTCPeerConnection;
    localStream?: MediaStream;
    remoteStream?: MediaStream;
    onStateChange?: OnUpdateStateCalBack;
    localVidEle: RefObject<HTMLVideoElement>;
    remortVidEle: RefObject<HTMLVideoElement>;
    roomUnSub?: Unsubscribe;
    roomRole?: "owner" | "joiner";


    constructor(
        firebaseConfig: FirebaseOptions,
        localVidEle: RefObject<HTMLVideoElement>,
        remortVidEle: RefObject<HTMLVideoElement>,
        RTCConfiguration: RTCConfiguration
    ) {

        this.fireBaseDb = new FirebaseWrapper(firebaseConfig);
        this.localVidEle = localVidEle;
        this.remortVidEle = remortVidEle;
        this.peerConnection = new RTCPeerConnection(RTCConfiguration);
        this.peerConnection.ontrack = (event) => {
            this.onRemortTrack(event);
        }

        this.peerConnection.onconnectionstatechange = (event) => {
            console.debug("connectionState", this.peerConnection.connectionState);
            if (this.onStateChange) {
                this.onStateChange(this.peerConnection.connectionState, event)
            }
        }
        const videoElement = localVidEle.current;
        // let isDragging = false;
        // let offsetX: number, offsetY: number;

        // // Handle start of dragging (both mouse and touch)
        // function startDrag(e: TouchEvent | MouseEvent) {
        //     isDragging = true;

        //     let clientX: number;
        //     let clientY: number;
        //     if (e instanceof TouchEvent) {
        //         clientX = e.touches[0].clientX;
        //         clientY = e.touches[0].clientY;
        //     } else {
        //         clientX = e.clientX;
        //         clientY = e.clientY;
        //     }


        //     offsetX = clientX - videoElement.offsetLeft;
        //     offsetY = clientY - videoElement.offsetTop;

        //     videoElement.style.cursor = 'grabbing';
        // }

        // // Handle dragging (both mouse and touch)
        // function drag(e: TouchEvent | MouseEvent) {
        //     if (!isDragging) return;

        //     let clientX: number;
        //     let clientY: number;

        //     if (e instanceof TouchEvent) {
        //         clientX = e.touches[0].clientX;
        //         clientY = e.touches[0].clientY;
        //     } else {
        //         clientX = e.clientX;
        //         clientY = e.clientY;
        //     }

        //     // Calculate the new position
        //     let newX = clientX - offsetX;
        //     let newY = clientY - offsetY;

        //     // Keep the video within the container boundaries
        //     if (!videoElement.parentElement) return;
        //     const rect = videoElement.parentElement.getBoundingClientRect();
        //     const videoRect = videoElement.getBoundingClientRect();

        //     if (newX < 0) newX = 0;
        //     if (newY < 0) newY = 0;
        //     if (newX + videoRect.width > rect.width) newX = rect.width - videoRect.width;
        //     if (newY + videoRect.height > rect.height) newY = rect.height - videoRect.height;

        //     // Update the position
        //     videoElement.style.left = `${newX}px`;
        //     videoElement.style.top = `${newY}px`;
        // }

        // // Handle end of dragging (both mouse and touch)
        // function endDrag() {
        //     isDragging = false;
        //     videoElement.style.cursor = 'grab';
        // }

        // // Mouse events
        // videoElement.addEventListener('mousedown', startDrag);
        // document.addEventListener('mousemove', drag);
        // document.addEventListener('mouseup', endDrag);

        // // Touch events
        // videoElement.addEventListener('touchstart', startDrag);
        // document.addEventListener('touchmove', drag);
        // document.addEventListener('touchend', endDrag);
    }

    async joinOrStartRoom(name: string) {
        this.peerConnection.onicecandidate = async (event) => {
            //Event that fires off when a new answer ICE candidate is created
            if (event.candidate) {

                await this.fireBaseDb.updateRoom(this.roomRole==="owner"?"offer": "answer", JSON.stringify(this.peerConnection.localDescription));
            }
        };
        this.roomUnSub = await this.fireBaseDb.joinRoom(name, async (data: DocumentData | undefined) => {            
            if (!this.roomRole && (!data || (!data.create && !data.offer))) {
                console.debug("As Owner creating offer.")
                this.roomRole = "owner";
                const offer = await this.peerConnection.createOffer();
                await this.peerConnection.setLocalDescription(offer);
                await this.fireBaseDb.createRoom(name,this.ref);

            } else if (
                (this.roomRole === "owner" && data && data?.create && data?.create?.ref !==this.ref) ||
                (!this.roomRole && (data && data.offer && !data.completed2))
            ) {
                if(this.roomRole === "owner") 
                    console.debug("Got racecondition and moving to joiner")
                console.debug("Joiner creating answer")

                this.roomRole = "joiner";
                await this.peerConnection.setRemoteDescription(JSON.parse(data.offer));
                const answer = await this.peerConnection.createAnswer();
                await this.peerConnection.setLocalDescription(answer);
                await this.fireBaseDb.updateRoom("completed2", true);
            } else if (this.roomRole ==="owner" && data && data.answer && !data.completed1) {
                console.debug("OWNER GOT Answer",this.ref)
                this.peerConnection.setRemoteDescription(JSON.parse(data.answer));
                await this.fireBaseDb.updateRoom("completed1", true)
            }
        });
    }

    onRemortTrack(event: RTCTrackEvent) {
        if (event.track.kind === "video") {
            return;
        }
        console.log("onRemortTrack");
        if (this.remoteStream) {
            this.remoteStream.getTracks().forEach(track => {
                track.stop();
            });
        }
        const newstrema = new MediaStream();
        event.streams[0].getTracks().forEach((track) => {
            newstrema.addTrack(track);
        });
        this.remoteStream = newstrema;

        this.remortVidEle.current.srcObject = this.remoteStream;
        // this.remortVidEle.current.volume = 0;
        this.remortVidEle.current.play();

    }

    async getDevices(): Promise<{ audioDevices: Idevice[]; videoDevices: Idevice[]; }> {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            console.debug("Media devices not supported in this browser.");
            return { audioDevices: [], videoDevices: [] };
        }

        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const deviceInfos: MediaDeviceInfo[] = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = [], videoDevices = [];
        for (const deviceInfo of deviceInfos) {
            if (deviceInfo.kind === "audioinput") {
                audioDevices.push({
                    value: deviceInfo.deviceId,
                    label: deviceInfo.label,
                    data: deviceInfo
                })
            } else if (deviceInfo.kind === "videoinput") {
                videoDevices.push({
                    value: deviceInfo.deviceId,
                    label: deviceInfo.label,
                    data: deviceInfo
                })
            }
        }
        return { audioDevices, videoDevices }
    }
    async selectDevice(camera: string | undefined, mic: string | undefined) {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            console.debug("Media devices not supported in this browser.");
            return;
        }
        const constraints = {
            audio: mic ? { deviceId: mic ? { exact: mic } : undefined } : true,
            video: camera ? { deviceId: camera ? { exact: camera } : undefined, facingMode: "user" } : true
        };
        navigator.mediaDevices.getUserMedia(constraints).
            then((stream) => {
                console.debug("Setting local Devices.")
                if (this.localStream) {
                    this.localStream.getTracks().forEach(track => {
                        track.stop();
                    });
                }
                this.localStream = stream;

                if (this.localStream) {
                    this.localStream.getTracks().forEach((track) => {
                        if (this.localStream) {
                            this.peerConnection.getSenders
                            var sender = this.peerConnection.getSenders().find(function (s) {
                                return s?.track?.kind && s?.track?.kind === track?.kind;
                            });
                            if(sender){
                                console.debug("Replace track");
                                sender.replaceTrack(track);
                            }
                            else{
                                console.debug("Add new track");
                                this.peerConnection.addTrack(track, this.localStream);
                            }

                        }
                    });

                    this.localVidEle.current.srcObject = this.localStream;
                    this.localVidEle.current.volume = 0;
                    this.localVidEle.current.play();
                    this.localVidEle.current.style.transform = "scaleX(" + "-1" + ")";
                }
            }).catch((err) => {
                console.debug("Could not load stream", err)
            });


    }

    disconnectAll() {
        if (this.roomUnSub) {
            this.roomUnSub();
        }
        this.peerConnection.close();
        if (this.localStream) {


            // Stop all media tracks
            this.localStream.getTracks().forEach((track) => track.stop());
            this.localStream = undefined;
        }
        if (this.remoteStream) {


            // Stop all media tracks
            this.remoteStream.getTracks().forEach((track) => track.stop());
            this.remoteStream = undefined;
        }

        if (this.peerConnection) {
            this.peerConnection.onicecandidate = null;
            this.peerConnection.ontrack = null;
            this.peerConnection.oniceconnectionstatechange = null;
            this.peerConnection.onnegotiationneeded = null;
            this.peerConnection.onsignalingstatechange = null;
            this.peerConnection.onconnectionstatechange = null;
        }
        this.fireBaseDb.leaveRoom();
        console.debug('Connection Closed...');
    }


    muteMic(isMiute: boolean) {
        this.localStream?.getAudioTracks().forEach(track => track.enabled = !isMiute);
        console.debug("Microphone is muted");
    }

}
