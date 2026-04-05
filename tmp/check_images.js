const fs = require('fs');
const path = require('path');

function checkTSFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.endsWith('.ts') && file.includes('blog') || file.includes('seoArticles')) {
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      
      let lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('title:')) {
           const titleMatch = lines[i].match(/title:\s*['"](.*?)['"]/);
           if (!titleMatch) continue;
           
           // Look ahead for featuredImage
           let hasImage = false;
           for (let j = i; j < Math.min(i + 50, lines.length); j++) {
             if (lines[j].includes('featuredImage:')) {
               hasImage = true;
               break;
             }
             if (lines[j].includes('title:') && j !== i) {
               break; // next post started
             }
           }
           
           if (!hasImage && titleMatch) {
             console.log(`Missing image in file ${file} for article: ${titleMatch[1]}`);
           }
        }
      }
    }
  }
}
checkTSFiles('./src/data');
