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
    category = random.choice(list(candidates.keys()))
    thing = random.choice(candidates[category])
    
    print('guess a thing english:',category, thing)
    
    # fill model history for prompt
    puzzle_instance['model_history'][0]['content'][0]['text'] = Template(puzzle_instance['model_history'][0]['content'][0]['text']).render({'category':category, 'thing':thing})
    
    # fill display history for display
    puzzle_instance['instruction_message']['content'][0]['data'] = Template(puzzle_instance['instruction_message']['content'][0]['data']).render({'category':category, 'thing':thing})
    
    # ASR
    audio_file = AzureTTS.text_to_speech(puzzle_instance['instruction_message']['content'][0]['data'],f'chat_sessions/{session_id}')
    audio_url = url_for('static', filename=audio_file)
    puzzle_instance['instruction_message']['content'].append({
        "type":"audio",
        "data":audio_url
    })
    
    return puzzle_instance

candidates = {
    "Animals": ["Dog", "Cat", "Tiger", "Elephant", "Lion", "Bear", "Deer", "Monkey", "Zebra", "Shark"],
    "Transportation": ["Car", "Bus", "Bicycle", "Motorcycle", "Train", "Airplane", "Boat", "Truck", "Subway", "Tram"],
    "Fruits": ["Apple", "Banana", "Orange", "Strawberry", "Grape", "Cherry", "Watermelon", "Peach", "Lemon", "Mango"],
    "Home Appliances": ["Refrigerator", "Washing Machine", "Television", "Air Conditioner", "Microwave", "Vacuum Cleaner", "Electric Fan", "Oven", "Iron", "Coffee Maker"],
    "Sports": ["Soccer", "Basketball", "Badminton", "Table Tennis", "Volleyball", "Tennis", "Golf", "Skiing", "Rugby", "Track and Field"],
    "Musical Instruments": ["Piano", "Guitar", "Violin", "Flute", "Saxophone", "Drums", "Cello", "Harmonica", "Keyboard", "Accordion"],
    "Vegetables": ["Carrot", "Spinach", "Tomato", "Cucumber", "Potato", "Onion", "Eggplant", "Cabbage", "Broccoli", "Bell Pepper"],
    "Stationery": ["Pen", "Pencil", "Eraser", "Ruler", "Notebook", "Stapler", "Scissors", "Glue", "Marker", "Compass"],
    "Furniture": ["Sofa", "Chair", "Bed", "Table", "Wardrobe", "Bookshelf", "Coffee Table", "Dining Table", "Nightstand", "Dresser"],
    "Clothing": ["Shirt", "Pants", "Skirt", "Jacket", "Sweater", "T-shirt", "Jeans", "Suit", "Coat", "Sportswear"],
    "Beverages": ["Water", "Coffee", "Tea", "Milk", "Juice", "Cola", "Beer", "Wine", "Green Tea", "Smoothie"],
    "Home Goods": ["Pillow", "Blanket", "Bed Sheet", "Towel", "Bath Towel", "Curtain", "Carpet", "Sofa Cover", "Lamp", "Hanger"],
    "Entertainment Activities": ["Movies", "Reading", "Listening to Music", "Painting", "Singing", "Dancing", "Photography", "Writing", "Cooking", "Gardening"],
    "Natural Landscapes": ["Mountain", "River", "Lake", "Forest", "Desert", "Waterfall", "Beach", "Canyon", "Glacier", "Volcano"],
    "Weather Phenomena": ["Sunny", "Rainy", "Snowy", "Foggy", "Thunderstorm", "Hurricane", "Tornado", "Hail", "Rainbow", "Frost"],
    "Buildings": ["House", "Office Building", "Supermarket", "School", "Hospital", "Library", "Museum", "Theater", "Stadium", "Restaurant"],
    "Holidays": ["Christmas", "New Year's Day", "Easter", "Halloween", "Thanksgiving", "Valentine's Day", "Independence Day", "St. Patrick's Day", "Mother's Day", "Father's Day"],
    "Tourist Attractions": ["Eiffel Tower", "Big Ben", "Great Wall of China", "Pyramids", "Statue of Liberty", "Taj Mahal", "Parthenon", "Leaning Tower of Pisa", "Colosseum", "Sydney Opera House"],
    "Food": ["Rice", "Noodles", "Dumplings", "Buns", "Sushi", "Pizza", "Hamburger", "Salad", "Barbecue", "Stew"],
    #"Solar Terms": ["Spring Begins", "Rain Water", "Awakening of Insects", "Spring Equinox", "Clear and Bright", "Grain Rain", "Summer Begins", "Grain Buds", "Grain in Ear", "Summer Solstice"],
    "Metals": ["Iron", "Copper", "Silver", "Gold", "Aluminum", "Zinc", "Nickel", "Tin", "Lead", "Titanium"],
    "Personal Care Items": ["Toothbrush", "Toothpaste", "Soap", "Shampoo", "Shower Gel", "Laundry Detergent", "Comb", "Mirror", "Razor", "Nail Clipper"],
    "Plants": ["Rose", "Tulip", "Sunflower", "Orchid", "Cactus", "Bamboo", "Pine Tree", "Magnolia", "Chrysanthemum", "Lotus"],
    "Academic Subjects": ["Physics", "Chemistry", "Biology", "Astronomy", "Geography", "Mathematics", "Computer Science", "Engineering", "Medicine", "Environmental Science"],
    "Body Parts": ["Head", "Shoulder", "Knee", "Foot", "Hand", "Eye", "Ear", "Nose", "Mouth", "Leg"],
    "Family Members": ["Father", "Mother", "Brother", "Sister", "Grandfather", "Grandmother", "Uncle", "Aunt", "Cousin", "Niece"],
    "Emotions": ["Happy", "Sad", "Angry", "Surprised", "Scared", "Anxious", "Excited", "Calm", "Satisfied", "Depressed"],
    "Colors": ["Red", "Blue", "Green", "Yellow", "Purple", "Orange", "Pink", "Black", "White", "Gray"],
    "Marine Life": ["Shark", "Dolphin", "Whale", "Octopus", "Starfish", "Coral", "Sea Turtle", "Jellyfish", "Seahorse"],
    "Natural Disasters": ["Earthquake", "Hurricane", "Flood", "Drought", "Fire", "Landslide", "Tsunami", "Tornado", "Avalanche", "Hailstorm"],
    "Condiments": ["Salt", "Sugar", "Vinegar", "Soy Sauce", "Pepper", "Chili", "Sesame Oil", "Oyster Sauce", "Mustard", "Five-Spice Powder"],
    "Common Illnesses": ["Cold", "Fever", "Headache", "Diarrhea", "Hypertension", "Diabetes", "Asthma", "Gastritis", "Arthritis", "Insomnia"],
    #"Traditional Festivals": ["Dragon Boat Festival", "Double Ninth Festival", "Qixi Festival", "Spring Festival", "Mid-Autumn Festival", "Lantern Festival", "Qingming Festival", "New Year's Day"],
    "Electronic Products": ["Smartphone", "Computer", "Tablet", "Headphones", "Camera", "Smartwatch", "Game Console", "Bluetooth Speaker", "Printer", "Router"],
    "Celestial Bodies": ["Sun", "Moon", "Earth", "Mars", "Jupiter", "Venus", "Mercury", "Saturn", "Uranus", "Neptune"],
    "Transportation Infrastructure": ["Bridge", "Tunnel", "Highway", "Railway", "Airport", "Port", "Subway Station", "Bus Stop", "Toll Booth", "Parking Lot"],
    "Gemstones": ["Diamond", "Ruby", "Sapphire", "Emerald", "Pearl", "Agate", "Jade"],
    "Literary Genres": ["Novel", "Poetry", "Essay", "Drama", "Fairy Tale", "Fable", "Biography", "Sketch", "Reportage", "Science Fiction"],
    "Tools": ["Hammer", "Screwdriver", "Pliers", "Wrench", "Saw", "Electric Drill", "Axe", "Measuring Tape", "Level", "Sandpaper"],
    "Financial Instruments": ["Stock", "Bond", "Futures", "Option", "Fund", "Foreign Exchange", "Insurance", "Trust", "Deposit", "Loan"],
    "Music Genres": ["Classical Music", "Jazz", "Rock", "Pop Music", "Country Music", "Electronic Music", "Blues", "Hip Hop", "Reggae", "Folk Music"],
    #"Tea Types": ["Longjing", "Biluochun", "Tieguanyin", "Da Hong Pao", "Pu'er", "White Tea", "Yellow Tea", "Maojian", "Oolong Tea", "Black Tea"],
    "Dance Styles": ["Ballet", "Street Dance", "Tango", "Waltz", "Jazz Dance", "Modern Dance", "Folk Dance", "Latin Dance", "Tap Dance", "Break Dance"],
    "Mythological Figures": ["Chang'e", "Sun Wukong", "Nezha", "Zeus", "Athena", "Odin", "Thor", "Apollo", "Hera", "Hercules"],
    #"World Heritage Sites": ["Great Wall of China", "Forbidden City", "Terracotta Army", "Mogao Caves", "Suzhou Gardens", "Huangshan", "Guilin Scenery", "Wulingyuan", "Lijiang Old Town", "Pingyao Ancient City"],
    "Board Games": ["Chess", "Go", "Checkers", "Monopoly", "Scrabble", "Clue", "Battleship", "Risk", "Trivial Pursuit", "Catan"],
    "Geographical Concepts": ["Equator", "Poles", "Continent", "Ocean", "Tropics", "Temperate Zone", "Frigid Zone", "Plain", "Plateau", "Basin"],
    "Ancient Civilizations": ["Chinese", "Egyptian", "Mayan", "Indian", "Greek", "Roman", "Persian", "Babylonian", "Incan", "Aztec"],
    "Programming Languages": ["Python", "Java", "C++", "JavaScript", "Ruby", "Go", "Swift", "Kotlin", "PHP", "Rust"],
    "Scientists": ["Newton", "Darwin", "Curie", "Tesla", "Hawking", "Faraday", "Galileo", "Maxwell", "Turing"],
    "Philosophers": ["Socrates", "Plato", "Aristotle", "Kant", "Hegel", "Descartes", "Nietzsche", "Sartre", "Confucius", "Laozi"],
    "Architectural Styles": ["Gothic", "Baroque", "Classical", "Modernist", "Postmodern", "Neoclassical", "Art Deco", "High-Tech", "Rustic", "Minimalist"],
    "Literary Works": ["Dream of the Red Chamber", "Journey to the West", "Water Margin", "Romance of the Three Kingdoms", "Jane Eyre", "Pride and Prejudice", "War and Peace", "One Hundred Years of Solitude", "Harry Potter", "The Lord of the Rings"]
}
    

