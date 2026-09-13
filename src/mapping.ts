// ponytail: disable cuma buat ID exact-match; ID unknown = keep (konservatif).
// always-keep sengaja longgar (substring) — salah tebak = tetap hidup, itu aman.

export interface ExtMeta {
  stack: string;
  label: string;
  reason: string;
}

export interface PlanEntry {
  id: string;
  label: string;
  reason: string;
}

export interface OptimizationPlan {
  stacks: string[];
  notRunning: PlanEntry[];
  keptByStack: PlanEntry[];
  keptAlways: PlanEntry[];
  keptPinned: PlanEntry[];
  unknownKept: PlanEntry[];
}

const STACK_OF: Record<string, ExtMeta> = {
  'bmewburn.vscode-intelephense-client': { stack: 'php', label: 'Intelephense', reason: 'PHP language tooling' },
  'devsense.phptools-vscode': { stack: 'php', label: 'PHP Tools', reason: 'PHP language tooling' },
  'devsense.composer-php-vscode': { stack: 'php', label: 'Composer', reason: 'PHP dependency tooling' },
  'devsense.intelli-php-vscode': { stack: 'php', label: 'Intelli PHP', reason: 'PHP language tooling' },
  'devsense.profiler-php-vscode': { stack: 'php', label: 'PHP Profiler', reason: 'PHP profiling' },
  'xdebug.php-debug': { stack: 'php', label: 'PHP Debug', reason: 'PHP debugger' },
  'xdebug.php-pack': { stack: 'php', label: 'PHP Pack', reason: 'PHP tooling bundle' },
  'amiralizadeh9480.laravel-extra-intellisense': { stack: 'php', label: 'Laravel Extra Intellisense', reason: 'Laravel tooling' },
  'ryannaddy.laravel-artisan': { stack: 'php', label: 'Laravel Artisan', reason: 'Laravel tooling' },
  'bradlc.vscode-tailwindcss': { stack: 'node', label: 'Tailwind CSS IntelliSense', reason: 'CSS tooling for web projects' },
  'prisma.prisma': { stack: 'node', label: 'Prisma', reason: 'Node ORM tooling' },
  'orta.vscode-jest': { stack: 'node', label: 'Jest', reason: 'JS test runner' },
  'ms-vscode.vscode-typescript-next': { stack: 'node', label: 'TypeScript Next', reason: 'JS/TS tooling' },
  'vue.volar': { stack: 'node', label: 'Vue Official', reason: 'Vue tooling' },
  'dsznajder.es7-react-js-snippets': { stack: 'node', label: 'ES7 React Snippets', reason: 'React snippets' },
  'msjsdiag.vscode-react-native': { stack: 'node', label: 'React Native Tools', reason: 'React Native tooling' },
  'msjsdiag.vscode-react-native-preview': { stack: 'node', label: 'React Native Tools Preview', reason: 'React Native tooling' },
  'rust-lang.rust-analyzer': { stack: 'rust', label: 'rust-analyzer', reason: 'Rust language server' },
  'tauri-apps.tauri-vscode': { stack: 'rust', label: 'Tauri', reason: 'Tauri/Rust app tooling' },
  'dart-code.dart-code': { stack: 'flutter', label: 'Dart', reason: 'Dart language tooling' },
  'dart-code.flutter': { stack: 'flutter', label: 'Flutter', reason: 'Flutter tooling' },
  'jeroen-meijer.pubspec-assist': { stack: 'flutter', label: 'Pubspec Assist', reason: 'Dart dependency tooling' },
  'nash.awesome-flutter-snippets': { stack: 'flutter', label: 'Awesome Flutter Snippets', reason: 'Flutter snippets' },
  'ms-python.python': { stack: 'python', label: 'Python', reason: 'Python language tooling' },
  'ms-python.vscode-pylance': { stack: 'python', label: 'Pylance', reason: 'Python language server' },
  'ms-toolsai.jupyter': { stack: 'python', label: 'Jupyter', reason: 'Notebook tooling' },
  'golang.go': { stack: 'go', label: 'Go', reason: 'Go language tooling' },
};

