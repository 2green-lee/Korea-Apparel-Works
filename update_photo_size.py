import re

with open('/Users/green/Desktop/Korea-Apparel-Works/src/components/StartLanding.tsx', 'r') as f:
    content = f.read()

# Replace the specific width string
content = content.replace(
    'w-[calc(33.333vw-1.25rem)] sm:w-[calc(33.333%-1rem)] md:w-[calc(25%-1.125rem)]',
    'w-[calc(50vw-1.5rem)] sm:w-[calc(40%-1rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(28%-1rem)]'
)

with open('/Users/green/Desktop/Korea-Apparel-Works/src/components/StartLanding.tsx', 'w') as f:
    f.write(content)
print("Updated photo sizes")

