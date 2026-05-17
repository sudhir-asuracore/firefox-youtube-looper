[![CI](https://github.com/sudhir-asuracore/firefox-youtube-looper/actions/workflows/ci.yml/badge.svg)](https://github.com/sudhir-asuracore/firefox-youtube-looper/actions/workflows/ci.yml)
[![Release Package](https://github.com/sudhir-asuracore/firefox-youtube-looper/actions/workflows/release.yml/badge.svg)](https://github.com/sudhir-asuracore/firefox-youtube-looper/actions/workflows/release.yml)

# YouTube Section Looper

Loop a segment of any YouTube video directly on the watch page. Set start/end timestamps, choose how many times to repeat, and let it run.

## Features
- Set loop start/end via buttons or manual timestamp entry.
- Repeat a segment infinitely or a fixed number of times.
- Control video playback speed within the loop.
- Loop status shown inline under the video controls.
- Per-video settings persisted locally.

## Installation

### Firefox
1. Open Firefox and go to `about:debugging`.
2. Click **This Firefox**.
3. Click **Load Temporary Add-on...**.
4. Select `manifest.json` from this project.

### Chrome / Edge
1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode** (toggle in the top right).
3. Click **Load unpacked**.
4. Select the project folder.

## Usage
1. Open any YouTube watch page.
2. Click **Looper** next to the Join/Subscribe buttons.
3. Set start and end times, choose a repeat count, and click **Start Loop**.

## Permissions
- `storage`: Save loop settings per video.
- `https://www.youtube.com/*`: Inject the UI and loop logic on YouTube pages.

## Development
- `content-script.js` contains the loop logic and UI injection.
- `background.js` handles browser-level actions like bookmarking.
- `content-style.css` contains the injected UI styles.
- `loop-utils.js` contains shared utilities used by the content script and tests.
- `npm test` runs basic checks.
- `npm run build` packages the extension into `dist/`.

## Release packaging
A GitHub Actions workflow can build a release zip from the extension files. See `.github/workflows/release.yml`.

## Support
If you find this useful, you can support the project:

<a href='https://ko-fi.com/U7U61FUIAB' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi6.png?v=6' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>

## Contributing
Issues and pull requests are welcome. Please describe the change clearly and keep updates focused and minimal.

## License
MIT. See `LICENSE`.
