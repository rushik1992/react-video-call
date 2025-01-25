import { RefObject } from "react";
import { FirebaseWrapper } from "./firebaseLib";
import { Unsubscribe } from "firebase/firestore";

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
        //   { urls: 'stun:stun.stunprotocol.org:3478' },
        //   { urls: 'stun:stun.voipstunt.com' },
    ],
};

export class WebRTCManager {
    ref:string= new Date().toISOString();
    fireBaseDb: FirebaseWrapper = new FirebaseWrapper()
    peerConnection: RTCPeerConnection
    localStream?: MediaStream;
    remoteStream?: MediaStream;
    onStateChange?: Function;
    localVidEle: RefObject<HTMLVideoElement>;
    remortVidEle: RefObject<HTMLVideoElement>;
    roomUnSub?: Unsubscribe;


    constructor(localVidEle: RefObject<HTMLVideoElement>, remortVidEle: RefObject<HTMLVideoElement>) {
        console.log("Loaded Webrtc")
        this.localVidEle = localVidEle;
        this.remortVidEle = remortVidEle;
        this.peerConnection = new RTCPeerConnection(configuration);
        this.peerConnection.ontrack = (event) => {
            this.onRemortTrack(event);
        }

        this.peerConnection.onconnectionstatechange = (event) => {
            console.log("connectionState", this.peerConnection.connectionState);
            if (this.onStateChange) {
                this.onStateChange(this.peerConnection.connectionState, event)
            }
        }
        let videoElement = localVidEle.current;
        let isDragging = false;
        let offsetX: number, offsetY: number;

        // Handle start of dragging (both mouse and touch)
        function startDrag(e: any) {
            isDragging = true;

            // Determine the starting offset
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            offsetX = clientX - videoElement.offsetLeft;
            offsetY = clientY - videoElement.offsetTop;

            videoElement.style.cursor = 'grabbing';
        }

        // Handle dragging (both mouse and touch)
        function drag(e: any) {
            if (!isDragging) return;

            // Get the current mouse or touch position
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            // Calculate the new position
            let newX = clientX - offsetX;
            let newY = clientY - offsetY;

            // Keep the video within the container boundaries
            if (!videoElement.parentElement) return;
            const rect = videoElement.parentElement.getBoundingClientRect();
            const videoRect = videoElement.getBoundingClientRect();

            if (newX < 0) newX = 0;
            if (newY < 0) newY = 0;
            if (newX + videoRect.width > rect.width) newX = rect.width - videoRect.width;
            if (newY + videoRect.height > rect.height) newY = rect.height - videoRect.height;

            // Update the position
            videoElement.style.left = `${newX}px`;
            videoElement.style.top = `${newY}px`;
        }

        // Handle end of dragging (both mouse and touch)
        function endDrag() {
            isDragging = false;
            videoElement.style.cursor = 'grab';
        }

        // Mouse events
        videoElement.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);

        // Touch events
        videoElement.addEventListener('touchstart', startDrag);
        document.addEventListener('touchmove', drag);
        document.addEventListener('touchend', endDrag);
    }

    async createRoom(name: string) {
        this.peerConnection.onicecandidate = async (event: any) => {
            //Event that fires off when a new offer ICE candidate is created
            console.log("onicecandidate", event);
            if (event.candidate) {
                console.log("Offer CONFIGURED", this.peerConnection.localDescription)
                await this.fireBaseDb.updateRoom("offer", JSON.stringify(this.peerConnection.localDescription));
            }
        };
        const offer = await this.peerConnection.createOffer();
        console.log("Setting local Answer",this.ref);
        await this.peerConnection.setLocalDescription(offer);
        console.log("OFFRE created", offer)
        this.roomUnSub = await this.fireBaseDb.createRoom(name, async (data: any) => {
            console.log("onCreate", data)
            if (data.answer && !data.completed1) {
                console.log("Setting Remort connection",this.ref);
                this.peerConnection.setRemoteDescription(JSON.parse(data.answer));
                await this.fireBaseDb.updateRoom("completed1", true)
            }
        })

    }

    async joinRoom(name: string) {
        this.peerConnection.onicecandidate = async (event) => {
            //Event that fires off when a new answer ICE candidate is created
            if (event.candidate) {
                await this.fireBaseDb.updateRoom("answer", JSON.stringify(this.peerConnection.localDescription));
                console.log('AnswerCreated', this.peerConnection.localDescription)
            }
        };
        this.roomUnSub = await this.fireBaseDb.joinRoom(name, async (data: any) => {
            console.log("onJoin", data)
            if (data.offer && !data.completed2) {
                console.log("Setting Remort connection",this.ref);
                await this.peerConnection.setRemoteDescription(JSON.parse(data.offer));
                let answer = await this.peerConnection.createAnswer();
                console.log("Setting local Answer",this.ref);
                await this.peerConnection.setLocalDescription(answer);
                await this.fireBaseDb.updateRoom("completed2", true);
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
        let newstrema = new MediaStream();
        event.streams[0].getTracks().forEach((track) => {
            newstrema.addTrack(track);
        });
        this.remoteStream = newstrema;

        this.remortVidEle.current.srcObject = this.remoteStream;
        this.remortVidEle.current.volume = 0;
        this.remortVidEle.current.play();

    }

    async getDevices() {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        let deviceInfos: MediaDeviceInfo[] = await navigator.mediaDevices.enumerateDevices();
        let audioDevices = [], videoDevices = [];
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
        console.log({ audioDevices, videoDevices })
        return { audioDevices, videoDevices }
    }
    async selectDevice(camera: any, mic: any) {
        const constraints = {
            audio: mic ? { deviceId: mic ? { exact: mic } : undefined } : true,
            video: camera ? { deviceId: camera ? { exact: camera } : undefined, facingMode: "user" } : true
        };
        navigator.mediaDevices.getUserMedia(constraints).
            then((stream) => {
                console.log("Setting local Devices.")
                if (this.localStream) {
                    this.localStream.getTracks().forEach(track => {
                        track.stop();
                    });
                }
                this.localStream = stream;

                if (this.localStream) {
                    this.localStream.getTracks().forEach((track) => {
                        if (this.localStream) {
                            console.log("added local track")
                            this.peerConnection.addTrack(track, this.localStream);

                        }
                    });

                    this.localVidEle.current.srcObject = this.localStream;
                    this.localVidEle.current.volume = 0;
                    this.localVidEle.current.play();
                    this.localVidEle.current.style.transform = "scaleX(" + "-1" + ")";
                }
            }).catch((err) => {
                console.log("Could not load stream", err)
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
        console.log('Connection Closed...');
    }

}