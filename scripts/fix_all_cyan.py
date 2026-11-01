#!/usr/bin/env python3
"""
Comprehensive script to replace ALL cyan/teal color references with gold (#d4af37)
across the entire codebase.
"""
import os
import re
import glob

PROJECT = r"d:\MY_PROJECT\FULL_STACK_PROJECT\ayush_portfolio_main"
CLIENT_SRC = os.path.join(PROJECT, "client", "src")

# ─── Color replacements (ordered most-specific first) ────────────────────────
COLOR_REPLACEMENTS = [
    # Hex colors
    ("#06b6d4", "#d4af37"),
    ("#38bdf8", "#d4af37"),
    ("#0891b2", "#b8960e"),  # darker gold for darker cyan
    ("#0e7490", "#b8960e"),
    ("#22d3ee", "#d4af37"),
    ("#0ea5e9", "#d4af37"),
    ("#7dd3fc", "#e8cc6a"),  # light cyan -> light gold
    ("#bae6fd", "#f5e6aa"),  # very light cyan -> very light gold
    ("#cffafe", "#fdf6e3"),
    ("#e0f2fe", "#fdf6e3"),
    # rgba cyan
    ("rgba(6, 182, 212,", "rgba(212, 175, 55,"),
    ("rgba(6,182,212,", "rgba(212,175,55,"),
    ("rgba(56, 189, 248,", "rgba(212, 175, 55,"),
    ("rgba(56,189,248,", "rgba(212,175,55,"),
    ("rgba(8, 145, 178,", "rgba(184, 150, 14,"),
    ("rgba(8,145,178,", "rgba(184,150,14,"),
    # Tailwind classes
    ("bg-cyan-50", "bg-yellow-50"),
    ("bg-cyan-100", "bg-yellow-100"),
    ("bg-cyan-200", "bg-yellow-200"),
    ("bg-cyan-300", "bg-yellow-300"),
    ("bg-cyan-400", "bg-yellow-400"),
    ("bg-cyan-500", "bg-yellow-500"),
    ("bg-cyan-600", "bg-yellow-600"),
    ("bg-cyan-700", "bg-yellow-700"),
    ("bg-cyan-800", "bg-yellow-800"),
    ("bg-cyan-900", "bg-yellow-900"),
    ("text-cyan-50", "text-yellow-50"),
    ("text-cyan-100", "text-yellow-100"),
    ("text-cyan-200", "text-yellow-200"),
    ("text-cyan-300", "text-yellow-300"),
    ("text-cyan-400", "text-yellow-400"),
    ("text-cyan-500", "text-yellow-500"),
    ("text-cyan-600", "text-yellow-600"),
    ("text-cyan-700", "text-yellow-700"),
    ("text-cyan-800", "text-yellow-800"),
    ("text-cyan-900", "text-yellow-900"),
    ("border-cyan-50", "border-yellow-50"),
    ("border-cyan-100", "border-yellow-100"),
    ("border-cyan-200", "border-yellow-200"),
    ("border-cyan-300", "border-yellow-300"),
    ("border-cyan-400", "border-yellow-400"),
    ("border-cyan-500", "border-yellow-500"),
    ("border-cyan-600", "border-yellow-600"),
    ("border-cyan-700", "border-yellow-700"),
    ("border-cyan-800", "border-yellow-800"),
    ("border-cyan-900", "border-yellow-900"),
    ("ring-cyan-50", "ring-yellow-50"),
    ("ring-cyan-100", "ring-yellow-100"),
    ("ring-cyan-200", "ring-yellow-200"),
    ("ring-cyan-300", "ring-yellow-300"),
    ("ring-cyan-400", "ring-yellow-400"),
    ("ring-cyan-500", "ring-yellow-500"),
    ("ring-cyan-600", "ring-yellow-600"),
    ("ring-cyan-700", "ring-yellow-700"),
    ("ring-cyan-800", "ring-yellow-800"),
    ("ring-cyan-900", "ring-yellow-900"),
    ("from-cyan-", "from-yellow-"),
    ("to-cyan-", "to-yellow-"),
    ("via-cyan-", "via-yellow-"),
    # Tailwind slash opacity variants
    ("bg-cyan-400/", "bg-yellow-500/"),
    ("bg-cyan-500/", "bg-yellow-500/"),
    ("bg-cyan-600/", "bg-yellow-600/"),
    ("text-cyan-400/", "text-yellow-400/"),
    ("text-cyan-300/", "text-yellow-300/"),
    ("border-cyan-400/", "border-yellow-400/"),
    ("border-cyan-500/", "border-yellow-500/"),
    # Teal Tailwind
    ("bg-teal-", "bg-yellow-"),
    ("text-teal-", "text-yellow-"),
    ("border-teal-", "border-yellow-"),
    ("ring-teal-", "ring-yellow-"),
    ("from-teal-", "from-yellow-"),
    ("to-teal-", "to-yellow-"),
    # Sky Tailwind  
    ("bg-sky-", "bg-yellow-"),
    ("text-sky-", "text-yellow-"),
    ("border-sky-", "border-yellow-"),
    # Specific CSS variable patterns  
    ("var(--accent-primary, #22d3ee)", "var(--accent-primary, #d4af37)"),
    ("var(--accent-1, #38bdf8)", "var(--accent-1, #d4af37)"),
    ("var(--brand-color, #06b6d4)", "var(--brand-color, #d4af37)"),
    # Linear gradients with cyan
    ("linear-gradient(135deg, #06b6d4, #0284c7)", "linear-gradient(135deg, #d4af37, #b8960e)"),
    ("linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)", "linear-gradient(135deg, #d4af37 0%, #b8960e 100%)"),
    ("linear-gradient(135deg, #0891b2, #0284c7)", "linear-gradient(135deg, #b8960e, #9a7c0a)"),
    ("linear-gradient(135deg, #06b6d4, #0891b2)", "linear-gradient(135deg, #d4af37, #b8960e)"),
    ("linear-gradient(135deg, #38bdf8, #0ea5e9)", "linear-gradient(135deg, #d4af37, #b8960e)"),
    # SVG fill/stroke
    ('fill="#06b6d4"', 'fill="#d4af37"'),
    ('fill="#38bdf8"', 'fill="#d4af37"'),
    ('fill="#22d3ee"', 'fill="#d4af37"'),
    ('stroke="#06b6d4"', 'stroke="#d4af37"'),
    ('stroke="#38bdf8"', 'stroke="#d4af37"'),
    ('stopColor="#38bdf8"', 'stopColor="#d4af37"'),
    ('stopColor="#06b6d4"', 'stopColor="#d4af37"'),
    # style={{ color: '#06b6d4' }}
    ("'#06b6d4'", "'#d4af37'"),
    ('"#06b6d4"', '"#d4af37"'),
    ("'#38bdf8'", "'#d4af37'"),
    ('"#38bdf8"', '"#d4af37"'),
    ("'#0891b2'", "'#b8960e'"),
    ('"#0891b2"', '"#b8960e"'),
    # Remaining dark blue bg used in cyber-styled cards (replace with dark gold)
    ("bg-[#0B1528]", "bg-[#0a0800]"),
    ("bg-[#080d15]", "bg-[#0a0800]"),
    ("bg-[#080d15]/95", "bg-[#0a0800]/95"),
]

