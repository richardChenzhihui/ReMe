import importlib
import os
import sys

class CognitivePuzzleManager:
    def __init__(self):
        self.puzzles = self._load_puzzles()

    def _load_puzzles(self):
        puzzles = {}
        current_dir = os.path.dirname(__file__)
        puzzle_dir = os.path.join(current_dir,'')
        
        # Ensure the puzzle directory is in the system path
        if puzzle_dir not in sys.path:
            sys.path.insert(0, puzzle_dir)

        for file in os.listdir(puzzle_dir):
            if file.endswith('.py') and file not in ['__init__.py', 'cognitive_puzzle_manager.py']:
                module_name = file[:-3]
                module = importlib.import_module(module_name)
                puzzles[module_name] = module.make_puzzle
        return puzzles

    def list_puzzles(self):
        return list(self.puzzles.keys())

    def get_puzzle_maker(self, name, language=None):
        if not language:
            language = 'zh-CN'
        return self.puzzles.get(name+'_'+language)