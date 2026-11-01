with open('client/src/components/layout/Header.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

target = '              {/* Theme & Accent Controls (Available across ALL pages: Public & Admin) */}\n              <div className="flex items-center gap-1.5 flex-nowrap shrink-0">'

replacement = '              {/* Theme & Accent Controls (Only on Admin) */}\n              {isAdmin && (\n                <div className="flex items-center gap-1.5 flex-nowrap shrink-0">'

if target in text:
    text = text.replace(target, replacement)
    # find where this div ends before the next admin block
    marker = '                {/* Admin Quick Settings & Tools Dropdown */}'
    idx = text.find(marker)
    if idx != -1:
        # Before this marker, insert '              )}\n\n'
        # find the preceding </div>
        div_idx = text.rfind('</div>', 0, idx)
        text = text[:div_idx+6] + '\n              )}' + text[div_idx+6:]

    with open('client/src/components/layout/Header.jsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Header.jsx updated successfully")
else:
    print("Target not found")

