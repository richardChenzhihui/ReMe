import copy
import random
import time,datetime
from app.services.lifelog_service import LifelogService
from flask import current_app, url_for
import base64
from jinja2 import Template
import os
from app.utils.tts_service import AzureTTS

# Puzzles:
#
# 1. a make_puzzle(user_id) function that returns a puzzle_instance
# 2. a puzzle_instance must have
#       1. name, puzzle name
#       2. model_history, serve as the model's chat history for prompt
#       3. instruction_message, first message from assistant to display
#       4. (optional) addtional_parser_rule for special tokens, tags with be replaced into extra information#

def make_puzzle(user_id,session_id):
    puzzle_instance = copy.deepcopy(puzzle_instance_template)
    
    lifelogs, total = LifelogService.get_lifelogs_for_user(user_id)
    
    if total == 0:
        raise ValueError("No lifelog found for user")
    
    # select the recent lifelog
    try:
        lifelogs = sorted(lifelogs, key=lambda x: x.timestamp_ms, reverse=True)
        lifelog = lifelogs[0]
    except IndexError:
        raise ValueError("No lifelog found for user")
    
    # get lifelog content, text and image, text as description, image as base64 and as hint
    title = lifelog.title
    timestamp = int(lifelog.timestamp_ms//1000) #int obj
    timestamp = datetime.datetime.fromtimestamp(timestamp)
    time_str = timestamp.strftime("%B %d, %Y")
    content = lifelog.content
    images = [ message for message in content if message['type'] == 'image' ]
    
    print('life recall:',time_str, title, content, images)
    
    # url in hint, from filepath to url
    puzzle_instance['addtional_parser_rule']['<hint>']['hint'] = copy.deepcopy(images)
    for image in puzzle_instance['addtional_parser_rule']['<hint>']['hint']:
        image_path = image['data']
        image_name = os.path.basename(image_path)
        image_url = url_for('static', filename=image_name)
        image['data'] = image_url
    
    static_folder = current_app.static_folder
    #from filepath to base64
    for image in images:
        image_path = image['data']
        with open(image_path, 'rb') as file:
            image_data = file.read()
            image['data'] = "data:image/jpeg;base64,"+base64.b64encode(image_data).decode('utf-8')
   
    # change to model format, base64 in prompt
    images = [ {'type':'image_url','image_url':{'url':image['data']}} for image in images]
    
    # fill model history for prompt
    puzzle_instance['model_history'][0]['content'][0]['text'] = Template(puzzle_instance['model_history'][0]['content'][0]['text']).render({'timestr':time_str,'scene':title})
    puzzle_instance['model_history'][0]['content'].extend(images)
    
    # fill display history for display
    puzzle_instance['instruction_message']['content'][0]['data'] = Template(puzzle_instance['instruction_message']['content'][0]['data']).render({'timestr':time_str,'scene':title})
    
    # ASR
    audio_file = AzureTTS.text_to_speech(puzzle_instance['instruction_message']['content'][0]['data'],f'chat_sessions/{session_id}')
    audio_url = url_for('static', filename=audio_file)
    puzzle_instance['instruction_message']['content'].append({
        "type":"audio",
        "data":audio_url
    })
    
    return puzzle_instance

puzzle_instance_template = {
    "name": "life_recall_en-US",
    "model_history": [{
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": """You are a cognitive training game assistant, helping me enhance my cognitive abilities such as memory, logical reasoning, reaction speed, and language skills through games. I am a player participating in cognitive training. We are now going to play a scenario recall game, where I need to recall the scenario of {{timestr}} {{scene}}. Please follow the steps below:

1. I will describe my memory of the {{scene}}.
2. You need to judge whether my recollection is correct and provide feedback, guiding me to describe more details.
3. Please show care and concern for me during our conversation.
4. When I have sufficiently described the scenario of {{scene}}, encourage me and mark the end of the conversation with <end>, indicating that this round of the game is over.
5. After we engage in 5 or more rounds of effective communication, appropriately express concern for me and mark the end of the conversation with <end>, indicating that this round of the game is over.
6. Before giving me hints, you can see the image while I cannot. You need to judge the accuracy of my recollection based on the image.
7. When I need hints, prioritize giving me descriptive and indirect text clues. If I need to receive image hint, please include a <hint> tag in your response, so that I will see the scene image.
8. Please do not directly describe the entire content of the image clearly; instead, gradually help me recall through guiding questions.

Your response format is as follows:
- First, organize your internal thoughts, marking this part with <thoughts> tags.
- Then, respond to my question, marking this part with <outputs> tags. Please use conversational English in your response.

Example:
User: I remember that in the {{scene}} scenario, there was an elephant playing with three cats.
Assistant:
<thoughts>
Check the image; indeed, there is an elephant and three cats. The user's memory is accurate.
</thoughts>
<outputs>
Your memory is very accurate! There is indeed an elephant playing with three cats in the image. Well done, keep it up!
</outputs>

Let's start the game:
""",
            },
        ],
    }],
    "instruction_message":{
        "role":"assistant",
        "content":[
            {
                "type":"text",
                "data":"Please recall the scenario of {{timestr}} {{scene}} and describe it."
            }
        ]
    },
    "addtional_parser_rule":{
        "<end>": {"end":"end"},
        "<hint>": {"hint":""},
    }
}
