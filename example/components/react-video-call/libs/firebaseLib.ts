import { FirebaseApp, FirebaseOptions, initializeApp } from 'firebase/app';
import { doc, DocumentData, DocumentReference, Firestore, setDoc,Unsubscribe } from 'firebase/firestore';
import { onSnapshot ,getFirestore} from 'firebase/firestore';

type OnUpdateCallback = (data: DocumentData | undefined) => void;
export class FirebaseWrapper{
    _app:FirebaseApp;
    _db:Firestore;
    _roomName?:string;
    _roomRef?:DocumentReference<DocumentData, DocumentData>;
    _room:{[key:string]:boolean|string|object|null}={};

    constructor(config:FirebaseOptions){
        this._app=initializeApp(config);
        this._db=getFirestore(this._app);
    }
    async createRoom(roomName:string,ref:string){
        if(!this._roomRef){
            throw new Error("Room have not initialized!")
        } 
        this._roomName=roomName;
        this._roomRef = doc(this._db, "rooms", this._roomName);
        await this.updateRoom("create",{createdAt:new Date(Date.now()).toISOString(),ref:ref});

        return true
    }
    async joinRoom(roomName:string,onUpdateCb:OnUpdateCallback){
        if(this._roomName === roomName){
            console.debug("You alredy joined room.")
            throw new Error("You alredy joined room.");
            return;
        }
        this._roomName=roomName;
        this._roomRef = doc(this._db, "rooms", this._roomName);
        return this.onRoomUpdate(onUpdateCb);
    }

    async leaveRoom(){
        if(!this._roomName){
            console.debug("No Connection Exist.")
            throw new Error("No Connection Exist.");
            return;
        }
        this.updateRoom("leave",null);
    }

    async updateRoom(action:string,data:boolean|string|object|null) {
        if(!this._roomRef){
            throw new Error("room have not create yet.")
        } 
        if(action==="leave"){
            this._room={};
        }else{
            this._room[action]=data;
        }       
        
        await setDoc(this._roomRef, {
          ...this._room
        });        
    }

    onRoomUpdate(cb:OnUpdateCallback):Unsubscribe{
        if(!this._roomRef || !this._roomName){
            throw new Error("room have not create yet.");
        }
        const unsub = onSnapshot(this._roomRef, (doc) => {
            const data = doc.data();
            this._room={
                ...this._room,
                ...data
            };
            cb(data);
        });
        return unsub;
    }
}
