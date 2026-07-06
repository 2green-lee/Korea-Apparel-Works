const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/components');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

let changedFiles = 0;
for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const newContent = content.replace(/\bmd:/g, 'lg:');
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    changedFiles++;
    console.log(`Updated ${file}`);
  }
}
console.log(`Finished updating ${changedFiles} files.`);
