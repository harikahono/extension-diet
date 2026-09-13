import { createHash } from 'node:crypto';
import type * as vscode from 'vscode';

// ponytail: key = hash(folder + stacks). Stack berubah = key beda = notif lagi. Tanpa migrasi state.
export type Decision = 'optimized' | 'skipped' | 'never';

export function stateKey(folderPath: string, stacks: string[]): string {
  const normalized = folderPath.toLowerCase().replace(/\\/g, '/');
  return 'extdiet:' + createHash('sha1').update(normalized + '|' + [...stacks].sort().join(',')).digest('hex').slice(0, 16);
}

export function getDecision(store: vscode.Memento, key: string): Decision | undefined {
  return store.get<Decision>(key);
}

export function saveDecision(store: vscode.Memento, key: string, decision: Decision): Thenable<void> {
  return store.update(key, decision);
}

export function clearDecision(store: vscode.Memento, key: string): Thenable<void> {
  return store.update(key, undefined);
}