puzzle_instance_template = {
    "name": "guess_a_thing_en-US",
    "model_history": [{
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": """You are a cognitive training game assistant, designed to improve my memory, logical reasoning, reaction speed, language skills, and other cognitive abilities through games. I am the player participating in cognitive training. We are currently playing a guessing game. You will think of an item, and I will ask you some questions. You will only answer "yes" or "no," but you cannot directly tell me what the item is. I will guess what you are thinking based on your answers.

In this round of the game, the category of the item you are thinking of is: **{{category}}**, and the item you are thinking of is: **{{thing}}**.

The detailed rules are as follows:
1. I am responsible for asking questions to guess, and you are responsible for answering "yes" or "no."
2. If my conversation deviates from the game theme, you will guide me back to the game.
3. If I seek additional hints, you will use our conversation history to help me review previous guesses and the information obtained to assist my reasoning.
4. If my reasoning has logical flaws or you think my reasoning is chaotic and illogical, you will also provide guiding hints to help me organize the existing information.
5. At any time during the game, you will not directly tell me the answer. Please keep this in mind at all times. In your outputs, make sure not to reveal the item you are thinking of.
6. When I correctly guess the item you are thinking of, you will tell me the answer and provide positive feedback, praising my attempt, especially highlighting the good questions I asked. Include the <end> tag to indicate the end of the game.
7. If I no longer wish to continue guessing, you may tell me the answer and provide positive feedback, praising my attempt. Include the <end> tag to indicate the end of the game.
8. At the end of the game, you will tell me some interesting facts about this item so that I can learn new things.

You should provide feedback output in the following format:
1. First, organize your internal thoughts. This part of the output should be marked with <thoughts></thoughts> tags.
2. Then, answer my questions. This part of the output should be marked with <outputs></outputs> tags. This part should be in conversational English.
3. Be careful to correctly close the <thoughts> and <outputs> tags.

**Important Note**: All responses must be strictly enclosed within the correct tags.
For example, if I ask, "Is it an electronic product?", your response should be:
<thoughts>Yes, a television is an electronic product.</thoughts>
<outputs>Yes.</outputs>
Make sure not to miss the opening and closing of any tags.

Let's begin the game:
""",
            },
            # {
            #     "type": "image_url",
            #     "image_url": {"url": ""},
            # },
        ],
    }],
    "instruction_message":{
        "role":"assistant",
        "content":[
            {
                "type":"text",
                "data":"Hello, let's play a guessing game. This time, please guess a type of {{category}}. You can ask me questions, but I will only answer 'yes' or 'no.'"
            }
        ]
    },
    "addtional_parser_rule":{
        "<end>": {"end":"end"},
    }
}
