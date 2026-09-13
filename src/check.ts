import * as assert from 'assert';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { detectStack } from './detect';
import { getDisableCandidates } from './mapping';
import { stateKey } from './store';
import { buildCommandString, buildRelaunchArgs, isReuseMode } from './relaunch';

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'extdiet-'));
const touch = (dir: string, f: string) => { fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, f), '{}'); };

for (const [marker, stack] of Object.entries({ 'composer.json': 'php', 'package.json': 'node', 'Cargo.toml': 'rust', 'pubspec.yaml': 'flutter', 'requirements.txt': 'python', 'go.mod': 'go' })) {
  const d = tmp(); touch(d, marker);
  assert.deepStrictEqual(detectStack(d), [stack], marker);
}
const multi = tmp(); touch(multi, 'composer.json'); touch(multi, 'package.json');
assert.deepStrictEqual(detectStack(multi), ['php', 'node']);
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
console.log('pin check: OK');
