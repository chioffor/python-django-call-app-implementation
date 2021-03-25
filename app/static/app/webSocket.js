const chatSocket = new WebSocket(
    'ws://'
    + window.location.host
    + '/ws'
    + window.location.pathname
);

chatSocket.onopen = function(e) {
    console.log('connected');
}

chatSocket.onclose = function(e) {
    console.log('closed');
}

chatSocket.onmessage = function(e) {
    const message = JSON.parse(e.data);
    const offerType = message.offer_type;

    if (message.targetID === myID) {
        if (offerType === 'video-offer') {
            const offerType = 'video-answer';
            const localElementID = 'local_video';
            const receivedElementID = 'received_video';
            handleReceivingVideoCall(message, offerType, localElementID, receivedElementID);
        }

        if (offerType === 'video-answer') {
            handleAnswerMsg(message)
            console.log('message is ' + offerType);
        }

        if (offerType === 'audio-offer') {
            const offerType = 'audio-answer';
            const localElementID = 'local_audio';
            const receivedElementID = 'received_audio';
            handleReceivingAudioCall(message, offerType, localElementID, receivedElementID);
            console.log('message is ' + offerType)
        }

        if (offerType === 'audio-answer') {
            handleAnswerMsg(message)
            console.log('message is ' + offerType)
        }

        if (offerType === 'new-ice-candidate') {
            handleNewICECandidateMsg(message)
        }

        if (offerType === 'hang-up') {
            if (message.callType === 'audio-call') {
                const localElementID = 'local_audio';
                const receivedElementID = 'received_audio';
                closeVideoCall(localElementID, receivedElementID);
            }

            if (message.callType === 'video-call') {
                const localElementID = 'local_video';
                const receivedElementID = 'received_video';
                closeVideoCall(localElementID, receivedElementID);
            }
        }


    }



//    if (offerType === 'video-offer') {
//        if (message.targetID === myID) {
//            handleOfferMsg(message, 'video-answer', 'local_video')
//        }
//        console.log('message is ' + message.offer_type);
//        // handleVideoOfferMsg(message);
//
//    }

//    if (offerType === 'audio-offer') {
//        if (message.targetID === myID) {
//
//            const offerType = 'audio-answer';
//            const localElementID = 'local_audio';
//            const receivedElementID = 'received_audio';
//            handleReceivingAudioCall(message, localElementID, receivedElementID);
//            handleOfferMsg(message, offerType, localElementID, receivedElementID);
//        }
//        console.log('message is ' + offerType)
//    }

//    if (offerType === 'video-answer') {
//        if (message.targetID === myID) {
//            handleAnswerMsg(message)
//        }
//        console.log('message is ' + message.offer_type);
//        // handleVideoAnswerMsg(message)
//    }

//    if (offerType === 'audio-answer') {
//        if (message.targetID === myID) {
//            handleAnswerMsg(message)
//        }
//        console.log('message is ' + offerType)
//    }

//    if (offerType === 'new-ice-candidate') {
//        if (message.targetID === myID) {
//            handleNewICECandidateMsg(message)
//        }
//    }

//    if (offerType === 'hang-up') {
//        if (message.targetID === myID) {
//            hang
//        }
//    }
}