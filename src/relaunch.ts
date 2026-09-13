import { execSync, spawn } from 'node:child_process';

// ponytail: shell:true biar jalan di code.cmd Windows + POSIX tanpa resolve path manual.
// Log boleh string; eksekusi wajib args array supaya path berspasi nggak pecah.

export function buildRelaunchArgs(folder: string, ids: string[]): string[] {
  // ponytail: CLI maunya lowercase (code --list-extensions output); vscode API kadang kasih capitalized.
  return ['--new-window', ...ids.flatMap(id => ['--disable-extension', id.toLowerCase()]), folder];
}

export function buildCommandString(folder: string, ids: string[]): string {
  const q = (s: string) => (s.includes(' ') ? `"${s}"` : s);
  return ['code', ...buildRelaunchArgs(folder, ids).map(q)].join(' ');
}

function cleanEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  // ponytail: spawning Code from Code inherits extension-host plumbing; strip it so CLI behaves like terminal.
  for (const k of ['ELECTRON_RUN_AS_NODE', 'VSCODE_IPC_HOOK_CLI', 'VSCODE_CLI', 'VSCODE_NLS_CONFIG']) delete env[k];
  return env;
}

export function isReuseMode(mode: string | undefined): boolean {
  return mode === 'off';
}

export function cliAvailable(): boolean {
  try {
    execSync('code --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

export function launchOptimized(folder: string, ids: string[], onError: (msg: string) => void): string {
  const cmd = buildCommandString(folder, ids);
  const win = process.platform === 'win32';
  const exe = win ? 'cmd.exe' : 'code';
  const args = win ? ['/d', '/s', '/c', cmd] : buildRelaunchArgs(folder, ids);
  try {
    const child = spawn(exe, args, { detached: true, env: cleanEnv(), stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    child.stderr?.on('data', d => { stderr += String(d); });
    child.on('error', (err) => onError(`Diet spawn failed: ${err.message} | cmd: ${cmd}`));
    child.on('exit', (code) => { if (code !== 0 && code !== null) onError(`Diet 'code' exited ${code}${stderr ? ` | stderr: ${stderr.trim()}` : ''} | cmd: ${cmd}`); });
    child.unref();
  } catch (err: any) {
    onError(`Diet spawn threw: ${err?.message ?? err} | cmd: ${cmd}`);
  }
  return cmd;
}
