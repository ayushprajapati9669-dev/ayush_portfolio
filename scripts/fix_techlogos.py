
with open(r"d:\MY_PROJECT\FULL_STACK_PROJECT\ayush_portfolio_main\client\src\components\common\TechLogos.jsx", 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()
original = content
content = content.replace('#38BDF8', '#D4AF37')
content = content.replace('"#38BDF8"', '"#D4AF37"')
content = content.replace("'#38BDF8'", "'#D4AF37'")
content = content.replace('#38bdf8', '#d4af37')
if content != original:
    with open(r"d:\MY_PROJECT\FULL_STACK_PROJECT\ayush_portfolio_main\client\src\components\common\TechLogos.jsx", 'w', encoding='utf-8') as f:
        f.write(content)
    print("FIXED TechLogos.jsx")
else:
    print("No changes needed")

