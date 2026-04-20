import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const publicImgDir = path.join(root, 'public', 'img');
const projectsMdPath = path.join(root, 'src', 'content', 'projects', 'index.md');

// External URLs to download
const externalUrls = [
  { url: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Marvel_Logo.svg', name: 'marvel.svg' }
];

async function run() {
  // 1. Create dir if it doesn't exist
  if (!fs.existsSync(publicImgDir)) {
    fs.mkdirSync(publicImgDir, { recursive: true });
    console.log(`Created ${publicImgDir}`);
  }

  // 2. Download external files
  for (const item of externalUrls) {
    const dest = path.join(publicImgDir, item.name);
    console.log(`Downloading ${item.url}...`);
    try {
      const response = await fetch(item.url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(dest, Buffer.from(buffer));
      console.log(`Saved ${item.name}`);
    } catch (err) {
      console.error(`Failed to download ${item.url}: ${err.message}`);
    }
  }

  // 3. Update markdown file
  if (!fs.existsSync(projectsMdPath)) {
    console.error(`File not found: ${projectsMdPath}`);
    return;
  }

  let content = fs.readFileSync(projectsMdPath, 'utf8');
  
  const replacements = {
    'title: "Proyecto Angular Marvel"': 'img/marvel.svg'
  };

  let updated = false;
  for (const [titleStr, localPath] of Object.entries(replacements)) {
    // Regex logic: find title, then find the NEXT image: "..." line
    const regex = new RegExp(`(${titleStr}[\\s\\S]*?image:\\s*)"[^"]+"`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, `$1"${localPath}"`);
      updated = true;
    }
  }

  if (updated) {
    fs.writeFileSync(projectsMdPath, content);
    console.log('Updated projects/index.md');
  } else {
    console.log('No updates needed in projects/index.md. Images are already local.');
  }
}

run();
