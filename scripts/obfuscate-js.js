import { promises as fs } from 'fs';
import path from 'path';
import JavaScriptObfuscator from 'javascript-obfuscator';

const projectRoot = path.resolve(process.cwd());
const controllersDir = path.join(projectRoot, 'app', 'controllers');
const backupDir = path.join(projectRoot, 'app', 'controllers_backup');

const obfuscationOptions = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,
  disableConsoleOutput: true,
  identifierNamesGenerator: 'hexadecimal',
  renameGlobals: false,
  rotateStringArray: true,
  selfDefending: true,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.75,
  transformObjectKeys: true,
  unicodeEscapeSequence: false
};

async function ensureBackupDir() {
  try {
    await fs.access(backupDir);
  } catch {
    await fs.mkdir(backupDir, { recursive: true });
  }
}

async function walkDirectory(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walkDirectory(fullPath));
    } else if (entry.isFile() && fullPath.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  return files;
}

async function backupFile(sourcePath) {
  const relative = path.relative(controllersDir, sourcePath);
  const backupPath = path.join(backupDir, relative);
  const backupDirPath = path.dirname(backupPath);
  await fs.mkdir(backupDirPath, { recursive: true });
  await fs.copyFile(sourcePath, backupPath);
}

async function obfuscateFile(filePath) {
  const source = await fs.readFile(filePath, 'utf8');
  const obfuscated = JavaScriptObfuscator.obfuscate(source, obfuscationOptions).getObfuscatedCode();
  await fs.writeFile(filePath, obfuscated, 'utf8');
}

async function run() {
  console.log('Obfuscating JS files under app/controllers...');

  await ensureBackupDir();
  const jsFiles = await walkDirectory(controllersDir);

  if (jsFiles.length === 0) {
    console.log('No JS files found in app/controllers.');
    return;
  }

  for (const file of jsFiles) {
    const relative = path.relative(controllersDir, file);
    console.log(`Backing up and obfuscating: ${relative}`);
    await backupFile(file);
    await obfuscateFile(file);
  }

  console.log('Obfuscation complete. Originals are backed up in app/controllers_backup/.');
}

run().catch(error => {
  console.error('Obfuscation failed:', error);
  process.exit(1);
});
