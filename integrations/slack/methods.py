import math
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
from django.conf import settings

CLIENT = WebClient(token=settings.SLACK_BOT_TOKEN)
DIVIDER_BLOCK = {"type": "divider"}

def postToSlackChannel(channel_id, message, subject=None):
    if subject:
        subject = subject.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        subject = '*' + subject + '* \n'
    else:
        subject = ''
    title_block = {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": subject
        }
    }

    if message:
        try:
            message_blocks = []
            # https://api.slack.com/reference/block-kit/blocks#section
            # Maximum text for each section block is 3000, so we split our message into multiple sections
            split = 3000
            parts = range( math.ceil( len(message.encode('utf8') ) / split ) )
            for part in parts:
                start = 0 if part == 0 else split * part
                end = split if part == 0 else split * part + split
                detail_text = message[start:end]
                message_blocks.append({
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": detail_text
                        }
                    })
            full_message = subject + message
            result = CLIENT.chat_postMessage(
                channel=channel_id,
                text=None,
                blocks=[
                    DIVIDER_BLOCK,
                    title_block,
                    *message_blocks,
                ]
            )
        except SlackApiError as error:
            print(f"Got an error: {error.response['error']}.")
