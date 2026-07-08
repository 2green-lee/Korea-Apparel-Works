import os

files = ['src/components/StartLanding.tsx', 'src/components/WelcomeLanding.tsx']

for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    ai_marker = "{/* AI Workflow Section */}"
    sample_marker = "{/* Sample Policy Section */}"
    cta_marker = "{/* Final CTA Section */}"
    
    ai_idx = content.find(ai_marker)
    sample_idx = content.find(sample_marker)
    cta_idx = content.find(cta_marker)
    
    if ai_idx != -1 and sample_idx != -1 and cta_idx != -1:
        prefix = content[:ai_idx]
        ai_section = content[ai_idx:sample_idx]
        sample_section = content[sample_idx:cta_idx]
        suffix = content[cta_idx:]
        
        # Swap them
        new_content = prefix + sample_section + ai_section + suffix
        
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Successfully swapped sections in {fpath}")
    else:
        print(f"Failed to find all markers in {fpath}: ai={ai_idx}, sample={sample_idx}, cta={cta_idx}")
