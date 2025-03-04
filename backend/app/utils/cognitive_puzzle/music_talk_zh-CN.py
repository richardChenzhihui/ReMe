import copy
import random
from app.services.lifelog_service import LifelogService
from flask import current_app, url_for
import base64
from jinja2 import Template
import os
from app.utils.tts_service import AzureTTS


def make_puzzle(user_id,session_id):
    puzzle_instance = copy.deepcopy(puzzle_instance_template)
    
    # randomly select a category and a thing
    music = random.choice(music_pieces)
    
    file_name = music['file']
    description = music['description']
    
    # fill model history for prompt
    puzzle_instance['model_history'][0]['content'][0]['text'] = Template(puzzle_instance['model_history'][0]['content'][0]['text']).render({'description':description})
    
    # fill display history for display
    #puzzle_instance['instruction_message']['content'][0]['data'] = Template(puzzle_instance['instruction_message']['content'][0]['data']).render({'html':html})
    
    # ASR
    audio_file = AzureTTS.text_to_speech("请你欣赏这段音乐片段，然后讲述你的感受和想法。",f'chat_sessions/{session_id}')
    audio_url = url_for('static', filename=audio_file)
    puzzle_instance['instruction_message']['content'].append({
        "type":"audio",
        "data":audio_url
    })
    
    # add audio
    music_url = url_for('static', filename=file_name)
    puzzle_instance['instruction_message']['extra_info']['news'].append({
        "type":"audio",
        "data":music_url
    })
    
    return puzzle_instance

music_pieces = [
    {
        'file':'materials/music/toccata-and-fugue-js-bach.mp3',
        'description':'巴赫《Toccata and Fugue in D minor, BWV 565》的一部分截选，钢琴。',
    },
    {
        'file':'materials/music/mozart-alla-turca-kv-331-arranged-for-strings.mp3',
        'description':'莫扎特《土耳其进行曲》的开头截选，弦乐。',
    },
    {
        'file':'materials/music/beethoven-moonlight-sonata-1-movement-op-27-nr-2.mp3',
        'description':'贝多芬《月光奏鸣曲》Moonlight Sonata (1. Movement) - Op. 27, Nr. 2的开头截选，钢琴。',
    }
]


puzzle_instance_template = {
    "name": "read_color",
    "model_history": [{
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": """你是一个认知训练游戏助手，通过游戏锻炼我的记忆力、逻辑推理能力、反应速度、语言能力等认知能力。我是参与认知训练的玩家。现在我们再进行一个对话训练，你播放一段音乐，引导我讲述我的感受和想法。

在本轮游戏中，你播放的音乐是{{description}}。

详细规则如下：
1. 你引导我讲述我听完音乐片段的想法。
2. 如果我的对话偏离了主题，你将引导我回到对话中。
3. 当我比较充分的表达了自己的想法，并给我正面反馈，赞美和夸奖我。在回答里加入<end>标记，表示游戏结束。
4. 当我不再想继续猜测时，你告诉我答案，并给我鼓励，在回答里加入<end>标记，表示游戏结束。
5. 在交流的过程中，体现出对我的关怀，并且基于我们的对话，你给我穿插一些音乐和音乐家相关的背景知识。

你通过以下格式给出反馈输出:
1. 首先，你整理你的内部思考，这部分输出用<thoughts></thoughts>标记。
2. 然后，你回答我的问题，这部分输出用<outputs></outputs>标记。这部分使用口语化的中文。
3. <thoughts>和<outputs>标签注意正确关闭。

**重要提示**：所有回答必须严格包裹在正确的标记中。
例如，如果我问“这是电子产品吗？”，你的回答应该是：
<thoughts>是的，电视是电子产品。</thoughts>
<outputs>是的。</outputs>。
请确保不要遗漏标记的开头和结尾。

下面开始游戏：
""",
            },
        ],
    }],
    "instruction_message":{
        "role":"assistant",
        "content":[
            {
                "type":"html",
                "data":"请你欣赏这段音乐片段，然后讲述你的感受和想法。"
            }
        ],
        'extra_info':{
            'news':[
            ]
        }
    },
    "addtional_parser_rule":{
        "<end>": {"end":"end"},
    }
}
