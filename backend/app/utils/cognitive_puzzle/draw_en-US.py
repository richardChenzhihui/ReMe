import copy
import random
from app.services.lifelog_service import LifelogService
from flask import current_app, url_for
import base64
from jinja2 import Template
import os
from app.utils.tts_service import AzureTTS

# Puzzles:
#
# 1. a make_puzzle(user_id) function that returns a puzzle_instance
# 2. a puzzle_instance must haveL 
#       1. name, puzzle name
#       2. model_history, serve as the model's chat history for prompt
#       3. instruction_message, first message from assistant to display
#       4. (optional) addtional_parser_rule for special tokens, tags with be replaced into extra information#

def make_puzzle(user_id,session_id):
    puzzle_instance = copy.deepcopy(puzzle_instance_template)
    
    # fill news title and content
    hour = random.choice([1,2,3,4,5,6,7,8,9,10,11,12])
    minute = random.choice([0,15,30,45])
    
    time = f"{hour} o'clock {minute} minutes"
    
    puzzle_instance['model_history'][0]['content'][0]['text'] = Template(puzzle_instance['model_history'][0]['content'][0]['text']).render({'time':time})
    puzzle_instance['instruction_message']['content'][0]['data'] = Template(puzzle_instance['instruction_message']['content'][0]['data']).render({'time':time})
    
    puzzle_instance['instruction_message']['extra_info']['draw'][0]['data'] = Template(puzzle_instance['instruction_message']['extra_info']['draw'][0]['data']).render({'time':time})
    
    clock_face_url = url_for('static', filename='materials/clock_face.jpg')
    puzzle_instance['instruction_message']['extra_info']['draw'][1]['data'] = clock_face_url
    
    # tts
    instruction_audio_file = AzureTTS.text_to_speech(puzzle_instance['instruction_message']['content'][0]['data'],f'chat_sessions/{session_id}')
    instruction_audio_url = url_for('static', filename=instruction_audio_file)
    puzzle_instance['instruction_message']['content'].append({
        "type":"audio",
        "data":instruction_audio_url
    })
    
    draw_audio_file = AzureTTS.text_to_speech(puzzle_instance['instruction_message']['extra_info']['draw'][0]['data'],f'chat_sessions/{session_id}')
    draw_audio_url = url_for('static', filename=draw_audio_file)
    puzzle_instance['instruction_message']['extra_info']['draw'].append({
        "type":"audio",
        "data":draw_audio_url
    })
    
    return puzzle_instance

puzzle_instance_template = {
    "name": "news",
    "model_history": [{
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": """You are a cognitive training game assistant, helping me improve my memory, logical reasoning, reaction speed, language skills, and other cognitive abilities through games. I am a player participating in the cognitive training. We are now doing a drawing exercise. Please follow the steps below:

1. You show me a clock face without hands and ask me to draw the hands based on the time you provide.
2. After I draw the hands, you will tell me if they are correct. You will judge the correctness based on the position and length of the hands I draw, and provide simple feedback.
3. The feedback will be one of three types: <incorrect>, <acceptable>, or <excellent>, indicating how well the hands are drawn.
4. In our interaction, please show your care for me.
5. When you think the hands I draw are accurate enough, you can add the <end> marker to indicate the end of the round.
6. If I have submitted the hands 5 times or more, express your care for me and add the <end> marker to indicate the end of the round.
7. Be patient and guide me step by step with questions to help me recall. Use colloquial and fluent English.

Your response format is as follows:
- First, organize your internal thoughts, and output this part using <thoughts></thoughts> tags.
- Then, respond to my question, and output this part using <outputs></outputs> tags. Please use fluent English.

Example:
User: I remember in this news scene, there was an elephant and three cats playing together.
Assistant:
<thoughts>
There is indeed an elephant and three cats. The user's memory is accurate.
</thoughts>
<outputs>
Your memory is very accurate! There is indeed an elephant and three cats playing together. Good job, keep it up!
</outputs>

For this round, the time you want me to draw is
{{time}}

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
                "data":"Please draw the correct positions of the clock hands for {{time}} on the clock face."
            }
        ],
        'extra_info':{
            'draw':[
                {
                    "type":"text",
                    "data":"Please draw the correct positions of the clock hands for {{time}} on the clock face."
                },
                {
                    "type":"image",
                    "data": ''
                }
            ]
        }
    },
    "addtional_parser_rule":{
        "<end>": {"end":"end"},
        '<incorrect>':{'rating':1}, 
        '<acceptable>':{'rating':2}, 
        '<excellent>':{'rating':3}
    }
}
