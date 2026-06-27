import re

with open('/Users/green/Desktop/Korea-Apparel-Works/src/components/StartLanding.tsx', 'r') as f:
    content = f.read()

# The regex matches from the Capabilities comment until the start of Why Korea Section comment
cap_regex = re.compile(r'(        {\/\* Capabilities Section \*\/}\n        <section className="w-full bg-white py-12 md:py-16 px-6">.*?)(\n        {\/\* Why Korea Section - Card Grid \*\/})', re.DOTALL)
# The regex matches from the Why Korea Section comment until the Atelier Image Gallery comment
why_regex = re.compile(r'(        {\/\* Why Korea Section - Card Grid \*\/}\n        <section className="w-full bg-white pt-24 md:pt-32 pb-16 md:pb-24 px-6">.*?)(\n          {\/\* Atelier Image Gallery \*\/})', re.DOTALL)

cap_match = cap_regex.search(content)
why_match = why_regex.search(content)

if cap_match and why_match:
    cap_section = cap_match.group(1)
    why_section = why_match.group(1)
    
    # We replace the whole block from start of cap_section to end of why_section
    new_block = why_section + '\n\n' + cap_section
    
    # Replace in content
    start_idx = cap_match.start(1)
    end_idx = why_match.end(1)
    
    new_content = content[:start_idx] + new_block + content[end_idx:]
    
    with open('/Users/green/Desktop/Korea-Apparel-Works/src/components/StartLanding.tsx', 'w') as f:
        f.write(new_content)
    print("Swapped successfully")
else:
    print("Match failed")

