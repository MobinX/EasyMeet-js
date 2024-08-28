
# EasyMeetjs: The easiest yet flexible and robust webrtc libraty for react and javascript with typescript support

**EasyMeetjs** is a robust and versatile TypeScript library that provides a solid foundation for building WebRTC-based applications. It simplifies the complexities of WebRTC, enabling developers to easily incorporate real-time communication features into their projects.From simple audio video calling to real time peer to peer file transfer , everything can be done in just 40 lines! 😉😉

## Key Features:

* **Peer-to-Peer Connection Management:** Seamlessly handles the creation, management, and closure of WebRTC peer connections, facilitating direct communication between users.
* **Media Handling (Audio/Video/Screen Sharing):** Supports capturing, sending, and receiving audio, video, and screen share streams, enriching the communication experience.
* **Data Channels:** Enables the exchange of arbitrary data between peers, extending the possibilities beyond just audio and video.
* **File Transfer:** Implements a file transfer mechanism leveraging data channels, allowing users to share files directly.
* **State Management and Event Handling:** Maintains and updates the state of peers, media streams, and file transfers, providing callbacks to react to changes.
* **Well-Structured and Comprehensive:** Encapsulates the complexities of WebRTC, offering a convenient interface for developers to build upon.

## Installation:

```bash
npm install @easymeet/core
```

## Usage: (React Next.js - using meterd iceServers and ably as socket server)

