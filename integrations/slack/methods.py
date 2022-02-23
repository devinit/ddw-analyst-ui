import os
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
from django.conf import settings

CLIENT = WebClient(token=settings.SLACK_BOT_TOKEN)

def postToSlackChannel(channel_id, message):
    try:
        result = CLIENT.chat_postMessage(
            channel=channel_id,
            text=message,
            blocks=[], # For richer content
        )
        print(result)
    except SlackApiError as error:
        print(f"Got an error: {error.response['error']}")
