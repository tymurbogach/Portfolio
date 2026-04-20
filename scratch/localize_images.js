import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const publicImgDir = path.join(root, 'public', 'img');
const projectsMdPath = path.join(root, 'src', 'content', 'projects.md');

// Brain images
const brainDir = 'C:\\Users\\Cyberdyne\\.gemini\\antigravity\\brain\\a3611a7c-3900-4a10-88ac-61a48bcbd763';
const brainFiles = {
  'media__1776654665005.png': 'cluckinbell.png',
  'media__1776654686979.jpg': 'valorant.jpg',
  'media__1776654703286.png': 'guitar-store.png'
};

// External URLs to download
const externalUrls = [
  { url: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Marvel_Logo.svg', name: 'marvel.svg' },
  { url: 'https://cdn-icons-png.flaticon.com/512/891/891462.png', name: 'vue-tienda.png' },
  { url: 'https://cdn-icons-png.flaticon.com/512/3771/3771331.png', name: 'react-tasks.png' },
  { url: 'https://cdn-icons-png.flaticon.com/512/919/919850.png', name: 'laravel-vue.png' },
  { url: 'https://cdn-icons-png.flaticon.com/512/732/732212.png', name: 'angular-web.png' },
  { url: 'https://cdn-icons-png.flaticon.com/512/263/263142.png', name: 'react-products.png' },
  { url: 'https://cdn-icons-png.flaticon.com/512/3050/3050525.png', name: 'rps.png' },
  { url: 'https://cdn-icons-png.flaticon.com/512/2909/2909767.png', name: 'plants.png' }
];

async function run() {
  // 1. Create dir
  if (!fs.existsSync(publicImgDir)) {
    fs.mkdirSync(publicImgDir, { recursive: true });
    console.log(`Created ${publicImgDir}`);
  }

  // 2. Move brain files
  for (const [brainFile, localFile] of Object.entries(brainFiles)) {
    const src = path.join(brainDir, brainFile);
    const dest = path.join(publicImgDir, localFile);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`Copied ${brainFile} to ${localFile}`);
    } else {
      console.error(`Brain file not found: ${src}`);
    }
  }

  // 3. Download external files
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

  // 4. Update projects.md
  let content = fs.readFileSync(projectsMdPath, 'utf8');

  // Replace Base64 sections (assuming they are in order or searchable)
  // Actually, let's do a more robust string replacement based on titles if possible, 
  // but a simple regex for the image lines in order might work too.
  
  const replacements = {
    'title: "Valorant"': '/img/valorant.jpg',
    'title: "CluckinBell"': '/img/cluckinbell.png',
    'title: "Guitar Store"': '/img/guitar-store.png',
    'title: "Proyecto Angular Marvel"': '/img/marvel.svg',
    'title: "Tienda online con Vue.js"': '/img/vue-tienda.png',
    'title: "Aplicacion de tareas con React"': '/img/react-tasks.png',
    'title: "Web con Laravel y Vue.js"': '/img/laravel-vue.png',
    'title: "Web personal con Angular"': '/img/angular-web.png',
    'title: "Pagina de productos con React"': '/img/react-products.png',
    'title: "Piedra, papel o tijera"': '/img/rps.png',
    'title: "InventarioPlantas"': '/img/plants.png'
  };

  for (const [titleStr, localPath] of Object.entries(replacements)) {
    // Regex logic: find title, then find the NEXT image: "..." line
    const regex = new RegExp(`(${titleStr}[^]*?image:\\s*)"[^"]+"`, 'g');
    content = content.replace(regex, `$1"${localPath}"`);
  }

  fs.writeFileSync(projectsMdPath, content);
  console.log('Updated projects.md');
}

run();