# CSS-only replacements (for .css files)
CSS_COLOR_REPLACEMENTS = [
    ("color: #06b6d4", "color: #d4af37"),
    ("border-color: #06b6d4", "border-color: #d4af37"),
    ("border-color: #0891b2", "border-color: #b8960e"),
    ("background: #06b6d4", "background: #d4af37"),
    ("background-color: #06b6d4", "background-color: #d4af37"),
    ("background: #0891b2", "background: #b8960e"),
    ("border: 1px solid #06b6d4", "border: 1px solid #d4af37"),
    ("color: #0891b2", "color: #b8960e"),
]


def fix_file(filepath, extra_replacements=None):
    try:
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
    except Exception as e:
        print(f"  ERR reading {filepath}: {e}")
        return 0

    original = content
    count = 0

    replacements = list(COLOR_REPLACEMENTS)
    if extra_replacements:
        replacements = extra_replacements + replacements

    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
            count += 1

    if content != original:
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"  FIXED ({count} patterns): {os.path.basename(filepath)}")
        except Exception as e:
            print(f"  ERR writing {filepath}: {e}")
        return 1
    return 0


def main():
    total = 0

    # Fix all JSX/JS/TS files in client/src
    for ext in ("*.jsx", "*.tsx", "*.js", "*.ts"):
        for fpath in glob.glob(os.path.join(CLIENT_SRC, "**", ext), recursive=True):
            if "node_modules" in fpath:
                continue
            total += fix_file(fpath)

    # Fix CSS files with extra CSS replacements
    css_dir = os.path.join(CLIENT_SRC, "styles")
    for fpath in glob.glob(os.path.join(css_dir, "**", "*.css"), recursive=True):
        total += fix_file(fpath, extra_replacements=CSS_COLOR_REPLACEMENTS)

    # Fix root-level CSS
    for fpath in glob.glob(os.path.join(CLIENT_SRC, "*.css")):
        total += fix_file(fpath, extra_replacements=CSS_COLOR_REPLACEMENTS)

    print(f"\nDone. {total} files updated.")


if __name__ == "__main__":
    main()

