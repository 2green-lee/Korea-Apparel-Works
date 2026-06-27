import re

with open('/Users/green/Desktop/Korea-Apparel-Works/src/components/StartLanding.tsx', 'r') as f:
    content = f.read()

# Replace width
content = content.replace('w-[85vw] sm:w-[320px] md:w-auto snap-center p-6 md:p-8', 'w-[calc(50vw-1.5rem)] sm:w-[320px] md:w-auto snap-center p-4 sm:p-6 md:p-8')

# Replace text sizes in the cards
# Icon box margin
content = content.replace('mb-4 sm:mb-6 text-', 'mb-3 sm:mb-6 text-')
content = content.replace('w-12 h-12 rounded-xl', 'w-10 h-10 md:w-12 md:h-12 rounded-xl')
content = content.replace('w-6 h-6', 'w-5 h-5 md:w-6 md:h-6')

# Titles
content = content.replace('text-xl font-bold', 'text-lg md:text-xl font-bold')
content = content.replace('mb-3 sm:mb-5 group-hover', 'mb-2 md:mb-5 group-hover')

# Description text
content = content.replace('text-base text-neutral-600', 'text-sm md:text-base text-neutral-600')

with open('/Users/green/Desktop/Korea-Apparel-Works/src/components/StartLanding.tsx', 'w') as f:
    f.write(content)
print("Updated card sizes")

