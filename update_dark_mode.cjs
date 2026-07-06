const fs = require('fs');

let heroContent = fs.readFileSync('src/components/Hero.tsx', 'utf8');

const startTag = '        <section className="mt-20 py-24 px-6 w-screen relative left-1/2 right-1/2 -mx-[50vw] bg-neutral-950 text-white border-t border-neutral-900">';
const endTag = '                {/* Export Map for Mobile inside the dark section */}';

const startIndex = heroContent.indexOf(startTag);
const endIndex = heroContent.indexOf(endTag);

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find section boundaries");
  process.exit(1);
}

let section = heroContent.substring(startIndex, endIndex);

// Replace styles in the feature highlights and flowchart
section = section.replace(/bg-white/g, 'bg-neutral-900');
section = section.replace(/border-neutral-200/g, 'border-neutral-800');
section = section.replace(/text-neutral-900/g, 'text-white');
section = section.replace(/text-neutral-600/g, 'text-neutral-400');

section = section.replace(/bg-blue-50( |")/g, 'bg-blue-900/20$1');
section = section.replace(/border-blue-100/g, 'border-blue-800/30');
section = section.replace(/text-blue-600/g, 'text-blue-400');
section = section.replace(/border-blue-200/g, 'border-blue-800');

section = section.replace(/border-amber-200/g, 'border-amber-800');
section = section.replace(/text-amber-600/g, 'text-amber-400');

// Fix an issue where it might match bg-blue-50 or text-neutral-900 inside other classes, but we only have specific classes.
// The replace with 'g' flag replaces all occurrences within this section.

const newContent = heroContent.substring(0, startIndex) + section + heroContent.substring(endIndex);

fs.writeFileSync('src/components/Hero.tsx', newContent, 'utf8');
console.log("Successfully updated AI workflow styles to dark mode.");
