const fs = require('fs');
const path = require('path');

// সাধারণ কিছু বানান বা HTML ট্যাগ ভুল সংশোধনের নিয়ম (প্রয়োজনমতো বাড়াতে পারেন)
function fixCommonErrors(content) {
  // উদাহরণস্বরূপ কিছু কমন বানান বা ভুল ট্যাগ অটো-রিপ্লেস করা
  let fixed = content;
  // অতিরিক্ত স্পেস বা সাধারণ টাইপো ঠিক করার লজিক এখানে যুক্ত করা যায়
  return fixed;
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('.git')) {
        walkDir(fullPath);
      }
    } else if (file.endsWith('.html') || file.endsWith('.js') || file.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let updatedContent = fixCommonErrors(content);
      if (content !== updatedContent) {
        fs.writeFileSync(fullPath, updatedContent, 'utf8');
        console.log(`Fixed: ${fullPath}`);
      }
    }
  });
}

console.log('🤖 Auto-fix robot is scanning your project files...');
walkDir('./');
console.log('✨ Scan and fix completed successfully!');
