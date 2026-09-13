import * as fs from 'fs';
import * as path from 'path';

// ponytail: satu map ini = seluruh "database" deteksi MVP. Nambah marker = tambah 1 baris.
const ROOT_MARKERS: Record<string, string> = {
  'composer.json': 'php',
  'package.json': 'node',
  'Cargo.toml': 'rust',
  'pubspec.yaml': 'flutter',
  'requirements.txt': 'python',
  'go.mod': 'go',
};

export const MARKERS: Record<string, string> = {
  ...ROOT_MARKERS,
  'src-tauri/Cargo.toml': 'rust',
};

// ponytail: scan dangkal depth-1 doang. Crawl rekursif = lambat + nyangkut di node_modules.
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'out', 'build', 'target', 'coverage', 'vendor', 'uploads', '.next', '.vscode']);

export function detectStack(folderPath: string): string[] {
  const found = new Set<string>();
  for (const m of Object.keys(MARKERS)) {
    if (fs.existsSync(path.join(folderPath, m))) found.add(MARKERS[m]);
  }
  let entries: fs.Dirent[] = [];
  try {
    entries = fs.readdirSync(folderPath, { withFileTypes: true });
  } catch {
    return [...found];
  }
  for (const e of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (!e.isDirectory() || SKIP_DIRS.has(e.name.toLowerCase())) continue;
    for (const [file, stack] of Object.entries(ROOT_MARKERS)) {
      if (fs.existsSync(path.join(folderPath, e.name, file))) found.add(stack);
    }
  }
  return [...found];
}
