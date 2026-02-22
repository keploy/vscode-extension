# Keploy VS Code Extension

Keploy is a Visual Studio Code extension that integrates the Keploy testing platform directly into your development workflow.

It enables developers to record real API interactions, generate test cases, replay them deterministically, and manage test configurations — all without leaving the IDE.

> **Supported Languages:** Go, Node.js, Python, and Java
---

## 🚀 Features

- Record and Replay Test Cases  
- View Previous Test Run Results  
- View and Edit Keploy Configuration Files  
---

## 🧭 Who Is This Extension For?

This extension is ideal for:

- Backend developers building APIs  
- Microservice-based applications  
- Teams practicing test-driven development  
- Developers who want to auto-generate and replay API tests  
---

## 🔄 Typical Workflow

1. Install the Keploy CLI.
2. Run your backend service locally.
3. Use the extension to record API traffic.
4. Replay captured test cases inside the IDE.
5. View previous test run results.
6. Modify and manage Keploy configuration directly from VS Code.
---

## 📦 Installation

1. Install the Keploy extension from the VS Code Marketplace.

2. Install the Keploy CLI:
```bash
curl --silent -O -L https://keploy.io/install.sh && source install.sh
```
---
## 🤝 Contribution Guide

### Start in development mode

1. Run `npm install` to install dependencies.
2. Press `F5` to open a new window with your extension loaded.
3. Set breakpoints in `src/extension.ts` to debug.
4. View logs in the debug console.
### Make changes to Frontend

1. Run `npm run rollup` to compile Svelte files.
2. Changes auto-compile to `out/compiled`.
3. Reload VS Code window using `Ctrl + R` (or `Cmd + R` on Mac).
4. Open Command Palette and run `Developer: Open Webview Developer Tools` for debugging.

### Make changes to Extension Logic

1. Relaunch extension from debug toolbar after editing `src/extension.ts`.
2. Reload VS Code window to apply updates.
3. `package.json` defines extension metadata and commands.
4. `src/extension.ts` contains command registration inside the `activate` function. now
