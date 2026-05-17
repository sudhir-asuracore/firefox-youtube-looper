# Firefox Add-ons Submission Notes

## Add-on name
YouTube Looper

## Summary (one line)
Loop a selected segment of any YouTube video with optional repeat count.

## Detailed description
YouTube Looper adds a small control panel directly on YouTube watch pages. Set the start and end timestamps (by button or manual entry), choose how many times to repeat, and play the loop automatically. Settings are saved per video so you can return later and continue looping.

## Categories
- Productivity
- Media

## Permissions justification
- `storage`: Used to save loop settings per video (start/end, repeat count, enabled state).
- `https://www.youtube.com/*`: Required to inject the UI and loop logic on YouTube watch pages.

## Data collection
This add-on does not collect, transmit, or sell user data. All settings are stored locally in the browser. See [PRIVACY.md](./PRIVACY.md) for the full privacy policy.

## Support
- GitHub Issues: https://github.com/sudhir-asuracore/firefox-youtube-looper/issues
- Contact email: support-ytlooper@sudhirnakka.com

## Test notes
- Verified on standard YouTube watch pages and Shorts.
- Looping and repeat counts behave as expected.

## Source code
https://github.com/sudhir-asuracore/firefox-youtube-looper