Meet.tsx
```typescript
"use client"
import Ably from "ably";
import { useEasyMeet } from "@easymeet/core/react";
import { useEffect, useRef, useState } from "react";
import { FileState } from "@easymeet/core";

const ably = new Ably.Realtime({ key: 'your-ably-api-key', clientId: Math.random().toString(36).substring(7) })
ably.connection.once('connected').then(() => {
    console.log('Connected to Ably!');
})
const channel = ably.channels.get('quickstart');
channel.presence.enter("mobin");



async function sendmsg(msg: any, to: any) {
  await channel.publish("greeting", {
    data: msg,
    clientId: ably.auth.clientId,
    to: to,
  });
  console.log("message sent: ", msg);
}

const VIdeo = ({ stream }: { stream: MediaStream }) => {
  let viref = useRef<HTMLVideoElement | null>(null);
  let [isPlay, setIsPlay] = useState(false);
  useEffect(() => {
    if (viref.current) {
      viref.current.srcObject = stream;
      viref.current?.play();
      viref.current.onplaying = () => {
        console.log("playing");
        setIsPlay(true);
      };
      viref.current.onpause = () => {
        console.log("pause");
        setIsPlay(false);
        viref.current?.play();
      };

      if (viref.current.paused) {
        viref.current.play();
      }
    }
  });

  return (
    <video
      ref={viref}
      playsInline
      autoPlay
      muted
      style={{ width: "100%" }}
      controls={true}
    ></video>
  );
};

const AUdeo = ({ stream }: { stream: MediaStream }) => {
  let viref = useRef<HTMLAudioElement | null>(null);
  let [isPlay, setIsPlay] = useState(false);
  useEffect(() => {
    if (viref.current) {
      viref.current.srcObject = stream;
      viref.current?.play();
      viref.current.onplaying = () => {
        console.log("playing");
        setIsPlay(true);
      };
      viref.current.onpause = () => {
        console.log("pause");
        setIsPlay(false);
        viref.current?.play();
      };

      if (viref.current.paused) {
        viref.current.play();
      }
    }
  });

  return (
    <audio
      ref={viref}
      playsInline
      autoPlay
      style={{ width: "100%" }}
      controls={true}
    ></audio>
  );
};

export default function Meet({ iceServers }: { iceServers: any }) {
  const isInit = useRef<boolean | null>(null);
  const {
    isSystemReady,
    joinExistingPeer,
    joinNewPeer,
    leavePeer,
    sendFile,
    fileSharingCompleted,
    fileSharingState,
    onSocketMessage,
    sendDataChannelMsg,
    newDataChannelMsg,
    toggleAudio,
    toggleCamera,
    toggleScreenShare,
    isAudioOn,
    isVideoOn,
    isScreenShareOn,
    audioStream,
    videoStream,
    screenShareStream,
    peers,
  } = useEasyMeet(ably.auth.clientId, iceServers, sendmsg);
  const [myMsg, setMyMsg] = useState<string>("");
  const [allMsg, setAllMsg] = useState<{ from: string; msg: string }[]>([]);
  const [fileProgress, setFileProgress] = useState<
    {
      id: string;
      progress: number;
      url?: string | null;
      fileState?: FileState;
    }[]
  >([]);
  useEffect(() => {
    console.log(peers);
  }, [peers]);
  useEffect(() => {
    if (fileSharingState) {
      setFileProgress((prev) => {
        let tempArray = [];
        prev.map((item) => {
          if (item.id != fileSharingState.fileId) {
            tempArray.push(item);
          }
        });
        tempArray.push({
          id: fileSharingState.fileId,
          progress: fileSharingState.progress,
          fileState: fileSharingState,
        });
        return tempArray;
      });
    }
  }, [fileSharingState]);
  useEffect(() => {
    console.log(fileSharingCompleted);
    if (fileSharingCompleted) {
      setFileProgress((prev) => {
        let tempArray = [];
        prev.map((item) => {
          if (item.id != fileSharingCompleted.file.fileId) {
            tempArray.push(item);
          }
        });
        tempArray.push({
          id: fileSharingCompleted.file.fileId,
          progress: 100,
          url: fileSharingCompleted.objectUrl,
          fileState: fileSharingCompleted.file,
        });
        return tempArray;
      });
    }
  }, [fileSharingCompleted]);
  useEffect(() => {
    if (newDataChannelMsg) {
      setAllMsg((prev) => prev.concat([newDataChannelMsg]));
    }
  }, [newDataChannelMsg]);
  useEffect(() => {
    async function init() {
      if (!isInit.current) {
        if (isSystemReady) {
          console.log("isSystemReady");
          await channel.subscribe("greeting", async (message) => {
            if (message.clientId === ably.auth.clientId) {
              return;
            }
            if (message.data.to === ably.auth.clientId) {
              console.log("message received from: " + message.clientId);
              await onSocketMessage(message.data.data, message.clientId!, null);
            }
          });
          channel.presence.subscribe("enter", async function (member) {
            if (member.clientId === ably.auth.clientId) {
              return;
            }
            console.log("informAboutNewConnection", member);
            joinNewPeer(member.clientId);
          });

          channel.presence.subscribe("leave", async function (member) {
            if (member.clientId === ably.auth.clientId) {
              return;
            }
            console.log("leave", member);
            leavePeer(member.clientId);
          });
          channel.presence.get().then((other_users: any) => {
            console.log("userconnected", other_users);
            if (other_users) {
              for (var i = 0; i < other_users.length; i++) {
                if (other_users[i].clientId !== ably.auth.clientId)
                  joinExistingPeer(other_users[i].clientId, false);
              }
            }
          });

          isInit.current = true;
        }
      }
    }

    init();
  }, [
    isSystemReady,
    joinExistingPeer,
    joinNewPeer,
    leavePeer,
    onSocketMessage,
  ]);

  return (
    <div className="flex flex-row space-x-3">
      my id: {ably.auth.clientId}
      <input
        value={myMsg}
        onChange={(e) => setMyMsg(e.target.value)}
        className="bg-gray-200"
      />
      <button
        onClick={() => {
          sendDataChannelMsg(myMsg, "all");
          setAllMsg((prev) =>
            prev.concat([{ from: ably.auth.clientId, msg: myMsg }])
          );
          setMyMsg("");
        }}
      >
        send
      </button>
      <input
        type="file"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) {
            peers.forEach((peer) => {
              sendFile(peer.socketId, file);
            });
          }
        }}
      />
      <button className="mx-2" onClick={async () => await toggleAudio()}>
        {isAudioOn ? "mute" : "unmute"}
      </button>
      <button onClick={async () => await toggleCamera()}>
        {isVideoOn ? "camera off" : "camera on"}
      </button>
      <button onClick={async () => await toggleScreenShare()}>
        {isScreenShareOn ? "stop screen share" : "start screen share"}
      </button>
      <div>
        {isVideoOn && <VIdeo stream={videoStream!} />}
        {isScreenShareOn && <VIdeo stream={screenShareStream!} />}
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
        {fileProgress.map((item, key) => {
          return (
            <div key={key}>
              id: {item.fileState?.fileName}
              <progress max="100" value={item.progress}></progress>
              {item.url && (
                <a href={item.url} download={item.fileState?.fileName}>
                  download
                </a>
              )}
            </div>
          );
        })}
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
    </div>
  );
}



```

