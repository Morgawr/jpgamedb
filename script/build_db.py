#!/usr/bin/python
import argparse
from enum import Enum, EnumMeta
import os
import json
import sys
from typing import Dict, Tuple

def eprint(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)

class MetaEnum(EnumMeta):
    def __contains__(cls, item):
        try:
            cls(item)
        except ValueError:
            return False
        return True

class BaseEnum(Enum, metaclass=MetaEnum):
    pass

class Difficulty(BaseEnum):
    VERY_EASY = "very easy"
    EASY = "easy"
    AVERAGE = "average"
    HARD = "hard"
    VERY_HARD = "very hard"
    UNKNOWN = "unknown"

class Tag(BaseEnum):
    TITLE = "title"
    GENRE = "genre"
    DIFFICULTY = "difficulty"
    FURIGANA = "furigana"
    JAPANESE_GAME = "japanese_game"

class Furigana(BaseEnum):
    NOT_SUPPORTED = "not supported"
    PARTIAL = "partial"
    FULL = "full"
    UNKNOWN = "unknown"

# TODO: This isn't great but having a single main genre/gameplay type is a good
#       start
class Genre(BaseEnum):
    JRPG = "jrpg"
    ACTION = "action"
    VISUAL_NOVEL = "visual novel"
    MMORPG = "mmorpg"
    GACHA = "gacha"
    FPS = "fps"
    ADVENTURE = "adventure"
    UNKNOWN = "unknown"

class IsJapanese(BaseEnum):
    YES = "yes"
    NO = "no"
    UNKNOWN = "unknown"

ENUM_MAPPING = {
        Tag.GENRE: Genre,
        Tag.DIFFICULTY: Difficulty,
        Tag.FURIGANA: Furigana,
        Tag.JAPANESE_GAME: IsJapanese,
}

def verify_input_is_valid(input: str) -> bool:
    index = os.path.join(input, "index.txt")
    return os.path.isfile(index)

def load_game_entry(input: str) -> Tuple[str, Dict[str, str]]:
    """Returns a key,value dictionary entry for a game."""
    count = 0
    in_notes = False
    notes = ""
    data = {}
    for line in open(input, "r").readlines():
        count += 1
        if in_notes:
            notes += ("\n" + line)
            continue
        if line.startswith("## Notes"):
            in_notes = True
            continue
        if not line.strip():
            continue
        if " " not in line or line.split()[0].lower() not in Tag:
            eprint("Malformed line found in file:", input, "line:", count)
            eprint("Tag is missing or unknown in a tag line")
            raise ValueError
        tag = Tag(line.split()[0].lower())
        entry = " ".join(line.split()[1:])
        if tag in ENUM_MAPPING:
            data[tag.value] = ENUM_MAPPING[tag](entry.lower()).value
        else:
            data[tag.value] = entry
    if Tag.TITLE.value not in data:
        eprint("Title tag is missing from the", input, " entry.")
        raise ValueError
    for tag in ENUM_MAPPING.keys():
        if tag.value not in data:
            data[tag.value] = ENUM_MAPPING[tag]("unknown").value
    data["notes"] = notes
    return (data[Tag.TITLE.value], data)

def build_data_map(input: str) -> Dict[str, Dict[str, str]]:
    game_list = [
            game.strip()
            for game in open(
                os.path.join(input, "index.txt"), "r").readlines()
            if game.strip()
    ]
    game_map = {}
    for game in game_list:
        title, data = load_game_entry(os.path.join(input, game))
        if title in game_map:
            eprint("Duplicate entry found in database:", title)
            raise ValueError
        game_map[title] = data
    return game_map

def main() -> int:
    parser = argparse.ArgumentParser(
            description="Build the json database for the game list.")
    parser.add_argument(
            "--input",
            required=True,
            help="The directory path where the source db files exist. It \
                  expects an index.txt file to be present.")
    parser.add_argument(
            "--output",
            required=True,
            help="The directory path where the json db will be written to.")
    args = parser.parse_args()
    if not verify_input_is_valid(args.input):
        eprint("Database file index.txt not found at", args.input)
        return 1
    games = build_data_map(args.input)
    with open(os.path.join(args.output, "gamelist.json"), "w") as f:
        f.write(json.dumps(list(games.values()), indent=4, ensure_ascii=False))
    return 0

if __name__ == '__main__':
    sys.exit(main())