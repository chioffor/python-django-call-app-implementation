const myID = JSON.parse(document.getElementById('userID').textContent);
let targetUserID;
let myPeerConnection;
let mediaConstraints = {
   audio: true,
   video: true
}


$( document ).ready(function() {
    $( ".video-card" ).hide();
    $( ".audio-card" ).hide();
    // alert('user id is ' + myID);
});

$( ".username" ).click((e) => alert(e.target.textContent))




function sendToServer(msg) {
    const msgJSON = JSON.stringify(msg);
    chatSocket.send(msgJSON);
}



function invite(targetID, offerType, localElementID, callerUsername, receivedElementID) {
    if (myPeerConnection) {
        alert("You can't start a call because you already have one opened")
    } else {
        let clickedUserID = targetID;

        if (clickedUserID === myID) {
            alert("I'm afraid I can't let you talk to yourself, that would be weird");
            $( ".video-card" ).hide();
            $( ".audio-card" ).hide();
            $( ".contacts-card" ).show();
            return;
        }

        targetUserID = clickedUserID;

        createPeerConnection(offerType, callerUsername, localElementID, receivedElementID);

        navigator.mediaDevices.getUserMedia(mediaConstraints)
        .then(function(localStream) {
            document.getElementById(localElementID).srcObject = localStream;
            localStream.getTracks().forEach(track => myPeerConnection.addTrack(track, localStream))
        })
        .catch(handleGetUserMediaError);
    }
}

function handleGetUserMediaError(e) {
    switch(e.name) {
        case "NotFoundError":
            alert("Unable to open your call because no camera and/or microphone where found.");
            break;
        case "SecurityError":
        case "PermissionDeniedError":
            break;
        default:
            alert("Error opening your camera and/or microphone: " + e.message);
            break;
    }

    closeVideoCall();
}

function createPeerConnection(offerType, callerUsername, localElementID, receivedElementID) {
    myPeerConnection = new RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun.stunprotocol.org"
            }
        ]
    });

    myPeerConnection.onicecandidate = handleICECandidateEvent(event);
    myPeerConnection.ontrack = e => handleTrackEvent(offerType, receivedElementID);
    myPeerConnection.onnegotiationneeded = e => handleNegotiationNeededEvent(offerType, callerUsername);
    myPeerConnection.onremovetrack = handleRemoveTrackEvent;
    myPeerConnection.oniceconnectionstatechange = e => handleICEConnectionStateChangeEvent(localElementID, receivedElementID);
    myPeerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
    myPeerConnection.onsignalingstatechange = handleSignalingStateChangeEvent;
}

function handleNegotiationNeededEvent(offerType, callerUsername) {
    myPeerConnection.createOffer()
    .then(function(offer) {
        return myPeerConnection.setLocalDescription(offer);
    })
    .then(function() {
        sendToServer({
            myID: myID,
            callerUsername: callerUsername,
            targetID: targetUserID,
            offerType: offerType,
            sdp: myPeerConnection.localDescription
        });
    })
    .catch();
}

function handleOfferMsg(msg, offerType, localElementID, receivedElementID) {
    let localStream = null;

    targetUserID = msg.myID;
    createPeerConnection(offerType, msg.targetUsername, localElementID, receivedElementID);

    const sessDescription = new RTCSessionDescription(msg.sdp);

    myPeerConnection.setRemoteDescription(sessDescription)
    .then(function () {
        return navigator.mediaDevices.getUserMedia(mediaConstraints);
    })
    .then(function(stream) {
        localStream = stream;
        document.getElementById(localElementID).srcObject = localStream;

        localStream.getTracks().forEach(track => myPeerConnection.addTrack(track, localStream));
    })
    .then(function() {
        return myPeerConnection.createAnswer();
    })
    .then(function(answer) {
        return myPeerConnection.setLocalDescription(answer);
    })
    .then(function() {
        const msg = {
            myID: myID,
            targetID: targetUserID,
            offerType: offerType,
            sdp: myPeerConnection.localDescription
        };

        sendToServer(msg);
    })
    .catch(handleGetUserMediaError);
}

function handleAnswerMsg(msg) {
    const desc = new RTCSessionDescription(msg.sdp);
    myPeerConnection.setRemoteDescription(desc)
    .catch()
}

function handleICECandidateEvent(event) {
    if (event.candidate) {
        sendToServer({
            offerType: "new-ice-candidate",
            targetID: targetUserID,
            candidate: event.candidate
        });
    }
}

function handleNewICECandidateMsg(msg) {
    let candidate = new RTCIceCandidate(msg.candidate);
    myPeerConnection.addIceCandidate(candidate)
    .catch();
}

function handleTrackEvent(offerType, receivedElementID) {
    const callHangUpButtonID = "hang-up-call-button";
    const videoHangUpButtonID = "hang-up-video-button";
    document.getElementById(receivedElementID).srcObject = event.streams[0];
    if (offerType === 'audio-offer') {
        document.getElementById(callHangUpButtonID).disabled = false;
    } else {
        document.getElementById(videoHangUpButtonID).disabled = false;
    }

}

function handleRemoveTrackEvent(event, localElementID, receivedElementID) {
    const stream = document.getElementById(receivedElementID).srcObject;
    const trackList = stream.getTracks();

    if (trackList.length == 0) {
        closeVideoCall(localElementID, receivedElementID);
    }
}

function hangUpCall(localElementID, receivedElementID, callType) {
    closeVideoCall(localElementID, receivedElementID);
    sendToServer({
        myID: myID,
        targetID: targetUserID,
        offerType: "hang-up",
        callType: callType
    });
}

function closeVideoCall(localElementID, receivedElementID) {
//    const remoteVideo = document.getElementById("received_video");
//    const localVideo = document.getElementById("local_video");

    const remoteElement = document.getElementById(receivedElementID);
    const localElement = document.getElementById(localElementID);

    if (myPeerConnection) {
        myPeerConnection.ontrack = null;
        myPeerConnection.onremovetrack = null;
        myPeerConnection.onremovestream = null;
        myPeerConnection.onicecandidate = null;
        myPeerConnection.oniceconnectionstatechange = null;
        myPeerConnection.onsignalingstatechange = null;
        myPeerConnection.onicegatheringstatechange = null;
        myPeerConnection.onnegotiationneeded = null;

        if (remoteElement.srcObject) {
            remoteElement.srcObject.getTracks().forEach(track => track.stop());
        }

        if (localElement.srcObject) {
            localElement.srcObject.getTracks().forEach(track => track.stop());
        }

        myPeerConnection.close();
        myPeerConnection = null;
    }

    remoteElement.removeAttribute("src");
    remoteElement.removeAttribute("srcObject");
    localElement.removeAttribute("src");
    localElement.removeAttribute("srcObject");

    //document.getElementById("hangup-button").disabled = true;
    targetUsername = null;

    $( ".video-card" ).hide();
    $( ".audio-card" ).hide();
    $( ".contacts-card" ).show();
}

function handleICEConnectionStateChangeEvent(event, localElementID, receivedElementID) {
    switch(myPeerConnection.iceConnectionState) {
        case "closed":
        case "failed":
            closeVideoCall(localElementID, receivedElementID);
            break;
    }
}

function handleSignalingStateChangeEvent(event) {
    switch(myPeerConnection.signalingState) {
        case "closed":
            closeVideoCall();
            break;
    }
};

function handleICEGatheringStateChangeEvent(event) {

}