page.tsx

```typescript
import Image from "next/image";
import dynamic from "next/dynamic";

const Meet = dynamic(() => import("./Meet"), { ssr: false });


export default async function Home() {
  const response = await fetch("your-metered-api-key");
  const iceServers = await response.json();
  console.log(iceServers);
  return (
    <div>
      <Meet iceServers={iceServers} />
    </div>
  );
}
```

## Usage: (Html with Jquery , Meterd and ably)
index.html
```html
<!DOCTYPE html>
<html>

<head>

    <meta name="viewport" content="width=device-width" />
    <title>Multi Conn App</title>
    <script src="https://cdn.ably.com/lib/ably.min-1.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.4/socket.io.js"></script>
    <script src="https://unpkg.com/jquery@3.7.1/dist/jquery.js"></script>
    <!-- <script src="scripts/jquery.signalR-2.2.2.min.js"></script> -->
    <!-- <script src="https://localhost:44338/signalr/hubs"></script> -->
    <script src="https://unpkg.com/@easymeet/core@1.0.1/dist/easy-meet.min.js"></script>
    <!-- <script type="module">
        import WebrtcBase from './dist/index.js';
       
    </script> -->
    <script src="app.js"></script>



    <script>

        $(function () {

            const urlParams = new URLSearchParams(window.location.search);

            var meeting_id = urlParams.get('mid');

            // if (!meeting_id) {
            //     var murl = window.location.origin + "?mid=" +  (new Date()).getTime();
            //     $('#meetingid').attr('href',murl).text(murl);
            //     $("#meetingContainer").hide();
            //     $("#meetingbox").show();
            //     return;
            // }

            // var user_id = urlParams.get('uid');
            // if (!user_id) {
            //     user_id = window.prompt('Enter your nick!');
            // }

            // if (!user_id || !meeting_id) {
            //     alert('user id or meeting id missing');
            //     return;
            // }
            $("#meetingContainer").show();
            $("#meetingbox").hide();

            // MyApp._init(user_id,meeting_id);

        });
    </script>
</head>

<body>



    <div id="meetingContainer" style="display: none;">
        <h1 id='meetingname'></h1>
        <input type="file" id="fileinput" />
        <button id="btnsendfile">Send File</button>
        <div id="fileprogress"></div>
        <div>

            <input type="text" id="msgbox" />
            <button id="btnsend">Send</button>

            <div id='messages'></div>

            <div id='divUsers' style="display:none">
                <div id="me" class="userbox">
                    <h2></h2>
                    <div>
                        <video autoplay muted id="localVideoCtr"></video>
                        <video autoplay muted id="localScreenVideoCtr"></video>

                    </div>
                </div>
                <div id="otherTemplate" class="userbox" style="display:none">
                    <h2></h2>
                    <div>
                        <video autoplay muted id="remoteVideoCtr111 " class="video"></video>
                        <video autoplay muted id="remoteVideoCtr111" class="screen"></video>

                        <audio autoplay controls id="remoteAudioCtr111" class="audio"></audio>
                    </div>
                </div>
            </div>
        </div>

        <div style="clear: both;"></div>
        <div class="toolbox" style="display:none">
            <button id="btnMuteUnmute">UnMute</button>
            <button id="btnStartStopCam">Start Camera</button>
            <button id="btnStartStopScreenshare">Screen Share</button>
        </div>
    </div>
    <br>
    <br>



</body>

</html>
```
app.js
```javascript
(async () => {

    const response = await fetch("https://virsys.metered.live/api/v1/turn/credentials?apiKey=ca9f4e60bf446fc29401ccb1fa904d110708");
    const iceServers = await response.json();
    let isWrtcInit = false;
    const ably = new Ably.Realtime({ key: 'YSXfdw.ksCpsA:Bf6jKYu4LPPpMfiFkSMJrZ4q4ArLDkuBf7bJCPxKQUo', clientId: Math.random().toString(36).substring(7) });
    ably.connection.once('connected').then(async () => {
        console.log('Connected to Ably!');
    })
    const myid = ably.auth.clientId;
    console.log('myid: ', myid);
    const channel = ably.channels.get('quickstart');
    let easymeet = new EasyMeet.WebrtcBase(ably.auth.clientId, iceServers, sendmsg,);
    document.title = myid;

    async function sendmsg(msg, to) {
        await channel.publish('greeting', { data: msg, clientId: myid, to: to });
        console.log('message sent: ', msg);
    }



    await channel.subscribe('greeting', async (message) => {

        // clientid ==  sender from
        // id == receiver (to)
        if (message.clientId === myid) {
            //checking i am not worikng on my own msg
            return;
        } else {

            if (message.data.to === myid) {
                //checking if the msg is for me
                console.log('message received from: ' + message.clientId);
               
                console.log(message);
                await easymeet.onSocketMessage(message.data.data, message.clientId);

            }

        }

    });

    let _localVideoPlayer = document.getElementById('localVideoCtr');
    let localScreenVideoCtr = document.getElementById('localScreenVideoCtr');

    easymeet.onFileStateChange((fileState) => {

        console.log(fileState);
        if (document.getElementById('fileprogress' + fileState.fileId) == null) {
            let progress = document.createElement('progress');
            progress.id = 'fileprogress' + fileState.fileId;
            progress.value = parseInt(fileState.progress);
            progress.max = 100;
            $("#fileprogress").append(progress);
        }
        else {
            document.getElementById('fileprogress' + fileState.fileId).value = parseInt(fileState.progress);
        }

        // $("#fileprogress").append(`<div>${(fileState.progress) + "%  " + parseInt(fileState.transferSpeed) + "kb/s" }  </div>`)
    })
    easymeet.onFileTransferCompleted((fileState, objectURl) => {
        console.log(fileState, objectURl);
        $("#fileprogress").append(`<div>Completed</div>`)
        document.getElementById('fileprogress' + fileState.fileId).value = 100;

        // // $("#fileprogress").append(`<div>${JSON.stringify(fileState)}</div>`)
        $("#fileprogress").append(`<a href="${objectURl}" download="${fileState.fileName}">${objectURl}</a>`)
    })

    $("#btnsendfile").on('click', async function () {
        let file = document.getElementById('fileinput').files[0];
        console.log(file);
        (easymeet.getAllPeerDetails()).forEach(element => {
            console.log(element.socketId);
            easymeet.sendFile(element.socketId, file);
        });

    });
 

    easymeet.onCameraVideoStateChange((state, stream) => {
        if (state) {
            _localVideoPlayer.srcObject = stream;
        }
        else {
            _localVideoPlayer.srcObject = null;
        }

    })
    easymeet.onScreenShareVideoStateChange((state, stream) => {
        if (state) {
            localScreenVideoCtr.srcObject = stream;
        }
        else {
            localScreenVideoCtr.srcObject = null;
        }

    })

    $("#btnMuteUnmute").on('click', async function () {
        await easymeet.toggleAudio()

    });
    $("#btnStartStopCam").on('click', async function () {
        await easymeet.toggleCamera();
    });

    $("#btnStartStopScreenshare").on('click', async function () {
        await easymeet.toggleScreenShare();
    })

    easymeet.onDataChannelMsg((from, msg) => {
        console.log("onDataChannelMsg", from, msg);
        $("#messages").append("<li>" + from + ": " + msg + "</li>");
    })

    easymeet.onPeerStateChange((peerstate) => {
        if (peerstate) {
            console.log("peerstate", peerstate);
            for (let peerz in peerstate) {
                let pr = peerstate[peerz];
                let remoteElm = document.getElementById(peerstate[peerz].socketId);
                if (!remoteElm) {
                    AddNewUser(peerstate[peerz].socketId, peerstate[peerz].socketId);
                }
                let video = remoteElm.querySelector('.video'), audio = remoteElm.querySelector('audio'), screen = remoteElm.querySelector('.screen');
                if (pr.isAudioOn) {
                    if (audio) {
                        audio.srcObject = peerstate[peerz].audioStream;
                        audio.play();
                    }
                }
                else {
                    if (audio) {
                        audio.srcObject = null;
                    }
                }
                if (pr.isVideoOn) {
                    if (video) {
                        video.srcObject = peerstate[peerz].videoStream;
                    }
                }
                else {
                    if (video) {
                        video.srcObject = null;
                    }
                }

                if (pr.isScreenShareOn) {
                    if (screen) {
                        screen.srcObject = peerstate[peerz].screenShareStream;
                    }
                }
                else {
                    if (screen) {
                        screen.srcObject = null;
                    }
                }



            }
        }
    })


    channel.presence.subscribe('enter', async function (member) {
        if (member.clientId === myid) {
            return;
        }
        console.log("informAboutNewConnection", member);
        AddNewUser(member.clientId, member.clientId);
        easymeet.createConnection(member.clientId, true);
    });

    channel.presence.subscribe('leave', async function (member) {
        if (member.clientId === myid) {
            return;
        }
        $('#' + member.clientId).remove();
        easymeet.closeConnection(member.clientId);
    });
    channel.presence.get(function (err, other_users) {
        console.log("userconnected", other_users);
        $('#divUsers .other').remove();
        if (other_users) {
            for (var i = 0; i < other_users.length; i++) {
                AddNewUser(other_users[i].clientId, other_users[i].clientId);
                easymeet.createConnection(other_users[i].clientId, false);
            }
        }
        $(".toolbox").show();
        $('#messages').show();
        $('#divUsers').show();
    });


    $('#btnResetMeeting').on('click', function () {
        socket.emit('reset');
    });

    $('#btnsend').on('click', function () {
        //_hub.server.sendMessage($('#msgbox').val());
        easymeet.sendDataChannelMsg("all", $('#msgbox').val());

    });

    $('#divUsers').on('dblclick', 'video', function () {
        this.requestFullscreen();
    });


    function AddNewUser(other_user_id, connId) {
        var $newDiv = $('#otherTemplate').clone();
        $newDiv = $newDiv.attr('id', connId).addClass('other');
        $newDiv.find('h2').text(other_user_id);
        $newDiv.find('video').attr('id', 'v_' + connId);
        $newDiv.find('audio').attr('id', 'a_' + connId);
        $newDiv.show();
        $('#divUsers').append($newDiv);
    }
    channel.presence.enter("mobin");
})();

```