const ALWAYS_KEEP_EXACT = new Set([
  'eamodio.gitlens', 'mhutchie.git-graph',
  'github.copilot', 'github.copilot-chat', 'anthropic.claude-code', 'saoudrizwan.claude-dev', 'continue.continue',
  'esbenp.prettier-vscode', 'dbaeumer.vscode-eslint',
  'ms-vscode-remote.remote-ssh', 'ms-vscode-remote.remote-wsl', 'ms-vscode-remote.remote-containers', 'ms-vscode.remote-server',
  'shan.code-settings-sync',
  'postman.postman-for-vscode', 'ritwickdey.liveserver', 'usernamehw.errorlens', 'natizyskunk.sftp',
  'techer.open-in-browser', 'adpyke.codesnap', 'alexcvzz.vscode-sqlite', 'qwtel.sqlite-viewer',
  'shinotatwu-ds.file-tree-generator', 'shalldie.background',
]);

const KEEP_LABEL: Record<string, string> = {
  'eamodio.gitlens': 'GitLens',
  'mhutchie.git-graph': 'Git Graph',
  'github.copilot': 'Muse',
  'github.copilot-chat': 'Copilot Chat',
  'anthropic.claude-code': 'Claude Code',
  'saoudrizwan.claude-dev': 'Cline',
  'continue.continue': 'Continue',
  'esbenp.prettier-vscode': 'Prettier',
  'dbaeumer.vscode-eslint': 'ESLint',
  'ms-vscode-remote.remote-ssh': 'Remote SSH',
  'ms-vscode-remote.remote-wsl': 'Remote WSL',
  'ms-vscode-remote.remote-containers': 'Dev Containers',
  'ms-vscode.remote-server': 'Remote Server',
  'shan.code-settings-sync': 'Settings Sync',
  'postman.postman-for-vscode': 'Postman',
  'ritwickdey.liveserver': 'Live Server',
  'usernamehw.errorlens': 'Error Lens',
  'natizyskunk.sftp': 'SFTP',
  'techer.open-in-browser': 'Open in Browser',
  'adpyke.codesnap': 'CodeSnap',
  'alexcvzz.vscode-sqlite': 'SQLite',
  'qwtel.sqlite-viewer': 'SQLite Viewer',
  'shinotatwu-ds.file-tree-generator': 'File Tree Generator',
  'shalldie.background': 'Background',
};

export function isAlwaysKeep(id: string): boolean {
  const lid = id.toLowerCase();
  return ALWAYS_KEEP_EXACT.has(lid) || lid.includes('theme') || lid.includes('icon');
}

export function prettyId(id: string): string {
  const name = id.split('.').pop() ?? id;
  return name.split(/[-_]+/).map(w => (w ? w[0].toUpperCase() + w.slice(1) : w)).join(' ');
}

export function getOptimizationPlan(installedIds: string[], stacks: string[], pinnedIds: string[] = []): OptimizationPlan {
  const pinned = new Set(pinnedIds.map(id => id.toLowerCase()));
  const plan: OptimizationPlan = { stacks, notRunning: [], keptByStack: [], keptAlways: [], keptPinned: [], unknownKept: [] };
  for (const id of installedIds) {
    const lid = id.toLowerCase();
    if (pinned.has(lid)) {
      plan.keptPinned.push({ id, label: STACK_OF[lid]?.label ?? KEEP_LABEL[lid] ?? prettyId(id), reason: 'pinned by user' });
      continue;
    }
    if (isAlwaysKeep(id)) {
      plan.keptAlways.push({ id, label: KEEP_LABEL[lid] ?? prettyId(id), reason: 'always keep' });
      continue;
    }
    const meta = STACK_OF[lid];
    if (!meta) {
      plan.unknownKept.push({ id, label: prettyId(id), reason: 'unknown extension, kept safe' });
      continue;
    }
    if (stacks.includes(meta.stack)) {
      plan.keptByStack.push({ id, label: meta.label, reason: `${meta.reason}; matches ${meta.stack}` });
    } else {
      plan.notRunning.push({ id, label: meta.label, reason: `${meta.reason}; project is ${stacks.join('+') || 'unknown'}` });
    }
  }
  return plan;
}

export function getDisableCandidates(installedIds: string[], stacks: string[], pinnedIds: string[] = []): string[] {
  return getOptimizationPlan(installedIds, stacks, pinnedIds).notRunning.map(e => e.id);
}
