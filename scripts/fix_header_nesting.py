with open('client/src/components/layout/Header.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix the nesting:
# Remove the stray `)}` around line 581 and the redundant `{isAdmin && (` at line 584
bad_segment = """                </div>
              )}

                {/* Admin Quick Settings & Tools Dropdown */}
                {isAdmin && (
                  <div className="relative" ref={toolsMenuRef}>"""

good_segment = """                </div>

                {/* Admin Quick Settings & Tools Dropdown */}
                <div className="relative" ref={toolsMenuRef}>"""

text = text.replace(bad_segment, good_segment)

# At line 653:
bad_end = """                  </div>
                )}
              </div>"""

good_end = """                  </div>
                </div>
              )}"""

text = text.replace(bad_end, good_end)

with open('client/src/components/layout/Header.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Fixed Header.jsx nesting")

