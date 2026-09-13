# Extension Diet

Bikin VSCode lebih ringan per project — extension yang nggak relevan nggak ikut running di optimized window.

## Dev

```bash
npm install
npm run check   # compile + self-check (detect, mapping, store, relaunch, pin)
```

F5 di VSCode → Extension Development Host → buka folder project → notif muncul.

## Coba manual (2 stack)

1. Folder ada `composer.json` + extension Rust/Python nyala → notif "detected php, 2 would not run".
2. Klik Optimize → window baru kebuka, rust-analyzer + python tidak running di window itu.
3. Buka ulang folder sama → hening (state kesimpen).
4. Command "Never Disable This" → pin extension, nggak pernah masuk daftar target.
5. Cek via `Developer: Show Running Extensions`, bukan filter `@disabled`.

## Commands

- `Extension Diet: Optimize Workspace`
- `Extension Diet: Show Detection Result`
- `Extension Diet: Never Disable This`
- `Extension Diet: Reset Repo Decision`
- `Extension Diet: Show Log`
