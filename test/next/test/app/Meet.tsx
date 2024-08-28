"use client"
import Ably from "ably";
import { useEasyMeet } from "./useEasyMeet";
import { useEffect, useRef, useState } from "react";
import { FileState } from "./webrtc";

const ably = new Ably.Realtime({ key: 'YSXfdw.ksCpsA:Bf6jKYu4LPPpMfiFkSMJrZ4q4ArLDkuBf7bJCPxKQUo', clientId: Math.random().toString(36).substring(7) })
ably.connection.once('connected').then(() => {
    console.log('Connected to Ably!');
})
const channel = ably.channels.get('quickstart');
channel.presence.enter("mobin");



async function sendmsg(msg: any, to: any) {
    await channel.publish('greeting', { data: msg, clientId: ably.auth.clientId, to: to });
    console.log('message sent: ', msg);
}

const VIdeo = ({ stream }: { stream: MediaStream }) => {
    let viref = useRef<HTMLVideoElement|null>(null)
    let [isPlay, setIsPlay] = useState(false)
    useEffect(() => {
        if (viref.current) {
            viref.current.srcObject = stream
            viref.current?.play()
            viref.current.onplaying = () => {
                console.log("playing")
                setIsPlay(true)
            }
            viref.current.onpause = () => {
                console.log("pause")
                setIsPlay(false)
                viref.current?.play()
            }

            if(viref.current.paused){
                viref.current.play()
            }
        }
    })

    return (
        <video ref={viref} playsInline autoPlay muted style={{ width: "100%" }} controls={true}></video>
    )
}

const AUdeo = ({ stream }: { stream: MediaStream }) => {
    let viref = useRef<HTMLAudioElement|null>(null)
    let [isPlay, setIsPlay] = useState(false)
    useEffect(() => {
        if (viref.current) {
            viref.current.srcObject = stream
            viref.current?.play()
            viref.current.onplaying = () => {
                console.log("playing")
                setIsPlay(true)
            }
            viref.current.onpause = () => {
                console.log("pause")
                setIsPlay(false)
                viref.current?.play()
            }

            if(viref.current.paused){
                viref.current.play()
            }
        }
    })

    return (
        <audio ref={viref} playsInline autoPlay  style={{ width: "100%" }} controls={true}></audio>
    )
}

