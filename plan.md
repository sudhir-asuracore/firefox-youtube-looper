# Project Plan

## Milestone 2: Extension Skeleton
- Create `manifest.json` (MV3) with `storage` permission and YouTube host match patterns.
- Add `content-script.js` entry point with safe, idempotent bootstrapping.
- Add a minimal `content-style.css` for future UI hooks.
- Verify the extension loads in Firefox (about:debugging) and content script runs on YouTube.

## Milestone 3: Core Loop Engine
- Add video detection helpers (video id parsing, active video element lookup).
- Implement loop state machine (start/end, enabled, repeat count, remaining loops).
- Enforce looping on `timeupdate` with epsilon to avoid jitter.
- Reset/reload loop state on YouTube SPA navigation or video changes.
- Guard against invalid ranges and missing duration.

## Milestone 4: In-Page UI
- Inject a loop control panel below the video metadata area.
- Provide controls: Set Start, Set End, repeat count input (0 = infinite), Start/Stop, Clear.
- Display current loop status and validation feedback.
- Keep UI in sync with state changes and navigation.

## Milestone 5: Persistence & QA
- Persist loop settings per video id in `storage.local`.
- Restore settings on revisit and update storage on user actions.
- Smoke test on standard watch URLs and Shorts.
- Package and verify in Firefox (about:debugging temporary add-on).
