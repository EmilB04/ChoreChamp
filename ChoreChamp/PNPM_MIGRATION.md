# pnpm Migration Guide

This project now uses **pnpm** as the package manager instead of npm.

## Why pnpm?

- Faster installation times
- More efficient disk space usage (content-addressable storage)
- Stricter dependency resolution
- Better monorepo support

## Installation

If you don't have pnpm installed, install it globally:

```bash
npm install -g pnpm
# or
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

## Common Commands

### Install dependencies
```bash
pnpm install
```

### Add a new dependency
```bash
pnpm add <package-name>
pnpm add -D <package-name>  # for dev dependencies
```

### Remove a dependency
```bash
pnpm remove <package-name>
```

### Run scripts
```bash
pnpm start
pnpm run android
pnpm run ios
pnpm run web
pnpm run lint
pnpm run build
```

### Update dependencies
```bash
pnpm update
pnpm update <package-name>
```

## Migration Changes

- ✅ Removed `package-lock.json` files
- ✅ Created `pnpm-lock.yaml`
- ✅ Added `.npmrc` to enforce pnpm usage
- ✅ Updated `.gitignore` to exclude npm/yarn lock files
- ✅ Added `engines` and `packageManager` fields to `package.json`

## Preventing npm/yarn Usage

The project is configured to prevent accidental use of npm or yarn:

- `package.json` has `engines` field that rejects npm/yarn
- `.npmrc` has `engine-strict=true`
- If someone tries to use npm/yarn, they'll get an error message

## For Team Members

Please ensure you have pnpm installed before working on this project. If you accidentally use npm or yarn, you'll need to:

1. Delete `node_modules/`
2. Delete `package-lock.json` or `yarn.lock` if created
3. Run `pnpm install`