export default function Meet({ iceServers }: { iceServers: any }) {
    const isInit = useRef<boolean | null>(null);
    const { isSystemReady, joinExistingPeer, joinNewPeer, leavePeer, sendFile, fileSharingCompleted,fileSharingState,onSocketMessage,sendDataChannelMsg, newDataChannelMsg, toggleAudio, toggleCamera, toggleScreenShare, isAudioOn, isVideoOn, isScreenShareOn, audioStream, videoStream, screenShareStream, peers } = useEasyMeet(ably.auth.clientId, iceServers, sendmsg);
    const [myMsg,setMyMsg] = useState<string>("")
    const [allMsg,setAllMsg] = useState<{from:string,msg:string}[]>([])
    const [fileProgress,setFileProgress] = useState<{id:string,progress:number,url?:string|null,fileState?:FileState}[]>([])
    useEffect(() => {
        console.log(peers)
    },[peers])
    useEffect(() => {
        if(fileSharingState){
            setFileProgress(prev=>{
                let tempArray = [];
                prev.map(item=>{
                    if(item.id != fileSharingState.fileId){
                        tempArray.push(item)
                    }
                })
                tempArray.push({id:fileSharingState.fileId,progress:fileSharingState.progress,fileState:fileSharingState})
                return tempArray
            })
        }

    },[fileSharingState])
    useEffect(() => {
        console.log(fileSharingCompleted)
        if(fileSharingCompleted){
            setFileProgress(prev=>{
                let tempArray = [];
                prev.map(item=>{
                    if(item.id != fileSharingCompleted.file.fileId){
                        tempArray.push(item)
                    }
                })
                tempArray.push({id:fileSharingCompleted.file.fileId,progress:100,url:fileSharingCompleted.objectUrl,fileState:fileSharingCompleted.file})
                return tempArray

            })
        }
    },[fileSharingCompleted])
    useEffect(() => {
        if(newDataChannelMsg){
            setAllMsg(prev=>prev.concat([newDataChannelMsg]))
        }
    },[newDataChannelMsg,])
    useEffect(() => {
        async function init() {
            if (!isInit.current) {
                if (isSystemReady) {
                    console.log("isSystemReady");
                    await channel.subscribe('greeting', async (message) => {
                        if (message.clientId === ably.auth.clientId) {
                            return;
                        }
                        if (message.data.to === ably.auth.clientId) {
                            console.log('message received from: ' + message.clientId);
                            await onSocketMessage(message.data.data, message.clientId!, null);
                        }
                    })
                    channel.presence.subscribe('enter', async function (member) {
                        if (member.clientId === ably.auth.clientId) {
                            return;
                        }
                        console.log("informAboutNewConnection", member);
                        joinNewPeer(member.clientId);
                    });

                    channel.presence.subscribe('leave', async function (member) {
                        if (member.clientId === ably.auth.clientId) {
                            return;
                        }
                        console.log("leave", member);
                        leavePeer(member.clientId);
                    });
                    channel.presence.get().then((other_users:any) => {
                        console.log("userconnected", other_users);
                        if (other_users) {
                            for (var i = 0; i < other_users.length; i++) {
                                if(other_users[i].clientId !== ably.auth.clientId)  joinExistingPeer(other_users[i].clientId, false);
                            }
                        }
                    });

                    isInit.current = true;
                }
            }
        }

        init();
    }, [isSystemReady, joinExistingPeer, joinNewPeer, leavePeer, onSocketMessage]);


    return <div className="flex flex-row space-x-3">
        my id: {ably.auth.clientId}

        <input value={myMsg} onChange={(e) => setMyMsg(e.target.value)} className="bg-gray-200" />
        <button onClick={() => {sendDataChannelMsg(myMsg, "all"); setAllMsg(prev=>prev.concat([{from:ably.auth.clientId,msg:myMsg}])) ;setMyMsg(""); }}>send</button>

        <input type="file" onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) {
                peers.forEach((peer) => {
                    sendFile(peer.socketId, file);
                })
            }
        }} />


        <button className="mx-2" onClick={async () => await toggleAudio()}>{isAudioOn ? 'mute' : 'unmute'}</button>
        <button onClick={async () => await toggleCamera()}>{isVideoOn ? 'camera off' : 'camera on'}</button>
        <button onClick={async () => await toggleScreenShare()}>{isScreenShareOn ? 'stop screen share' : 'start screen share'}</button>
        <div>
            {isVideoOn && <VIdeo stream={videoStream!} />}
            {
                isScreenShareOn && <VIdeo stream={screenShareStream!} />    
            }
           

        </div>

        <hr />
            {allMsg.map((msg, key) => (
                <div key={key}>
                    {msg.from} : {msg.msg}
                </div>
            ))}
        <hr />



        <hr />
        <div>
           {
               fileProgress.map((item,key)=>{
                   return <div key={key}>
                        id: {item.fileState?.fileName} 
                        <progress max="100" value={item.progress}></progress>
                        {item.url && <a href={item.url} download={item.fileState?.fileName}>download</a>}
                   </div>
               })
           } 
        </div>
        <div>
            {peers.map((peer, key) => (
                <div key={key}>
                    Peer Id: {peer.socketId}
                    {peer.isScreenShareOn && <VIdeo stream={peer.screenShareStream!} />}
                    {peer.isVideoOn && <VIdeo stream={peer.videoStream!} />}
                    {peer.isAudioOn && <AUdeo stream={peer.audioStream!} />}
                   
                </div>
            ))}
        </div>

    </div>;
}

