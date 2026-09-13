import * as fs from 'fs';
import * as path from 'path';

// ponytail: satu map ini = seluruh "database" deteksi MVP. Nambah stack = tambah 1 baris.
export const MARKERS: Record<string, string> = {
  'composer.json': 'php',
  'package.json': 'node',
  'Cargo.toml': 'rust',
  'pubspec.yaml': 'flutter',
  'requirements.txt': 'python',
  'go.mod': 'go',
};

export function detectStack(folderPath: string): string[] {
  return Object.keys(MARKERS).filter(m => fs.existsSync(path.join(folderPath, m))).map(m => MARKERS[m]);
}
