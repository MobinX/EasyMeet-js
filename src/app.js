(async () => {

const response = await fetch("https://virsys.metered.live/api/v1/turn/credentials?apiKey=ca9f4e60bf446fc29401ccb1fa904d110708");
    const iceServers = await response.json();
    let isWrtcInit = false;
    const ably = new Ably.Realtime({ key: 'YSXfdw.ksCpsA:Bf6jKYu4LPPpMfiFkSMJrZ4q4ArLDkuBf7bJCPxKQUo', clientId: Math.random().toString(36).substring(7) });
    ably.connection.once('connected').then(async () => {
        const response2 = await fetch('https://global.xirsys.net/_turn/sigflow', {
            method: 'PUT',
            headers: {
                'Authorization': 'Basic ' + btoa('mobin:e2d2ad94-0e2b-11eb-85a4-0242ac150006'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });

        const data = await response2.json();
        console.log('response: ', data);
        // const iceServers = await response.json();
        const iceServers = data.v.iceServers;
        if (!isWrtcInit) {
            // webRt = new WebrtcBase(sendmsg, ably.auth.clientId, iceServers);
            isWrtcInit = true;
        }
        console.log('Connected to Ably!');
    })
    const myid = ably.auth.clientId;
    console.log('myid: ', myid);
    const channel = ably.channels.get('quickstart');
    let webRt =  new WebrtcBase.default(ably.auth.clientId, iceServers ,sendmsg,  );
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
                if (!isWrtcInit) {
                    const response2 = await fetch('https://global.xirsys.net/_turn/sigflow', {
                        method: 'PUT',
                        headers: {
                            'Authorization': 'Basic ' + btoa('mobin:e2d2ad94-0e2b-11eb-85a4-0242ac150006'),
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({})
                    });

                    const data = await response2.json();
                    console.log('response: ', data);
                    // const iceServers = await response.json();
                    const iceServers = data.v.iceServers;
                    if (!isWrtcInit) {
                        // webRt = new WebrtcBase(sendmsg, ably.auth.clientId, iceServers);
                        isWrtcInit = true;
                    }
                }
                console.log(message);
                await webRt.onSocketMessage(message.data.data, message.clientId);

            }

        }

    });

    let _localVideoPlayer = document.getElementById('localVideoCtr');
    let localScreenVideoCtr = document.getElementById('localScreenVideoCtr');

    webRt.onCameraVideoStateChange((state,stream) => {
        if (state) {
            _localVideoPlayer.srcObject = stream;
        }
        else {
            _localVideoPlayer.srcObject = null;
        }
        
    })
    webRt.onScreenShareVideoStateChange((state,stream) => {
        if (state) {
            localScreenVideoCtr.srcObject = stream;
        }
        else {
            localScreenVideoCtr.srcObject = null;
        }
        
    })

    $("#btnMuteUnmute").on('click', async function () {
        await webRt.toggleAudio()
      
    });
    $("#btnStartStopCam").on('click', async function () {
      await  webRt.toggleCamera();
    });

    $("#btnStartStopScreenshare").on('click', async function () {
        await webRt.toggleScreenShare();
    })

    webRt.onDataChannelMsg((from, msg) => {
        console.log("onDataChannelMsg", from, msg);
        $("#messages").append("<li>" + from + ": " + msg + "</li>");
    })

    webRt.onPeerStateChange((peerstate) => {
        if (peerstate) {
            console.log("peerstate", peerstate);
            for(let peerz in peerstate){
                let pr = peerstate[peerz];
                 let remoteElm = document.getElementById(peerstate[peerz].socketId);
                 if(!remoteElm){
                    AddNewUser(peerstate[peerz].socketId, peerstate[peerz].socketId);
                 }
                 let video = remoteElm.querySelector('.video') , audio = remoteElm.querySelector('audio') ,  screen = remoteElm.querySelector('.screen');
                 if(pr.isAudioOn){
                    if(audio){
                        audio.srcObject = peerstate[peerz].audioStream;
                        audio.play();
                    }
                 }
                 else {
                    if(audio){
                        audio.srcObject = null;
                    }
                 }
                 if(pr.isVideoOn){
                    if(video){
                        video.srcObject = peerstate[peerz].videoStream;
                    }
                 }
                 else {
                    if(video){
                        video.srcObject = null;
                    }
                 }

                 if(pr.isScreenShareOn){
                    if(screen){
                        screen.srcObject = peerstate[peerz].screenShareStream;
                    }
                 }
                 else {
                    if(screen){
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
        webRt.createConnection(member.clientId, true);
    });

    channel.presence.subscribe('leave', async function (member) {
        if (member.clientId === myid) {
            return;
        }
        $('#' + member.clientId).remove();
        webRt.closeConnection(member.clientId);
    });
    channel.presence.get(function (err, other_users) {
        console.log("userconnected", other_users);
        $('#divUsers .other').remove();
        if (other_users) {
            for (var i = 0; i < other_users.length; i++) {
                  AddNewUser(other_users[i].clientId, other_users[i].clientId);
                  webRt.createConnection(other_users[i].clientId,false);
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
        webRt.sendDataChannelMsg("all",$('#msgbox').val());
        
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