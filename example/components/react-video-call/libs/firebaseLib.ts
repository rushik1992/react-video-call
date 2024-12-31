import { FirebaseApp, initializeApp } from 'firebase/app';
import { doc, DocumentData, DocumentReference, Firestore, setDoc } from 'firebase/firestore';
import { onSnapshot ,getFirestore} from 'firebase/firestore';
import { on } from 'events';
const firebaseConfig = require("./firebasecrads.json")

export class FirebaseWrapper{
    _app:FirebaseApp;
    _db:Firestore;
    _roomName?:string;
    _roomRef?:DocumentReference<DocumentData, DocumentData>;
    _room:any={};

    constructor(config:any=firebaseConfig){
        this._app=initializeApp(config);
        this._db=getFirestore(this._app);
    }
    async createRoom(roomName:string,onUpdateCb:Function){
        if(this._roomName === roomName){
            console.log("Room alredy created.")
            return;
        }
        this._roomName=roomName;
        this._roomRef = doc(this._db, "rooms", this._roomName);
        await this.updateRoom("create",{createdAt:new Date(Date.now()).toISOString()});

        return this.onRoomUpdate(onUpdateCb);
    }
    async joinRoom(roomName:string,onUpdateCb:Function){
        if(this._roomName === roomName){
            console.log("You alredy joined room.")
            return;
        }
        this._roomName=roomName;
        this._roomRef = doc(this._db, "rooms", this._roomName);
        return this.onRoomUpdate(onUpdateCb);
    }

    async updateRoom(action:string,data:any) {
        if(!this._roomRef){
            throw "room have not create yet."
        }        
        this._room[action]=data;
        await setDoc(this._roomRef, {
          ...this._room
        });        
    }

    onRoomUpdate(cb:Function){
        if(!this._roomRef || !this._roomName){
            throw "room have not create yet."
        }
        const unsub = onSnapshot(this._roomRef, (doc) => {
            const data = doc.data();
            this._room=data;
            cb(data);
        });
        return unsub;
    }
}