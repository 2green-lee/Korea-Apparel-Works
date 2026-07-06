const fs = require('fs');

const welcomeContent = fs.readFileSync('src/components/WelcomeLanding.tsx', 'utf8');
const heroContent = fs.readFileSync('src/components/Hero.tsx', 'utf8');

// In WelcomeLanding.tsx, the AI section starts at {/* AI Workflow Section */}
// and ends before {/* Global Export Map Section placed inside the black area */}
const welcomeStartStr = "{/* AI Workflow Section */}";
const welcomeEndStr = "{/* Global Export Map Section placed inside the black area */}";

let aiSection = welcomeContent.substring(
  welcomeContent.indexOf(welcomeStartStr),
  welcomeContent.indexOf(welcomeEndStr)
);

// Clean up the refs and animation classes from WelcomeLanding's AI section
aiSection = aiSection.replace(/ref=\{aiWorkflowRef\}\s*/g, '');
aiSection = aiSection.replace(/className=\{`w-full transition-all duration-1000 ease-out \$\{aiWorkflowIn \? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`\}/g, 'className="w-full"');
// Change the outer section tags to match Hero.tsx's structure if necessary.
// Hero.tsx's structure expects it to be part of the flow. Let's just use the section.

// In Hero.tsx, the old AI section starts at <div id="ai-tech-section"
// and ends right before {/* Export Map for Mobile inside the dark section */}
const heroStartStr = '<div id="ai-tech-section"';
const heroEndStr = '{/* Export Map for Mobile inside the dark section */}';

const heroStartIndex = heroContent.indexOf(heroStartStr);
const heroEndIndex = heroContent.indexOf(heroEndStr);

if (heroStartIndex === -1 || heroEndIndex === -1) {
  console.error("Could not find boundaries in Hero.tsx");
  process.exit(1);
}

const newHeroContent = heroContent.substring(0, heroStartIndex) + aiSection + "\n                " + heroContent.substring(heroEndIndex);

fs.writeFileSync('src/components/Hero.tsx', newHeroContent, 'utf8');
console.log("Successfully replaced the AI section in Hero.tsx with the one from WelcomeLanding.tsx");
