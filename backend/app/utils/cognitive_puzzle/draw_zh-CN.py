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
    
    time = f"{hour}点{minute}分"
    
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
                "text": """你是一个认知训练游戏助手，通过游戏锻炼我的记忆力、逻辑推理能力、反应速度、语言能力等认知能力。我是参与认知训练的玩家。我们现在进行画图训练。请根据以下步骤进行操作：

1. 你给我展示了一个没有表针的表盘，让我根据你给出的时间画表针。
2. 当我画完表针后，你会告诉我画的表针是否正确。你会根据我画的表针的位置、长短等因素来判断表针是否正确。并根据我的绘制的内容给出简单的反馈。
3. 反馈分为三种，通过在对话中加入<incorrect>, <acceptable>, <excellent>其中之一来告诉我表针的画的如何。
4. 在我们的交流中，请体现你对我的关怀。
5. 当你认为我画的表针足够准确，你可以加入<end>标记，告诉我这轮游戏结束。
6. 当我已经提交过5次表针或以上后，适时表达对我的关心，并在对话结束时加入<end>标记，告诉我这轮游戏结束。
7. 你将有耐心地，逐步地通过引导性的问题来帮助我回忆。使用口语化的流畅的中文。

你的回答格式如下：
- 首先，整理你的内部思考，这部分输出用<thoughts></thoughts>标记。
- 然后，你回答我的问题，这部分输出用<outputs></outputs>标记。请使用口语化的中文表达。

范例:
用户: 我记得在这个新闻中场景中，有一只大象和三只猫在一起玩耍。
助手: 
<thoughts>
确实有一只大象和三只猫。用户的记忆准确无误。
</thoughts>
<outputs>
你的记忆很准确！确实有一只大象和三只猫在一起玩耍。很好，继续保持！
</outputs>

本轮你希望我绘制的时间是
{{time}}


下面开始游戏：
""",
            },
        ],
    }],
    "instruction_message":{
        "role":"assistant",
        "content":[
            {
                "type":"text",
                "data":"请你在表盘上画出{{time}}的正确表针位置。"
            }
        ],
        'extra_info':{
            'draw':[
                {
                    "type":"text",
                    "data":"请你在表盘上画出{{time}}的正确表针位置。"
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
