"use client"
import Ably from "ably";
import { useEasyMeet } from "./useEasyMeet";
import { useEffect, useRef } from "react";

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

export default function Meet({ iceServers }: { iceServers: any }) {
    const isInit = useRef<boolean | null>(null);
    const { isSystemReady, joinExistingPeer, joinNewPeer, leavePeer,onSocketMessage, toggleAudio, toggleCamera, toggleScreenShare, isAudioOn, isVideoOn, isScreenShareOn, audioStream, videoStream, screenShareStream, peers } = useEasyMeet(ably.auth.clientId, iceServers, sendmsg);
    useEffect(() => {
        console.log(peers)
    },[peers])
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

        <button className="mx-2" onClick={async () => await toggleAudio()}>{isAudioOn ? 'mute' : 'unmute'}</button>
        <button onClick={async () => await toggleCamera()}>{isVideoOn ? 'camera off' : 'camera on'}</button>
        <button onClick={async () => await toggleScreenShare()}>{isScreenShareOn ? 'stop screen share' : 'start screen share'}</button>
        <div>
            {isVideoOn && <video ref={(re) => {
                if (re) {
                    re.srcObject = videoStream;
                    re.play()
                }
            }} autoPlay playsInline muted controls={true} ></video>}
            {
                isScreenShareOn && <video ref={(re) => {
                    if (re) {
                        re.srcObject = screenShareStream;
                        re.play()
                    }
                }} autoPlay playsInline controls={true} ></video>
            }
            {
                isAudioOn && <audio ref={(re) => {
                    if (re) {
                        re.srcObject = audioStream;
                        re.play()
                    }
                }} autoPlay playsInline controls={true} />
            }

        </div>
        <hr />
        <div>
            {peers.map((peer, key) => (
                <div key={key}>
                    Peer Id: {peer.socketId}

                    {peer.isVideoOn && <video ref={(re) => {
                        if (re) {
                            re.srcObject = peer.videoStream;
                        }
                    }} autoPlay playsInline muted />}
                    {peer.isAudioOn && <audio ref={(re) => {
                        if (re) {
                            re.srcObject = peer.audioStream;
                        }
                    }} autoPlay playsInline />}
                    {peer.isScreenShareOn && <video ref={(re) => {
                        if (re) {
                            re.srcObject = peer.screenShareStream;
                        }
                    }} autoPlay playsInline />}
                </div>
            ))}
        </div>

    </div>;
}

