import * as vscode from 'vscode';
import { detectStack } from './detect';
import { getDisableCandidates } from './mapping';
import { buildCommandString, cliAvailable, isReuseMode, launchOptimized } from './relaunch';
import { clearDecision, getDecision, saveDecision, stateKey } from './store';

const PINS_KEY = 'extdiet:pins';

function getPins(store: vscode.Memento): string[] {
  return store.get<string[]>(PINS_KEY, []);
}

async function runOptimize(context: vscode.ExtensionContext, log: vscode.OutputChannel, folder: string, stacks: string[], candidates: string[], key: string): Promise<void> {
  if (!folder) {
    log.appendLine('runOptimize: empty folder path, aborting.');
    vscode.window.showErrorMessage('Extension Diet: folder path missing, cannot relaunch.');
    return;
  }
  if (!candidates.length) {
    await saveDecision(context.globalState, key, 'optimized');
    vscode.window.showInformationMessage('Extension Diet: nothing irrelevant to turn off for this window.');
    return;
  }
  const mode = vscode.workspace.getConfiguration('window').get<string>('openFoldersInNewWindow');
  if (isReuseMode(mode)) {
    const go = await vscode.window.showWarningMessage(
      'Extension Diet needs a new window (kamu pakai reuse-window). Force new-window buat project ini?', 'Yes', 'No');
    if (go !== 'Yes') return;
  }
  if (!cliAvailable()) {
    await vscode.env.clipboard.writeText(buildCommandString(folder, candidates));
    vscode.window.showErrorMessage("VSCode CLI 'code' not found. Command ke-copy ke clipboard — install code command atau jalanin manual.");
    return;
  }
  launchOptimized(folder, candidates, (msg) => { log.appendLine(msg); log.show(); vscode.window.showErrorMessage(msg); });
  const cmd = buildCommandString(folder, candidates);
  log.appendLine(`folder: ${folder} | stacks: ${stacks.join(',')} | not-running: ${candidates.join(',') || 'none'}`);
  log.appendLine(`launched: ${cmd}`);
  await saveDecision(context.globalState, key, 'optimized');
}

async function maybeNotify(context: vscode.ExtensionContext, log: vscode.OutputChannel): Promise<void> {
  const folder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!folder) return;
  const stacks = detectStack(folder);
  const key = stateKey(folder, stacks);
  if (getDecision(context.globalState, key)) return;
  if (!stacks.length) {
    await saveDecision(context.globalState, key, 'skipped');
    vscode.window.showInformationMessage('Extension Diet: no stack detected, everything stays on.');
    return;
  }
  const candidates = getDisableCandidates(vscode.extensions.all.map(e => e.id), stacks, getPins(context.globalState));
  const pick = await vscode.window.showInformationMessage(
    `Extension Diet: detected ${stacks.join(', ')}, relaunch with ${candidates.length} extensions not running in this window?`,
    'Optimize', 'Skip', 'Never for this repo');
  if (pick === 'Optimize') await runOptimize(context, log, folder, stacks, candidates, key);
  else if (pick === 'Skip') await saveDecision(context.globalState, key, 'skipped');
  else if (pick === 'Never for this repo') await saveDecision(context.globalState, key, 'never');
}

// ponytail: activate nggak boleh mati diam-diam — semua error notif ketangkep + masuk channel.
async function safeNotify(context: vscode.ExtensionContext, log: vscode.OutputChannel): Promise<void> {
  try {
    await maybeNotify(context, log);
  } catch (err: any) {
    log.appendLine(`notify failed: ${err?.message ?? err}`);
    log.show();
  }
}

export function activate(context: vscode.ExtensionContext) {
  const log = vscode.window.createOutputChannel('Extension Diet');
  log.appendLine('Extension Diet activated.');
  context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(() => { void safeNotify(context, log); }));
  context.subscriptions.push(vscode.commands.registerCommand('extensionDiet.showDetection', () => {
    const folder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!folder) {
      vscode.window.showInformationMessage('Extension Diet: no folder open.');
      return;
    }
    const stacks = detectStack(folder);
    if (!stacks.length) {
      vscode.window.showInformationMessage('Extension Diet: no stack detected.');
      return;
    }
    const candidates = getDisableCandidates(vscode.extensions.all.map(e => e.id), stacks, getPins(context.globalState));
    vscode.window.showInformationMessage(
      `Extension Diet: detected ${stacks.join(', ')}, ${candidates.length} would not run in optimized window${candidates.length ? ': ' + candidates.join(', ') : '.'}`);
  }));
  context.subscriptions.push(vscode.commands.registerCommand('extensionDiet.optimizeWorkspace', async () => {
    const folder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!folder) {
      vscode.window.showInformationMessage('Extension Diet: no folder open.');
      return;
    }
    const stacks = detectStack(folder);
    if (!stacks.length) {
      vscode.window.showInformationMessage('Extension Diet: no stack detected.');
      return;
    }
    await runOptimize(context, log, folder, stacks,
      getDisableCandidates(vscode.extensions.all.map(e => e.id), stacks, getPins(context.globalState)), stateKey(folder, stacks));
  }));
  context.subscriptions.push(vscode.commands.registerCommand('extensionDiet.neverDisable', async () => {
    const pinned = new Set(getPins(context.globalState).map(id => id.toLowerCase()));
    const choice = await vscode.window.showQuickPick(
      vscode.extensions.all.map(e => e.id).filter(id => !pinned.has(id.toLowerCase())),
      { placeHolder: 'Extension Diet: never disable which extension?' });
    if (!choice) return;
    await context.globalState.update(PINS_KEY, [...getPins(context.globalState), choice]);
    vscode.window.showInformationMessage(`Extension Diet: ${choice} will always stay on.`);
  }));
  context.subscriptions.push(vscode.commands.registerCommand('extensionDiet.showLog', () => log.show()));
  context.subscriptions.push(vscode.commands.registerCommand('extensionDiet.resetRepoDecision', async () => {
    const folder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!folder) {
      vscode.window.showInformationMessage('Extension Diet: no folder open.');
      return;
    }
    await clearDecision(context.globalState, stateKey(folder, detectStack(folder)));
    vscode.window.showInformationMessage('Extension Diet: repo decision reset. Reopen folder or run Optimize Workspace.');
  }));
  void safeNotify(context, log);
}

export function deactivate() {}
