
import re

files_to_fix = [
    r"d:\MY_PROJECT\FULL_STACK_PROJECT\ayush_portfolio_main\client\src\styles\admin.css",
]

for fp in files_to_fix:
    with open(fp, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()
    
    # Fix remaining gradient with #0284c7
    content = content.replace('#0284c7', '#b8960e')
    content = content.replace('linear-gradient(135deg, #d4af37 0%, #b8960e 100%)', 
                               'linear-gradient(135deg, #d4af37, #b8960e)')
    
    with open(fp, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Fixed: {fp}")

