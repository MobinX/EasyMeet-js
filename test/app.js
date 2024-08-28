// let ably;
// let channel;
// let easymeet
// let myid;
// let _localVideoPlayer = document.getElementById('localVideoCtr');
// let localScreenVideoCtr = document.getElementById('localScreenVideoCtr');
// async function main() {
//     await initAbly();
//     await initEasyMeet();
//     await initChannel();
//     await bindListeners();
//     channel.presence.enter("mobin");
// }

// async function initAbly() {
//     ably = new Ably.Realtime({ key: 'YSXfdw.ksCpsA:Bf6jKYu4LPPpMfiFkSMJrZ4q4ArLDkuBf7bJCPxKQUo', clientId: Math.random().toString(36).substring(7) });
//     ably.connection.once('connected').then(async () => {
//         console.log('Connected to Ably!');
//     });
//     myid = ably.auth.clientId;
//     channel = ably.channels.get('quickstart');
    
//     const response = await fetch("https://virsys.metered.live/api/v1/turn/credentials?apiKey=ca9f4e60bf446fc29401ccb1fa904d110708");
//     iceServers = await response.json();
// }
// async function initEasyMeet() {
//     async function sendmsg(msg, to) {
//         await channel.publish('greeting', { data: msg, clientId: myid, to: to });
//         console.log('message sent: ', msg);
//     }
//     easymeet = new EasyMeet.WebrtcBase(ably.auth.clientId, iceServers, sendmsg);
//     easymeet.onFileStateChange((fileState) => {

//         console.log(fileState);
//         if (document.getElementById('fileprogress' + fileState.fileId) == null) {
//             let progress = document.createElement('progress');
//             progress.id = 'fileprogress' + fileState.fileId;
//             progress.value = parseInt(fileState.progress);
//             progress.max = 100;
//             $("#fileprogress").append(progress);
//         }
//         else {
//             document.getElementById('fileprogress' + fileState.fileId).value = parseInt(fileState.progress);
//         }

//         // $("#fileprogress").append(`<div>${(fileState.progress) + "%  " + parseInt(fileState.transferSpeed) + "kb/s" }  </div>`)
//     })
//     easymeet.onFileTransferCompleted((fileState, objectURl) => {
//         console.log(fileState, objectURl);
//         $("#fileprogress").append(`<div>Completed</div>`)
//         document.getElementById('fileprogress' + fileState.fileId).value = 100;

//         // // $("#fileprogress").append(`<div>${JSON.stringify(fileState)}</div>`)
//         $("#fileprogress").append(`<a href="${objectURl}" download="${fileState.fileName}">${objectURl}</a>`)
//     })

//     easymeet.onCameraVideoStateChange((state, stream) => {
//         if (state) {
//             _localVideoPlayer.srcObject = stream;
//         }
//         else {
//             _localVideoPlayer.srcObject = null;
//         }

//     })
//     easymeet.onScreenShareVideoStateChange((state, stream) => {
//         if (state) {
//             localScreenVideoCtr.srcObject = stream;
//         }
//         else {
//             localScreenVideoCtr.srcObject = null;
//         }

//     })
//     easymeet.onDataChannelMsg((from, msg) => {
//         console.log("onDataChannelMsg", from, msg);
//         $("#messages").append("<li>" + from + ": " + msg + "</li>");
//     })

//     easymeet.onPeerStateChange((peerstate) => {
//         if (peerstate) {
//             console.log("peerstate", peerstate);
//             for (let peerz in peerstate) {
//                 let pr = peerstate[peerz];
//                 let remoteElm = document.getElementById(peerstate[peerz].socketId);
//                 if (!remoteElm) {
//                     AddNewUser(peerstate[peerz].socketId, peerstate[peerz].socketId);
//                 }
//                 let video = remoteElm.querySelector('.video'), audio = remoteElm.querySelector('audio'), screen = remoteElm.querySelector('.screen');
//                 if (pr.isAudioOn) {
//                     if (audio) {
//                         audio.srcObject = peerstate[peerz].audioStream;
//                         audio.play();
//                     }
//                 }
//                 else {
//                     if (audio) {
//                         audio.srcObject = null;
//                     }
//                 }
//                 if (pr.isVideoOn) {
//                     if (video) {
//                         video.srcObject = peerstate[peerz].videoStream;
//                     }
//                 }
//                 else {
//                     if (video) {
//                         video.srcObject = null;
//                     }
//                 }

//                 if (pr.isScreenShareOn) {
//                     if (screen) {
//                         screen.srcObject = peerstate[peerz].screenShareStream;
//                     }
//                 }
//                 else {
//                     if (screen) {
//                         screen.srcObject = null;
//                     }
//                 }



//             }
//         }
//     })

// }
// async function initChannel() {
//     await channel.subscribe('greeting', async (message) => {
//         // clientid ==  sender from
//         // id == receiver (to)
//         if (message.clientId === myid) {
//             //checking i am not worikng on my own msg
//             return;
//         } else if (message.data.to === myid) {
//             //checking if the msg is for me
//             console.log('message received from: ' + message.clientId);
//             console.log(message);
//             //let the easy meet to handle it
//             await easymeet.onSocketMessage(message.data.data, message.clientId);
//         }
//     });
//     channel.presence.subscribe('enter', async function (member) {
//         if (member.clientId === myid) {
//             return;
//         }
//         console.log("informAboutNewConnection", member);
//         AddNewUser(member.clientId, member.clientId);
//         easymeet.createConnection(member.clientId, true);
//     });
//     channel.presence.subscribe('leave', async function (member) {
//         if (member.clientId === myid) {
//             return;
//         }
//         $('#' + member.clientId).remove();
//         easymeet.closeConnection(member.clientId);
//     });
//     channel.presence.get(function (err, other_users) {
//         console.log("userconnected", other_users);
//         $('#divUsers .other').remove();
//         if (other_users) {
//             for (var i = 0; i < other_users.length; i++) {
//                 if (other_users[i].clientId !== myid){
//                 AddNewUser(other_users[i].clientId, other_users[i].clientId);
//                 easymeet.createConnection(other_users[i].clientId, false);
//                 }
//             }
//         }
//         $(".toolbox").show();
//         $('#messages').show();
//         $('#divUsers').show();
//     });
// }


// async function bindListeners() {
//     $("#btnMuteUnmute").on('click', async function () {
//         await easymeet.toggleAudio()

//     });
//     $("#btnStartStopCam").on('click', async function () {
//         await easymeet.toggleCamera();
//     });

//     $("#btnStartStopScreenshare").on('click', async function () {
//         await easymeet.toggleScreenShare();
//     })
    
//     $("#btnsendfile").on('click', async function () {
//         let file = document.getElementById('fileinput').files[0];
//         console.log(file);
//         (easymeet.getAllPeerDetails()).forEach(element => {
//             console.log(element.socketId);
//             easymeet.sendFile(element.socketId, file);
//         });

//     });
//     $('#btnsend').on('click', function () {
//         //_hub.server.sendMessage($('#msgbox').val());
//         easymeet.sendDataChannelMsg("all", $('#msgbox').val());

//     });
// }

// function AddNewUser(other_user_id, connId) {
//     var $newDiv = $('#otherTemplate').clone();
//     $newDiv = $newDiv.attr('id', connId).addClass('other');
//     $newDiv.find('h2').text(other_user_id);
//     $newDiv.find('video').attr('id', 'v_' + connId);
//     $newDiv.find('audio').attr('id', 'a_' + connId);
//     $newDiv.show();
//     $('#divUsers').append($newDiv);
// }

// main();








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