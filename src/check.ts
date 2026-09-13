import * as assert from 'assert';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { detectStack } from './detect';
import { getDisableCandidates, getOptimizationPlan } from './mapping';
import { stateKey } from './store';
import { buildCommandString, buildRelaunchArgs, isReuseMode } from './relaunch';

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'extdiet-'));
const touch = (dir: string, f: string) => {
  const file = path.join(dir, f);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, '{}');
};

for (const [marker, stack] of Object.entries({ 'composer.json': 'php', 'package.json': 'node', 'Cargo.toml': 'rust', 'pubspec.yaml': 'flutter', 'requirements.txt': 'python', 'go.mod': 'go' })) {
  const d = tmp(); touch(d, marker);
  assert.deepStrictEqual(detectStack(d), [stack], marker);
}
const multi = tmp(); touch(multi, 'composer.json'); touch(multi, 'package.json');
assert.deepStrictEqual(detectStack(multi), ['php', 'node']);
const tauri = tmp(); touch(tauri, 'package.json'); touch(tauri, 'src-tauri/Cargo.toml');
assert.deepStrictEqual(detectStack(tauri), ['node', 'rust']);
const mono = tmp(); touch(mono, 'backend/package.json'); touch(mono, 'frontend/package.json');
assert.deepStrictEqual(detectStack(mono), ['node']);
const skipped = tmp(); touch(skipped, 'node_modules/package.json'); touch(skipped, 'dist/package.json');
assert.deepStrictEqual(detectStack(skipped), []);
const rn = tmp(); touch(rn, 'app.json'); touch(rn, 'metro.config.js');
assert.deepStrictEqual(detectStack(rn), ['node']);
assert.deepStrictEqual(detectStack(tmp()), []);
console.log('detect check: OK');

assert.deepStrictEqual(
  getDisableCandidates(['rust-lang.rust-analyzer', 'eamodio.gitlens', 'esbenp.prettier-vscode', 'ms-python.python'], ['php']),
  ['rust-lang.rust-analyzer', 'ms-python.python']);
assert.deepStrictEqual(
  getDisableCandidates(['bradlc.vscode-tailwindcss', 'rust-lang.rust-analyzer'], ['php', 'node']),
  ['rust-lang.rust-analyzer']);
assert.deepStrictEqual(
  getDisableCandidates(['dracula-theme.theme-dracula', 'pkief.material-icon-theme', 'rust-lang.rust-analyzer'], ['rust']), []);
assert.deepStrictEqual(getDisableCandidates(['some.unknown-ext'], ['php']), []);
console.log('mapping check: OK');

const k1 = stateKey('/repo/a', ['php', 'node']);
assert.strictEqual(stateKey('/repo/a', ['node', 'php']), k1);
assert.notStrictEqual(stateKey('/repo/a', ['php']), k1);
assert.notStrictEqual(stateKey('/repo/b', ['php', 'node']), k1);
assert.strictEqual(stateKey('/REPO/A', ['php', 'node']), k1);
assert.strictEqual(stateKey('\\repo\\a', ['php', 'node']), k1);
console.log('store check: OK');

assert.deepStrictEqual(
  buildRelaunchArgs('/repo/a', ['rust-lang.rust-analyzer', 'golang.go']),
  ['--new-window', '--disable-extension', 'rust-lang.rust-analyzer', '--disable-extension', 'golang.go', '/repo/a']);
assert.strictEqual(
  buildCommandString('/repo/a', ['Dart-Code.Dart-Code']),
  'code --new-window --disable-extension dart-code.dart-code /repo/a');
assert.strictEqual(
  buildCommandString('/my repo/a', ['rust-lang.rust-analyzer']),
  'code --new-window --disable-extension rust-lang.rust-analyzer "/my repo/a"');
assert.strictEqual(isReuseMode('off'), true);
assert.strictEqual(isReuseMode('default'), false);
assert.strictEqual(isReuseMode('on'), false);
assert.strictEqual(isReuseMode(undefined), false);
console.log('relaunch check: OK');

assert.deepStrictEqual(
  getDisableCandidates(['rust-lang.rust-analyzer', 'golang.go'], ['php'], ['Rust-Lang.Rust-Analyzer']),
  ['golang.go']);
assert.deepStrictEqual(
  getDisableCandidates(['msjsdiag.vscode-react-native', 'rust-lang.rust-analyzer'], ['php']),
  ['msjsdiag.vscode-react-native', 'rust-lang.rust-analyzer']);
assert.deepStrictEqual(
  getDisableCandidates(['msjsdiag.vscode-react-native'], ['node']), []);
console.log('pin check: OK');

const plan = getOptimizationPlan(
  ['rust-lang.rust-analyzer', 'dart-code.flutter', 'esbenp.prettier-vscode', 'some.unknown-ext'],
  ['node', 'rust'], ['esbenp.prettier-vscode']);
assert.deepStrictEqual(plan.notRunning.map(e => e.id), ['dart-code.flutter']);
assert.strictEqual(plan.notRunning[0].label, 'Flutter');
assert.deepStrictEqual(plan.keptByStack.map(e => e.id), ['rust-lang.rust-analyzer']);
assert.deepStrictEqual(plan.keptPinned.map(e => e.id), ['esbenp.prettier-vscode']);
assert.deepStrictEqual(plan.keptAlways.map(e => e.id), []);
assert.deepStrictEqual(plan.unknownKept.map(e => e.id), ['some.unknown-ext']);
console.log('plan check: OK');

const sangar = getOptimizationPlan(
  ['onecentlin.laravel-blade', 'junstyle.php-cs-fixer', 'charliermarsh.ruff', 'ms-python.black-formatter',
   'vadimcn.vscode-lldb', 'serayuzgur.crates', 'felixangelov.bloc', 'christian-kohler.npm-intellisense',
   'wix.vscode-import-cost', 'svelte.svelte-vscode', 'astro-build.astro-vscode', 'ms-toolsai.jupyter'],
  ['php']);
assert.strictEqual(sangar.notRunning.length, 10);
assert.deepStrictEqual(sangar.keptByStack.map(e => e.id), ['onecentlin.laravel-blade', 'junstyle.php-cs-fixer']);
console.log('mapping-research check: OK');
