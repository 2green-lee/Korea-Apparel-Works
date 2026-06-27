import re

with open('/Users/green/Desktop/Korea-Apparel-Works/src/components/StartLanding.tsx', 'r') as f:
    content = f.read()

# Replace the specific calc width with 42vw
content = content.replace('w-[calc(50vw-1.5rem)]', 'w-[42vw]')

with open('/Users/green/Desktop/Korea-Apparel-Works/src/components/StartLanding.tsx', 'w') as f:
    f.write(content)
print("Updated card sizes to allow peeking")

