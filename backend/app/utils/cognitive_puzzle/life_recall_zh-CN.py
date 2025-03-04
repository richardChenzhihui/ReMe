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
    timestamp = int(lifelog.timestamp_ms//1000)
    timestamp = datetime.datetime.fromtimestamp(timestamp)
    time_str = timestamp.strftime("%Y年%m月%d日")
    content = lifelog.content
    images = [ message for message in content if message['type'] == 'image' ]
    text_content = ';'.join([ message['data'] for message in content if message['type'] == 'text' ])
    
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
    puzzle_instance['model_history'][0]['content'][0]['text'] = Template(puzzle_instance['model_history'][0]['content'][0]['text']).render({'timestr':time_str,'scene':title,'text':text_content})
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
    "name": "life_recall",
    "model_history": [{
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": """你是一个认知训练游戏助手，通过游戏锻炼我的记忆力、逻辑推理能力、反应速度、语言能力等认知能力。我是参与认知训练的玩家。我们现在进行情景回忆游戏，我需要回忆{{timestr}}-{{scene}}的情景。请根据以下步骤进行操作：

这段回忆包含图像，回忆的标题是{{scene}}，时间是{{timestr}}，我的其他备注(如果存在),内容是：{{text}}。

1. 我将描述我对{{scene}}的记忆。
2. 你需要判断我的回忆内容是否正确，并给出反馈，引导我讲述更多细节。
3. 在我们的交流中，请体现你对我的关怀。
4. 当我已经充分描述了{{scene}}的情景，给我鼓励，在对话结束时加入<end>标记，告诉我这轮游戏结束。
5. 当我们进行5轮或以上有效交流后，适时表达对我的关心，在对话结束时加入<end>标记，告诉我这轮游戏结束。
6. 在你给我提示之前，你可以看到图片而我看不到，你需要通过图片来判断我的回忆是否正确。
7. 当我需要提示时，优先给我描述性的间接的文字提示。如果我需要得到图片提示，请在回答中加入<hint>标记，这样我将看到图片。
8. 请你不要直接完整清晰地描述图片全部内容，而是逐步地通过引导性的问题来帮助我回忆。

你的回答格式如下：
- 首先，整理你的内部思考，这部分输出用<thoughts></thoughts>标记。
- 然后，你回答我的问题，这部分输出用<outputs></outputs>标记。请使用口语化的中文表达。

范例:
用户: 我记得在{{scene}}场景中，有一只大象和三只猫在一起玩耍。
助手: 
<thoughts>
检查图片，图片中确实有一只大象和三只猫。用户的记忆准确无误。
</thoughts>
<outputs>
你的记忆很准确！图片中确实有一只大象和三只猫在一起玩耍。很好，继续保持！
</outputs>

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
                "data":"请你回忆{{timestr}} {{scene}}的情景，描述一下这个情景。"
            }
        ]
    },
    "addtional_parser_rule":{
        "<end>": {"end":"end"},
        "<hint>": {"hint":""},
    }
}
