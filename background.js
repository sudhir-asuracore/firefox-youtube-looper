const browserApi = typeof browser !== "undefined" ? browser : chrome;

browserApi.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CREATE_BOOKMARK") {
    // First, check if a bookmark with this URL already exists to avoid duplicates
    browserApi.bookmarks.search({ url: message.url }).then(results => {
      if (results && results.length > 0) {
        sendResponse({ success: true, bookmark: results[0], existing: true });
        return;
      }
      return browserApi.bookmarks.create({
        title: message.title,
        url: message.url
      }).then(bookmark => {
        sendResponse({ success: true, bookmark, existing: false });
      });
    }).catch(error => {
      console.error("[yt-looper-bg] Failed to create/search bookmark:", error);
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep message channel open for async
  }

  if (message.type === "CHECK_BOOKMARK") {
    browserApi.bookmarks.search({ url: message.url }).then(results => {
      sendResponse({ exists: results && results.length > 0 });
    }).catch(error => {
      console.error("[yt-looper-bg] Failed to check bookmark:", error);
      sendResponse({ exists: false });
    });
    return true;
  }
});
