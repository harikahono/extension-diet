# Extension Diet

![Extension Diet](images/extension-diet.png)

Keep VS Code lightweight per project by preventing irrelevant stack extensions from running in optimized windows.

## What it does

Opening a Laravel repo shouldn't spin up Rust, Flutter, and Python tooling. Extension Diet detects your project stack and relaunches VS Code with unrelated extensions temporarily disabled for that window only.

## Why

VS Code slows down when every language/framework extension runs for every project. Extension Diet gives each project a lean window without touching your global setup.

## How it works

1. Detects stack markers in the opened folder.
2. Computes extensions irrelevant to the detected stacks.
3. Shows a one-time confirmation per repo.
4. Opens a new optimized window via `code --new-window --disable-extension ...`.

Unknown extensions are always kept running. Only exact-match, known-irrelevant extensions are excluded.

## Important limitation

Extensions excluded via CLI flags may **not** appear under the `@disabled` filter — that filter shows persisted disables, not temporary session flags. To verify, use `Developer: Show Running Extensions` in the optimized window.

## Supported stack markers

- `package.json` → Node / React / Vite / Next
- `composer.json` → PHP / Laravel
- `Cargo.toml` or `src-tauri/Cargo.toml` → Rust / Tauri
- `pubspec.yaml` → Flutter / Dart
- `requirements.txt` → Python
- `go.mod` → Go

## Commands

- `Extension Diet: Optimize Workspace`
- `Extension Diet: Show Optimization Result`
- `Extension Diet: Show Detection Result`
- `Extension Diet: Never Disable This`
- `Extension Diet: Reset Repo Decision`
- `Extension Diet: Show Log`

## Development

```bash
npm install
npm run check   # compile + self-check
npm run package # build .vsix
```

## Local install

```bash
code --install-extension extension-diet-0.1.1.vsix --force
```
