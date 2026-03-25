# YouTube Section Looper (Firefox) Project Context

## Overview
A Firefox extension (Manifest V3) that adds a loop control panel to YouTube watch pages and Shorts. It allows users to set start/end timestamps and repeat count (including infinite loop) for specific video segments.

## Core Components
- **manifest.json**: Configures the extension, permissions (`storage`), and content scripts.
- **content-script.js**: Main logic for UI injection, video state monitoring, and loop enforcement.
- **loop-utils.js**: Shared utility functions for time formatting and parsing.
- **content-style.css**: Styles for the injected UI.

## Key Logic
- **Bootstrapping**: Injected on YouTube pages (`document_idle`), ensures idempotency via `window.__ytLooperInjected`.
- **State Persistence**: Uses `browser.storage.local` to save `start`, `end`, `repeatCount`, and `enabled` state per video ID.
- **Loop Enforcement**: Monitors video `timeupdate` to seek back to `start` when `end` is reached, decrementing `remaining` repeat count if applicable.
- **UI Injection**: Inserts a control panel below the video metadata area (currently targeting `#owner` element).

## Development & Testing
- **Build Script**: `scripts/build.sh` packages the extension into `dist/`.
- **Version Bumping**: `scripts/bump-version.js` updates version in `manifest.json`. Triggered via `npm run bump:<type>`.
- **Testing**: Basic tests in `tests/utils.test.js` verified via `scripts/test.sh`. Uses Node.js `assert`.
- **Icons**: SVG source and various PNG sizes in `icons/`.

## CI/CD
- **GitHub Actions**:
  - `ci.yml`: Runs tests and basic checks.
  - `release.yml`: Automates version bumping, tagging, and creating GitHub releases with packaged zip.

## Important Findings
- SPA navigation (YouTube's internal navigation) is handled by monitoring video changes or URL changes (implemented via polling or event listeners in `content-script.js`).
- Targeted UI location is `#owner` on YouTube watch pages.
- Minimum Firefox version or specific Gecko settings are defined in `manifest.json`.
