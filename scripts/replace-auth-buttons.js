// scripts/replace-auth-buttons.js
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);

// Directories to scan
const DIRS_TO_SCAN = [
  'pages',
  'components',
];

// File extensions to process
const EXTENSIONS = ['.js', '.jsx', '.tsx'];

// Patterns to search for
const PATTERNS = [
  {
    find: /onClick\s*=\s*{\s*\(\)\s*=>\s*signIn\s*\(\s*["']google["']\s*\)\s*}/g,
    replace: (match) => {
      console.log('Found Google signIn call');
      return match.replace(/onClick\s*=\s*{\s*\(\)\s*=>\s*signIn\s*\(\s*["']google["']\s*\)\s*}/, '');
    }
  },
  {
    find: /<Link\s+href\s*=\s*["']\/auth\/signin["']\s*>\s*<button([^>]*)>([\s\S]*?)<\/button>\s*<\/Link>/g,
    replace: (match, buttonAttrs, content) => {
      console.log('Found Link to /auth/signin');
      // Extract className if present
      const classNameMatch = buttonAttrs.match(/className\s*=\s*["']([^"']+)["']/);
      const className = classNameMatch ? ` className="${classNameMatch[1]}"` : '';
      
      // Extract onClick if present
      const onClickMatch = buttonAttrs.match(/onClick\s*=\s*{([^}]+)}/);
      const onClick = onClickMatch ? ` onClick={${onClickMatch[1]}}` : '';
      
      return `<AuthButton${className}${onClick}>${content}</AuthButton>`;
    }
  },
  {
    find: /signIn\s*\(\s*["']google["']\s*\)/g,
    replace: () => {
      console.log('Found signIn("google")');
      return 'router.push("/auth/signin")';
    }
  }
];

// Check if file has AuthButton import
const hasAuthButtonImport = (content) => {
  return /import\s+AuthButton\s+from/.test(content);
};

// Add AuthButton import to file
const addAuthButtonImport = (content) => {
  // Find the last import statement
  const lastImportIndex = content.lastIndexOf('import');
  if (lastImportIndex === -1) return content;
  
  let endOfImports = content.indexOf('\n', lastImportIndex);
  while (content.charAt(endOfImports + 1) === 'i' && content.substring(endOfImports + 1, endOfImports + 7) === 'import') {
    endOfImports = content.indexOf('\n', endOfImports + 1);
  }
  
  // Insert our import after the last import
  const newContent = 
    content.substring(0, endOfImports + 1) +
    '\nimport AuthButton from "../components/AuthButton";\n' +
    content.substring(endOfImports + 1);
  
  return newContent;
};

// Process a single file
async function processFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    
    // Skip if file doesn't contain any sign in buttons or links
    if (!content.includes('signIn') && !content.includes('Sign In') && !content.includes('/auth/signin')) {
      return;
    }
    
    let newContent = content;
    let hasChanges = false;
    
    // Apply each pattern
    for (const pattern of PATTERNS) {
      const hasBefore = newContent.match(pattern.find);
      newContent = newContent.replace(pattern.find, pattern.replace);
      const hasAfter = newContent.match(pattern.find);
      
      if (hasBefore && (!hasAfter || hasBefore.length !== hasAfter.length)) {
        hasChanges = true;
      }
    }
    
    // If we made changes and the file doesn't have the AuthButton import, add it
    if (hasChanges && !hasAuthButtonImport(newContent)) {
      newContent = addAuthButtonImport(newContent);
    }
    
    // Only write if we made changes
    if (hasChanges) {
      console.log(`Updating ${filePath}`);
      await writeFile(filePath, newContent, 'utf8');
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
  }
}

// Recursively scan directories
async function scanDirectory(dirPath) {
  try {
    const entries = await readdir(dirPath);
    
    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry);
      const entryStat = await stat(entryPath);
      
      if (entryStat.isDirectory()) {
        // Skip node_modules and .next directories
        if (entry !== 'node_modules' && entry !== '.next') {
          await scanDirectory(entryPath);
        }
      } else if (entryStat.isFile()) {
        // Process only files with matching extensions
        const ext = path.extname(entryPath);
        if (EXTENSIONS.includes(ext)) {
          await processFile(entryPath);
        }
      }
    }
  } catch (err) {
    console.error(`Error scanning directory ${dirPath}:`, err);
  }
}

// Main function
async function main() {
  console.log('Starting to replace auth buttons...');
  
  for (const dir of DIRS_TO_SCAN) {
    console.log(`Scanning ${dir} directory...`);
    await scanDirectory(dir);
  }
  
  console.log('Finished replacing auth buttons.');
}

main().catch(console.error);