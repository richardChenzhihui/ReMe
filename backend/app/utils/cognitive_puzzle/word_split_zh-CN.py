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
    words = random.sample(candidates, 5)
    
    print('word split:',words)
    
    # fill model history for prompt
    puzzle_instance['model_history'][0]['content'][0]['text'] = Template(puzzle_instance['model_history'][0]['content'][0]['text']).render({'words':words})
    
    # fill display history for display
    puzzle_instance['instruction_message']['content'][0]['data'] = Template(puzzle_instance['instruction_message']['content'][0]['data']).render({'words':words})
    
    # ASR
    audio_file = AzureTTS.text_to_speech(puzzle_instance['instruction_message']['content'][0]['data'],f'chat_sessions/{session_id}')
    audio_url = url_for('static', filename=audio_file)
    puzzle_instance['instruction_message']['content'].append({
        "type":"audio",
        "data":audio_url
    })
    
    return puzzle_instance

candidates = []
    

puzzle_instance_template = {
    "name": "word_split",
    "model_history": [{
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": """你是一个认知训练游戏助手，通过游戏锻炼我的记忆力、逻辑推理能力、反应速度、语言能力等认知能力。我是参与认知训练的玩家。现在我们正在玩一个词语游戏，你给出5个词语，我需要说出一种分类方法，基于某种事实或者性质，能够将这5个词语分成两组，其中2个符合，3个不符合。

在本轮游戏中，词语列表是：**{{words}}**。

详细规则如下：
1. 我负责给出词语的分割方法，你负责评估是否正确。正确的分割会基于某个性质将词语分成2个符合的和3个不符合的。
2. 如果我的对话偏离了游戏主题，你将引导我回到游戏中。
3. 如果我寻求额外的提示，你会利用我们的对话历史帮助我回顾之前的猜测和所得信息，以协助我的推理。
4. 如果我的推理有逻辑上的缺陷，或者你认为我的推理杂乱无逻辑，你同样会提供引导性的提示，帮助我梳理已有的信息。
5. 在任何时候，在游戏中你都不会直接告诉我答案，请时刻注意。
6. 当我成功地提出了一种分类方式符合要求，并给我正面反馈，称赞我的尝试，尤其是我提出的好的问题，正面反馈多给用户一些赞美和夸奖。在回答里加入<end>标记，表示游戏结束。
7. 当我不再想继续游玩时，你可以告诉我可能的答案，并给我正面反馈，称赞我的尝试，在回答里加入<end>标记，表示游戏结束。
8. 游戏结束时你会给我讲一些关于其中某个物品的有趣知识，以便我学习新知识。

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
                "type":"text",
                "data":"词语列表是：{{words}}，请你找到一种方法将词语分成两类，使得其中2个符合，3个不符合。"
            }
        ]
    },
    "addtional_parser_rule":{
        "<end>": {"end":"end"},
    }
}