## Public API for core library (vanilla js)
**Public Methods:**

This table provides a detailed description of all public methods available in the `WebrtcBase` class from @easymeet/core:

like 
```javascript
let webrtc = new EasyMeet.WebrtcBase("you-socket-id", iceServers, sendmsg /*the function used by easymeet system for sending msg to other over socket, takes msg and to ,two perameter , see usages example avobe */);

```

| Method                                     | Description                                                                                           | Usage Example                                                                                                                                                |
|-------------------------------------------|-------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `createConnection(connid, polite, extraInfo)` | Establishes a WebRTC connection with a peer.                                                          | `webrtc.createConnection('peer-id', false, { username: 'Alice' });`                                                                                          |
| `closeConnection(connid)`                  | Closes the connection with a specific peer.                                                            | `webrtc.closeConnection('peer-id');`                                                                                                                             |
| `onSocketMessage(message, from_connid, extraInfo)` | Handles incoming signaling messages from a peer.                                                    | `webrtc.onSocketMessage(JSON.stringify({ offer: offer }), 'peer-id', { username: 'Bob' });`                                                                |
| `onPeerStateChange(fn)`                   | Registers a callback to be notified of peer state changes (e.g., audio/video on/off).                 | `webrtc.onPeerStateChange((peerStates) => { console.log('Peer states updated:', peerStates); });`                                                               |
| `getAllPeerDetails()`                     | Returns an array of details for all connected peers.                                                 | `const peerDetails = webrtc.getAllPeerDetails(); console.log('Connected peers:', peerDetails);`                                                              |
| `getPeerDetailsById(connid)`              | Returns the details of a specific peer by their connection ID.                                         | `const peerDetails = webrtc.getPeerDetailsById('peer-id'); console.log('Peer details:', peerDetails);`                                                         |
| `startCamera(cameraConfig)`                | Starts the user's camera with optional configuration (resolution, audio).                            | `webrtc.startCamera({ video: { width: 1280, height: 720 }, audio: true });`                                                                                     |
| `stopCamera()`                            | Stops the user's camera.                                                                               | `webrtc.stopCamera();`                                                                                                                                          |
| `toggleCamera()`                           | Toggles the camera on or off.                                                                          | `webrtc.toggleCamera();`                                                                                                                                         |
| `startScreenShare(screenConfig)`           | Starts screen sharing with optional configuration.                                                     | `webrtc.startScreenShare();`                                                                                                                                     |
| `stopScreenShare()`                       | Stops screen sharing.                                                                                  | `webrtc.stopScreenShare();`                                                                                                                                       |
| `toggleScreenShare()`                      | Toggles screen sharing on or off.                                                                     | `webrtc.toggleScreenShare();`                                                                                                                                      |
| `startAudio()`                             | Starts the user's microphone.                                                                          | `webrtc.startAudio();`                                                                                                                                          |
| `stopAudio()`                              | Stops the user's microphone.                                                                            | `webrtc.stopAudio();`                                                                                                                                           |
| `toggleAudio()`                            | Toggles the microphone on or off.                                                                       | `webrtc.toggleAudio();`                                                                                                                                         |
| `isLocalAudioOn()`                        | Returns `true` if the local audio is on, `false` otherwise.                                          | `const audioOn = webrtc.isLocalAudioOn(); console.log('Local audio is on:', audioOn);`                                                                      |
| `isLocalVideoOn()`                        | Returns `true` if the local video is on, `false` otherwise.                                          | `const videoOn = webrtc.isLocalVideoOn(); console.log('Local video is on:', videoOn);`                                                                      |
| `isLocalScreenShareOn()`                 | Returns `true` if local screen sharing is on, `false` otherwise.                                     | `const screenSharingOn = webrtc.isLocalScreenShareOn(); console.log('Local screen sharing is on:', screenSharingOn);`                                           |
| `onCameraVideoStateChange(fn)`            | Registers a callback for camera video state changes.                                                  | `webrtc.onCameraVideoStateChange((state, stream) => { console.log('Camera state changed:', state, stream); });`                                                |
| `onScreenShareVideoStateChange(fn)`      | Registers a callback for screen share video state changes.                                             | `webrtc.onScreenShareVideoStateChange((state, stream) => { console.log('Screen share state changed:', state, stream); });`                                       |
| `onAudioStateChange(fn)`                   | Registers a callback for audio state changes.                                                         | `webrtc.onAudioStateChange((state, stream) => { console.log('Audio state changed:', state, stream); });`                                                     |
| `sendDataChannelMsg(conId, msg)`           | Sends a message over the data channel to a specific peer or all peers (if `conId` is "all").        | `webrtc.sendDataChannelMsg('peer-id', { message: 'This is a data channel message!' });`                                                                      |
| `onDataChannelMsg(fn)`                    | Registers a callback function to handle incoming data channel messages.                               | `webrtc.onDataChannelMsg((connId, message) => { console.log('Data channel message from', connId, ':', message); });`                                             |
| `sendFile(to, file)`                      | Sends a file to a specific peer.                                                                       | `webrtc.sendFile('peer-id', fileInput.files[0]);`                                                                                                             |
| `onFileSendingReq(fn)`                     | Registers a callback to handle file sending requests (allows confirmation before accepting a file). | `webrtc.onFileSendingReq((filename, connId) => { return confirm(`Accept file ${filename} from ${connId}?`); });`                                              |
| `onFileStateChange(fn)`                    | Registers a callback to track file transfer progress.                                                  | `webrtc.onFileStateChange((fileState) => { console.log('File transfer progress:', fileState.progress); });`                                                   |
| `onFileTransferCompleted(fn)`            | Registers a callback to handle completed file transfers.                                             | `webrtc.onFileTransferCompleted((fileState, objectUrl) => { console.log('File transfer completed:', fileState, objectUrl); });`                                |
| `onError(fn)`                             | Registers a callback function to handle errors.                                                      | `webrtc.onError((error) => { console.error('WebRTC Error:', error); });`                                                                                  |



