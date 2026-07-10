import re

with open('public/logo.svg', 'r') as f:
    svg_data = f.read()

# Find all shapes that are white (these are the holes)
white_shapes_pattern = re.compile(r'<(?:path|ellipse)[^>]*fill="#ffffff"[^>]*>[\s\S]*?(?:/>|</path>|</ellipse>)')
white_shapes = white_shapes_pattern.findall(svg_data)

# Remove white shapes from the main svg
svg_without_white = white_shapes_pattern.sub('', svg_data)

# Convert white shapes to black for the mask
mask_shapes = []
for shape in white_shapes:
    mask_shapes.append(shape.replace('fill="#ffffff"', 'fill="#000000"'))

mask_content = '\n'.join(mask_shapes)

# Create the defs with mask
defs = f"""<defs>
<mask id="holes">
  <rect x="-1000" y="-1000" width="3000" height="3000" fill="#ffffff" />
  {mask_content}
</mask>
</defs>"""

# Inject the mask into the SVG
# Find the start of the first <g> or <path>
insert_pos = svg_without_white.find('<g')
if insert_pos == -1:
    insert_pos = svg_without_white.find('<path')

if insert_pos != -1:
    # We wrap the main contents in a group with the mask
    # Find the closing </svg>
    end_pos = svg_without_white.rfind('</svg>')
    
    new_svg = (
        svg_without_white[:insert_pos] +
        defs +
        '\n<g mask="url(#holes)">\n' +
        svg_without_white[insert_pos:end_pos] +
        '</g>\n' +
        '</svg>'
    )
    
    with open('public/logo.svg', 'w') as f:
        f.write(new_svg)
    print("Successfully added mask to SVG!")
else:
    print("Could not find insertion point.")
