
import os, glob

PROJECT = r"d:\MY_PROJECT\FULL_STACK_PROJECT\ayush_portfolio_main"
CLIENT_SRC = os.path.join(PROJECT, "client", "src")

# Specific targeted fixes
FIXES = {
    r"client\src\components\ui\TechLogos.jsx": [
        ('#38BDF8', '#D4AF37'),
        ('"#38BDF8"', '"#D4AF37"'),
    ],
    r"client\src\pages\Admin\components\AdminMilestones.jsx": [
        ('bg-cyan-', 'bg-yellow-'),
    ],
    r"client\src\pages\Admin\components\AdminSkills.jsx": [
        ("'#06B6D4'", "'#D4AF37'"),
        ('#06B6D4', '#D4AF37'),
    ],
}

for rel_path, replacements in FIXES.items():
    fpath = os.path.join(PROJECT, rel_path)
    if not os.path.exists(fpath):
        print(f"NOT FOUND: {fpath}")
        continue
    with open(fpath, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()
    original = content
    for old, new in replacements:
        content = content.replace(old, new)
    if content != original:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"FIXED: {rel_path}")
    else:
        print(f"NO CHANGE: {rel_path}")