## Public Method of React Hook (useEasyMeet)

You can use those from 
@easymeet/core/react
```javascript
import {useEasyMeet} from "@easymeet/core/react"
let {startCamera, isVideoOn , isAudioOn , peers, fileSharingState ...and more} = useEasyMeet("you-socket-id", iceServers, sendmsg /*the function used by easymeet system for sending msg to other over socket, takes msg and to ,two perameter , see usages example avobe */)
```

| Method/State                                  | Description                                                                                                                   | Usage Example                                                                                                                                                                                                     |
|----------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `webRTCBaseRef`                             | A ref object containing the underlying `WebrtcBase` instance.                                                                  | `webRTCBaseRef.current?.sendDataChannelMsg('peer-id', 'Hello!');` (Access the `WebrtcBase` instance directly if needed)                                                                                            |
| `error`                                       | An object containing error information (if any).                                                                              | `if (error) { console.error('WebRTC Error:', error.message); }`                                                                                                                                                     |
| `onSocketMessage(message, from_connid, extraInfo)` | Handles incoming signaling messages from a peer.                                                                            | `onSocketMessage(JSON.stringify({ offer: offer }), 'peer-id', { username: 'Bob' });`                                                                                                                            |
| `startCamera(cameraConfig)`                 | Starts the user's camera with optional configuration.                                                                         | `startCamera({ video: { width: 1280, height: 720 }, audio: true });`                                                                                                                                                |
| `stopCamera()`                               | Stops the user's camera.                                                                                                     | `stopCamera();`                                                                                                                                                                                                    |
| `startScreenShare(screenConfig)`            | Starts screen sharing with optional configuration.                                                                           | `startScreenShare();`                                                                                                                                                                                                |
| `stopScreenShare()`                          | Stops screen sharing.                                                                                                        | `stopScreenShare();`                                                                                                                                                                                               |
| `toggleCamera()`                            | Toggles the camera on or off.                                                                                                | `toggleCamera();`                                                                                                                                                                                                  |
| `toggleScreenShare()`                       | Toggles screen sharing on or off.                                                                                           | `toggleScreenShare();`                                                                                                                                                                                             |
| `startAudio()`                              | Starts the user's microphone.                                                                                                | `startAudio();`                                                                                                                                                                                                   |
| `stopAudio()`                               | Stops the user's microphone.                                                                                                  | `stopAudio();`                                                                                                                                                                                                    |
| `toggleAudio()`                             | Toggles the microphone on or off.                                                                                             | `toggleAudio();`                                                                                                                                                                                                  |
| `isLocalAudioOn()`                           | Returns `true` if the local audio is on, `false` otherwise.                                                                    | `const audioOn = isLocalAudioOn();`                                                                                                                                                                                  |
| `isLocalVideoOn()`                           | Returns `true` if the local video is on, `false` otherwise.                                                                    | `const videoOn = isLocalVideoOn();`                                                                                                                                                                                  |
| `isLocalScreenShareOn()`                    | Returns `true` if local screen sharing is on, `false` otherwise.                                                               | `const screenSharingOn = isLocalScreenShareOn();`                                                                                                                                                                       |
| `joinExistingPeer(peerID, extraData)`        | Joins an existing peer connection.                                                                                          | `joinExistingPeer('peer-id', { username: 'Alice' });`                                                                                                                                                                 |
| `joinNewPeer(peerID, extraData)`             | Initiates a new peer connection.                                                                                            | `joinNewPeer('peer-id', { username: 'Bob' });`                                                                                                                                                                    |
| `leavePeer(peerID)`                          | Leaves a peer connection.                                                                                                   | `leavePeer('peer-id');`                                                                                                                                                                                            |
| `isAudioOn`                                  | Indicates whether the remote peer's audio is on.                                                                              | `const peerAudioOn = peers.find(peer => peer.socketId === 'peer-id')?.isAudioOn;`                                                                                                                                       |
| `isVideoOn`                                  | Indicates whether the remote peer's video is on.                                                                              | `const peerVideoOn = peers.find(peer => peer.socketId === 'peer-id')?.isVideoOn;`                                                                                                                                       |
| `isScreenShareOn`                           | Indicates whether the remote peer is screen sharing.                                                                          | `const peerScreenSharingOn = peers.find(peer => peer.socketId === 'peer-id')?.isScreenShareOn;`                                                                                                                            |
| `audioStream`                                | The remote peer's audio stream.                                                                                              | `<audio ref={audioRef} srcObject={audioStream} autoPlay />`                                                                                                                                                           |
| `videoStream`                                | The remote peer's video stream.                                                                                              | `<video ref={videoRef} srcObject={videoStream} autoPlay />`                                                                                                                                                           |
| `screenShareStream`                          | The remote peer's screen share stream.                                                                                       | `<video ref={screenShareRef} srcObject={screenShareStream} autoPlay />`                                                                                                                                                    |
| `newDataChannelMsg`                          | The latest data channel message received.                                                                                    | `useEffect(() => { if (newDataChannelMsg) { console.log('New data channel message:', newDataChannelMsg.msg, 'from:', newDataChannelMsg.from); } }, [newDataChannelMsg]);`                                                |
| `fileSharingCompleted`                       | Details of a completed file transfer.                                                                                        | `useEffect(() => { if (fileSharingCompleted) { console.log('File transfer completed:', fileSharingCompleted.file, 'URL:', fileSharingCompleted.objectUrl); } }, [fileSharingCompleted]);`                                     |
| `fileSharingState`                           | The current state of an ongoing file transfer.                                                                               | `useEffect(() => { if (fileSharingState) { console.log('File transfer progress:', fileSharingState.progress); } }, [fileSharingState]);`                                                                              |
| `isSystemReady`                              | Indicates whether the WebRTC system is initialized and ready.                                                                | `if (isSystemReady) { // Perform WebRTC operations }`                                                                                                                                                                |
| `peers`                                      | An array of connected peer states.                                                                                           | `peers.map(peer => <div key={peer.socketId}>Peer: {peer.socketId}, Audio: {peer.isAudioOn}, Video: {peer.isVideoOn}</div>)`                                                                                             |
| `sendDataChannelMsg(msg, toID)`              | Sends a data channel message to a specific peer.                                                                              | `sendDataChannelMsg('Hello from data channel!', 'peer-id');`                                                                                                                                                         |
| `sendFile(to, file)`                         | Sends a file to a specific peer.                                                                                             | `const fileInput = useRef(null); // ... <input type="file" ref={fileInput} /> ... sendFile('peer-id', fileInput.current.files[0]);`                                                                                |




## Contributing:

Contributions are welcome! Please open an issue or submit a pull request if you have any suggestions, bug fixes, or new features.

## License:

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements:

* [WebRTC](https://webrtc.org/) - The underlying technology powering this library.

## Contact:

For any inquiries or support, please contact MobinX at [mobin0219@gmail.com](mobin0219@gmail.com).


