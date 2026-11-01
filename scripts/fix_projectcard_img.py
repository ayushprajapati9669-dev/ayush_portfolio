
with open(r'd:\MY_PROJECT\FULL_STACK_PROJECT\ayush_portfolio_main\client\src\components\projects\ProjectCard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and fix the aspectRatio inline style
import re

# Replace the inline style on the img tag in ProjectCard
old_style = 'style={{ aspectRatio: "16/9", objectFit: "cover" }}'
new_style = "style={{ width: '100%', height: '200px', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}"

if old_style in content:
    content = content.replace(old_style, new_style)
    with open(r'd:\MY_PROJECT\FULL_STACK_PROJECT\ayush_portfolio_main\client\src\components\projects\ProjectCard.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print('FIXED ProjectCard image style')
else:
    # Try to find what's there
    idx = content.find('aspectRatio')
    if idx >= 0:
        snippet = content[max(0,idx-80):idx+120]
        print(f'Found aspectRatio at {idx}:')
        print(repr(snippet))
    else:
        print('No aspectRatio found - may be CRLF issue')
        # Try CRLF content
        content_bytes = content.encode('utf-8')
        idx2 = content_bytes.find(b'aspectRatio')
        if idx2 >= 0:
            print('Found as bytes at:', idx2)
            print(repr(content_bytes[max(0,idx2-80):idx2+120]))

