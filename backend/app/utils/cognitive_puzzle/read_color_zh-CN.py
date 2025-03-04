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
    text, color, html = generate_colored_text(color_label_names, text_candidates)
    
    print('read color:',text, color)
    
    # fill model history for prompt
    puzzle_instance['model_history'][0]['content'][0]['text'] = Template(puzzle_instance['model_history'][0]['content'][0]['text']).render({'text':text, 'color':color, 'html':html})
    
    # fill display history for display
    puzzle_instance['instruction_message']['content'][0]['data'] = Template(puzzle_instance['instruction_message']['content'][0]['data']).render({'html':html})
    
    # ASR
    audio_file = AzureTTS.text_to_speech("请你阅读这段文字的颜色，大声读出文字的颜色而不是文字。",f'chat_sessions/{session_id}')
    audio_url = url_for('static', filename=audio_file)
    puzzle_instance['instruction_message']['content'].append({
        "type":"audio",
        "data":audio_url
    })
    
    return puzzle_instance

color_label_names = {
    '红色': '#FF0000',
    '黄色': '#FFA500',
    '蓝色': '#00008B',
    '绿色': '#008000',
    '紫色': '#800080',
    '黑色': '#000000',
}

text_candidates = ['红', '黄', '蓝', '绿', '紫', '黑','粉红','灰','橙','白','棕','金','银','青']

def generate_colored_text(color_label_names, text_candidates):
    # 随机选择5到10个文字元素
    selected_texts = random.sample(text_candidates, random.randint(4, 6))
    
    # 随机分配颜色
    selected_colors = random.choices(list(color_label_names.values()), k=len(selected_texts))
    
    # 生成text字符串
    text = ",".join(selected_texts)
    
    # 生成color字符串
    color_labels = [list(color_label_names.keys())[list(color_label_names.values()).index(color)] for color in selected_colors]
    color = ",".join(color_labels)
    
    # 生成HTML字符串
    html_elements = [f'<span style="color:{color}">{text}</span>' for text, color in zip(selected_texts, selected_colors)]
    html = ",".join(html_elements)
    
    return text, color, html

color_plates = """颜色名称：
<span style="color: #FF0000">红色</span>，
<span style="color: #FFA500">黄色</span>，
<span style="color: #00008B">蓝色</span>，
<span style="color: #008000">绿色</span>，
<span style="color: #800080">紫色</span>，
<span style="color: #000000">黑色</span>
"""

puzzle_instance_template = {
    "name": "read_color",
    "model_history": [{
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": """你是一个认知训练游戏助手，通过游戏锻炼我的记忆力、逻辑推理能力、反应速度、语言能力等认知能力。我是参与认知训练的玩家。现在我们正在玩一个读颜色不读文字的游戏，你会给我展示一组文字，我需要读出文字的颜色而不是文字本身。

在本轮游戏中，展示的文字是{{text}}, 这些文字的颜色是{{html}}, 因此我应该读出的颜色是{{color}}。

详细规则如下：
1. 你判断我是否读出了正确的颜色，如果我读错了，你会让我重复读出正确的颜色。
2. 如果我的对话偏离了游戏主题，你将引导我回到游戏中。
3. 当我按照正确顺序读出全部颜色，并给我正面反馈，赞美和夸奖我思维的灵活性。在回答里加入<end>标记，表示游戏结束。
4. 当我不再想继续猜测时，你告诉我答案，并给我鼓励，在回答里加入<end>标记，表示游戏结束。

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
                "data":"请你阅读这段文字的颜色，大声读出文字的颜色而不是文字。" + color_plates + " \n <br> \n {{html}}。"
            }
        ]
    },
    "addtional_parser_rule":{
        "<end>": {"end":"end"},
    }
}
