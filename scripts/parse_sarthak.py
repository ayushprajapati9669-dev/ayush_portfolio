import re

with open('C:/Users/Lenovo/.gemini/antigravity/brain/a65f0578-4a47-4a84-8743-3af3312bebbb/sarthak_live.html', 'r', encoding='utf-8') as f:
    html = f.read()

hero = re.search(r'<section class="hero"[^>]*>([\s\S]*?)</section>', html)
if hero:
    print('FOUND HERO:')
    print(hero.group(0).encode('ascii', errors='ignore').decode('ascii'))
else:
    print('Hero not found')

