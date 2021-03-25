import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

class CallConsumer(WebsocketConsumer):
    def connect(self):
        self.user = self.scope["user"]
        self.username = self.user.username
        self.room_name = self.username
        self.room_group_name = 'call'

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    def receive(self, text_data):
        json_data = json.loads(text_data)
        offer_type = json_data['offerType']
        # my_id = json_data['myID']
        # target_id = json_data['targetID']
        # sdp = json_data['sdp']
        # candidate = json_data['candidate']

        if json_data['offerType'] == 'video-offer':

            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'video_offer',
                    'offer_type': json_data['offerType'],
                    'myID': json_data['myID'],
                    'callerUsername': json_data['callerUsername'],
                    'targetID': json_data['targetID'],
                    'sdp': json_data['sdp'],
                }
            )

        if json_data['offerType'] == 'audio-offer':

            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'audio_offer',
                    'offer_type': json_data['offerType'],
                    'myID': json_data['myID'],
                    'callerUsername': json_data['callerUsername'],
                    'targetID': json_data['targetID'],
                    'sdp': json_data['sdp'],
                }
            )

        if json_data['offerType'] == 'video-answer':
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'video_answer',
                    'offer_type': json_data['offerType'],
                    'myID': json_data['myID'],
                    'targetID': json_data['targetID'],
                    'sdp': json_data['sdp'],
                }
            )

        if json_data['offerType'] == 'audio-answer':
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'audio_answer',
                    'offer_type': json_data['offerType'],
                    'myID': json_data['myID'],
                    'targetID': json_data['targetID'],
                    'sdp': json_data['sdp'],
                }
            )

        if json_data['offerType'] == 'new-ice-candidate':
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'new_ice_candidate',
                    'offer_type': json_data['offerType'],
                    'targetID': json_data['targetID'],
                    'candidate': json_data['candidate'],
                }
            )

        if json_data['offerType'] == 'hang-up':
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'hang_up',
                    'offer_type': json_data['offerType'],
                    'myID': json_data['myID'],
                    'targetID': json_data['targetID'],
                    'callType': json_data['callType'],
                }
            )

    def video_offer(self, event):
        data = event
        self.send(text_data=json.dumps(data))

    def audio_offer(self, event):
        data = event
        self.send(text_data=json.dumps(data))

    def video_answer(self, event):
        data = event
        self.send(text_data=json.dumps(data))

    def audio_answer(self, event):
        data = event
        self.send(text_data=json.dumps(data))

    def new_ice_candidate(self, event):
        data = event
        self.send(text_data=json.dumps(data))

    def hang_up(self, event):
        data = event
        self.send(text_data=json.dumps(data))