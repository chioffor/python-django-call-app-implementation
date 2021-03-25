function audioCall(targetID) {
    targetUserID = targetID;
    $( ".contacts-card" ).hide();
    $( ".audio-card" ).show();

    const callerUsername = $( ".username ").text();
    $( "#call-1-audio" ).text('Calling');
    $( "#call-2-audio" ).text(callerUsername);

    mediaConstraints.video = false;
    mediaConstraints.audio = true;

    const offerType = 'audio-offer';
    const receivedElementID = 'received_audio';
    const localElementID = 'local_audio';

    $( "#hang-up-call-button" ).click(() => {
        const callType = 'audio-call';
        if (myPeerConnection) {
            hangUpCall(localElementID, receivedElementID, callType)
        } else {
            $( ".audio-card" ).hide();
            $( ".contacts-card" ).show();
        }
        hangUpCall(localElementID, receivedElementID, callType);
    });

    invite(targetID, offerType, localElementID, callerUsername, receivedElementID);
}

function videoCall(targetID) {
    targetUserID = targetID;
    const callerUsername = $( ".username ").text();

    $( "#call-1-video" ).text('Calling');
    $( "#call-2-video" ).text(callerUsername);

    $( ".contacts-card" ).hide();
    $( ".video-card" ).show();

    mediaConstraints.video = true;
    mediaConstraints.audio = true;

    const offerType = 'video-offer';
    const receivedElementID = 'received_video';
    const localElementID = 'local_video';

    $( "#hang-up-video-button" ).click(() => {
        const callType = 'video-call';

        if (myPeerConnection) {
            hangUpCall(localElementID, receivedElementID, callType)
        } else {
            $( ".video-card" ).hide();
            $( ".contacts-card" ).show();
        }

        hangUpCall(localElementID, receivedElementID, callType);

    });

    invite(targetID, offerType, localElementID, callerUsername, receivedElementID);
}

function handleReceivingAudioCall(message, offerType, localElementID, receivedElementID) {
    $( ".contacts-card" ).hide();
    $( ".audio-card" ).show();

    $( "#call-1-audio" ).text(message.callerUsername);
    $( "#call-2-audio" ).text("Calling");

    $( "#hang-up-call-button" ).click(() => {
        const callType = 'audio-call';
        hangUpCall(localElementID, receivedElementID, callType);
    });

    $( '#accept-call' ).click(() => {
        handleOfferMsg(message, offerType, localElementID, receivedElementID);
    })

}
function handleReceivingVideoCall(message, offerType, localElementID, receivedElementID) {
    $( ".contacts-card" ).hide();
    $( ".video-card" ).show();

    $( "#call-1-video").text(message.callerUsername);
    $( "#call-2-video").text("Calling");

    $( "#hang-up-video-button" ).click(() => {
        const callType = 'video-call';
        hangUpCall(localElementID, receivedElementID, callType)
    });

    $( "#accept-video").click(() => {
        handleOfferMsg(message, offerType, localElementID, receivedElementID)
    })

}