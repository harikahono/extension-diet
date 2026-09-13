// ponytail: disable cuma buat ID exact-match; ID unknown = keep (konservatif).
// always-keep sengaja longgar (substring) — salah tebak = tetap hidup, itu aman.

const STACK_OF: Record<string, string> = {
  'bmewburn.vscode-intelephense-client': 'php',
  'devsense.phptools-vscode': 'php',
  'xdebug.php-debug': 'php',
  'amiralizadeh9480.laravel-extra-intellisense': 'php',
  'ryannaddy.laravel-artisan': 'php',
  'bradlc.vscode-tailwindcss': 'node',
  'prisma.prisma': 'node',
  'orta.vscode-jest': 'node',
  'ms-vscode.vscode-typescript-next': 'node',
  'rust-lang.rust-analyzer': 'rust',
  'dart-code.dart-code': 'flutter',
  'dart-code.flutter': 'flutter',
  'ms-python.python': 'python',
  'ms-python.vscode-pylance': 'python',
  'ms-toolsai.jupyter': 'python',
  'golang.go': 'go',
};

const ALWAYS_KEEP_EXACT = new Set([
  'eamodio.gitlens', 'mhutchie.git-graph',
  'github.copilot', 'github.copilot-chat', 'anthropic.claude-code', 'saoudrizwan.claude-dev', 'continue.continue',
  'esbenp.prettier-vscode', 'dbaeumer.vscode-eslint',
  'ms-vscode-remote.remote-ssh', 'ms-vscode-remote.remote-wsl', 'ms-vscode-remote.remote-containers', 'ms-vscode.remote-server',
  'shan.code-settings-sync',
]);

export function isAlwaysKeep(id: string): boolean {
  const lid = id.toLowerCase();
  return ALWAYS_KEEP_EXACT.has(lid) || lid.includes('theme') || lid.includes('icon');
}

export function getDisableCandidates(installedIds: string[], stacks: string[], pinnedIds: string[] = []): string[] {
  const pinned = new Set(pinnedIds.map(id => id.toLowerCase()));
  return installedIds.filter(id => {
    if (pinned.has(id.toLowerCase()) || isAlwaysKeep(id)) return false;
    const stack = STACK_OF[id.toLowerCase()];
    return stack !== undefined && !stacks.includes(stack);
  });
}
