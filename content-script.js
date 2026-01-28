(() => {
  const FLAG = "__ytLooperInjected";
  if (window[FLAG]) {
    return;
  }
  window[FLAG] = true;

  const logPrefix = "[yt-looper]";
  const utils = window.YtLooperUtils;
  if (!utils) {
    console.warn(logPrefix, "utils missing; aborting");
    return;
  }
  const { clampNumber, formatTime, parseTimeString, isRangeValid } = utils;
  const extensionVersion = (() => {
    const runtime = typeof browser !== "undefined" ? browser.runtime : chrome?.runtime;
    return runtime?.getManifest ? runtime.getManifest().version : "";
  })();

  const storageApi = (() => {
    const api = typeof browser !== "undefined" ? browser.storage : chrome?.storage;
    if (!api?.local) {
      return null;
    }

    const get = (key) => {
      const result = api.local.get(key);
      if (result && typeof result.then === "function") {
        return result.then((items) => items[key]);
      }
      return new Promise((resolve) => {
        api.local.get(key, (items) => resolve(items[key]));
      });
    };

    const set = (key, value) => {
      const payload = { [key]: value };
      const result = api.local.set(payload);
      if (result && typeof result.then === "function") {
        return result;
      }
      return new Promise((resolve) => {
        api.local.set(payload, () => resolve());
      });
    };

    return { get, set };
  })();

  const state = {
    videoId: null,
    videoEl: null,
    start: null,
    end: null,
    repeatCount: 0,
    remaining: null,
    enabled: false,
    ui: null,
  };

  const getVideoIdFromUrl = () => {
    const url = new URL(window.location.href);
    const idFromParam = url.searchParams.get("v");
    if (idFromParam) {
      return idFromParam;
    }
    if (url.pathname.startsWith("/shorts/")) {
      const parts = url.pathname.split("/");
      return parts[2] || null;
    }
    return null;
  };

  const getVideoEl = () =>
    document.querySelector("ytd-player video, video.html5-main-video, video");

  const getButtonsRow = () =>
      document.querySelector("#owner");
    // document.querySelector("ytd-watch-metadata #top-level-buttons-computed")
    //   || document.querySelector("#top-level-buttons-computed")
    //   || document.querySelector("ytd-menu-renderer #top-level-buttons-computed");

  const storageKey = (videoId) => `ytLooper:${videoId}`;

  const loadState = async (videoId) => {
    if (!storageApi || !videoId) {
      return;
    }
    const saved = await storageApi.get(storageKey(videoId));
    if (!saved) {
      return;
    }
    state.start = Number.isFinite(saved.start) ? saved.start : null;
    state.end = Number.isFinite(saved.end) ? saved.end : null;
    state.repeatCount = Number.isFinite(saved.repeatCount) ? saved.repeatCount : 0;
    state.enabled = Boolean(saved.enabled) && isRangeValid(state.start, state.end);
    state.remaining = state.enabled
      ? (state.repeatCount === 0 ? Infinity : state.repeatCount)
      : null;
  };

  const persistState = async () => {
    if (!storageApi || !state.videoId) {
      return;
    }
    await storageApi.set(storageKey(state.videoId), {
      start: state.start,
      end: state.end,
      repeatCount: state.repeatCount,
      enabled: state.enabled,
    });
  };

  const updateStatus = (message, isError = false) => {
    if (!state.ui) {
      return;
    }
    state.ui.status.textContent = message;
    state.ui.status.dataset.error = isError ? "1" : "0";
  };

  const syncUi = () => {
    if (!state.ui) {
      return;
    }
    if (state.ui.startInput.dataset.editing !== "1") {
      state.ui.startInput.value = formatTime(state.start);
    }
    if (state.ui.endInput.dataset.editing !== "1") {
      state.ui.endInput.value = formatTime(state.end);
    }
    state.ui.repeatInput.value = String(state.repeatCount);
    state.ui.toggleButton.textContent = state.enabled ? "Stop Loop" : "Start Loop";
    state.ui.toggleButton.dataset.active = state.enabled ? "1" : "0";
    state.ui.toggleButton.disabled = !isRangeValid(state.start, state.end);
    const status = state.enabled
      ? `Looping ${formatTime(state.start)} - ${formatTime(state.end)}`
      : "Loop idle";
    updateStatus(status, false);
  };

  const setLoopEnabled = (enabled) => {
    if (!enabled) {
      state.enabled = false;
      state.remaining = null;
      if (state.videoEl) {
        state.videoEl.pause();
      }
      updateStatus("Loop paused.", false);
      syncUi();
      void persistState();
      return;
    }
    if (!isRangeValid(state.start, state.end)) {
      state.enabled = false;
      state.remaining = null;
      updateStatus("Set start and end before looping.", true);
      syncUi();
      return;
    }
    state.enabled = enabled;
    state.remaining = enabled
      ? (state.repeatCount === 0 ? Infinity : state.repeatCount)
      : null;
    if (enabled && state.videoEl) {
      state.videoEl.currentTime = state.start;
      const playPromise = state.videoEl.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    }
    syncUi();
    void persistState();
  };

  const handleTimeUpdate = () => {
    if (!state.enabled || !state.videoEl) {
      return;
    }
    const { currentTime, duration } = state.videoEl;
    if (!Number.isFinite(duration) || duration <= 0) {
      return;
    }
    const start = clampNumber(state.start ?? 0, 0, duration);
    const end = clampNumber(state.end ?? duration, 0, duration);
    if (!isRangeValid(start, end)) {
      return;
    }
    const epsilon = 0.05;
    if (currentTime >= end - epsilon) {
      if (state.remaining === Infinity) {
        state.videoEl.currentTime = start;
        return;
      }
      if (typeof state.remaining === "number") {
        if (state.remaining > 0) {
          state.remaining -= 1;
          state.videoEl.currentTime = start;
          updateStatus(
            state.remaining > 0
              ? `Looping (${state.remaining} left)`
              : "Looping (last pass)",
            false
          );
          return;
        }
        state.enabled = false;
        state.remaining = null;
        state.videoEl.pause();
        updateStatus("Loop complete.", false);
        syncUi();
        void persistState();
      }
    }
  };

  const ensureVideoListeners = () => {
    const video = getVideoEl();
    if (!video || video === state.videoEl) {
      return;
    }
    if (state.videoEl) {
      state.videoEl.removeEventListener("timeupdate", handleTimeUpdate);
    }
    state.videoEl = video;
    state.videoEl.addEventListener("timeupdate", handleTimeUpdate);
  };

  const buildUi = () => {
    const panel = document.createElement("section");
    panel.id = "yt-looper-panel";
    panel.innerHTML = `
      <div class="yt-looper-row yt-looper-row-main">
        <div class="yt-looper-section">
          <span class="yt-looper-title">Looper</span>
        </div>
        <div class="yt-looper-divider" aria-hidden="true"></div>
        <div class="yt-looper-section">
          <button class="yt-looper-btn" data-action="set-start">Set Start</button>
          <input class="yt-looper-time" data-role="start" type="text" inputmode="numeric" placeholder="mm:ss" />
          <button class="yt-looper-btn" data-action="set-end">Set End</button>
          <input class="yt-looper-time" data-role="end" type="text" inputmode="numeric" placeholder="mm:ss" />
        </div>
        <div class="yt-looper-divider" aria-hidden="true"></div>
        <div class="yt-looper-section">
          <label class="yt-looper-label">Repeat</label>
          <input class="yt-looper-input" type="number" min="0" step="1" value="0" />
          <span class="yt-looper-hint">0 = infinite</span>
        </div>
        <div class="yt-looper-divider" aria-hidden="true"></div>
        <div class="yt-looper-section">
          <button class="yt-looper-btn yt-looper-primary" data-action="toggle">Start Loop</button>
          <button class="yt-looper-btn yt-looper-secondary" data-action="clear">Clear</button>
        </div>
        <div class="yt-looper-divider" aria-hidden="true"></div>
        <div class="yt-looper-section yt-looper-section-status">
          <span class="yt-looper-status" data-error="0">Loop idle</span>
        </div>
        <div class="yt-looper-divider" aria-hidden="true"></div>
        <div class="yt-looper-section yt-looper-section-kofi">
          <a
            class="yt-looper-kofi"
            href="https://ko-fi.com/U7U61FUIAB"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://storage.ko-fi.com/cdn/kofi6.png?v=6"
              height="36"
              alt="Buy Me a Coffee at ko-fi.com"
            />
          </a>
        </div>
        <div class="yt-looper-version" data-role="version"></div>
      </div>
    `;

    const startBtn = panel.querySelector("[data-action='set-start']");
    const endBtn = panel.querySelector("[data-action='set-end']");
    const toggleBtn = panel.querySelector("[data-action='toggle']");
    const clearBtn = panel.querySelector("[data-action='clear']");
    const repeatInput = panel.querySelector(".yt-looper-input");
    const status = panel.querySelector(".yt-looper-status");
    const startInput = panel.querySelector("[data-role='start']");
    const endInput = panel.querySelector("[data-role='end']");

    startBtn.addEventListener("click", () => {
      if (!state.videoEl) {
        updateStatus("Video not ready.", true);
        return;
      }
      state.start = state.videoEl.currentTime;
      if (state.end != null && state.start >= state.end) {
        state.end = null;
        updateStatus("Start must be before end.", true);
      }
      syncUi();
      void persistState();
    });

    endBtn.addEventListener("click", () => {
      if (!state.videoEl) {
        updateStatus("Video not ready.", true);
        return;
      }
      state.end = state.videoEl.currentTime;
      if (state.start != null && state.end <= state.start) {
        state.start = null;
        updateStatus("End must be after start.", true);
      }
      syncUi();
      void persistState();
    });

    repeatInput.addEventListener("change", () => {
      const parsed = Number.parseInt(repeatInput.value, 10);
      state.repeatCount = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
      repeatInput.value = String(state.repeatCount);
      if (state.enabled) {
        state.remaining = state.repeatCount === 0 ? Infinity : state.repeatCount;
      }
      syncUi();
      void persistState();
    });

    const wireTimeInput = (input, type) => {
      input.addEventListener("focus", () => {
        input.dataset.editing = "1";
      });
      input.addEventListener("blur", () => {
        input.dataset.editing = "0";
        const parsed = parseTimeString(input.value);
        if (parsed == null) {
          updateStatus("Enter time as mm:ss or hh:mm:ss.", true);
          syncUi();
          return;
        }
        if (type === "start") {
          state.start = parsed;
          if (state.end != null && state.start >= state.end) {
            state.end = null;
            updateStatus("Start must be before end.", true);
          }
        } else {
          state.end = parsed;
          if (state.start != null && state.end <= state.start) {
            state.start = null;
            updateStatus("End must be after start.", true);
          }
        }
        syncUi();
        void persistState();
      });
    };

    wireTimeInput(startInput, "start");
    wireTimeInput(endInput, "end");

    toggleBtn.addEventListener("click", () => {
      setLoopEnabled(!state.enabled);
    });

    clearBtn.addEventListener("click", () => {
      state.start = null;
      state.end = null;
      state.enabled = false;
      state.remaining = null;
      syncUi();
      void persistState();
    });

    state.ui = {
      panel,
      startInput,
      endInput,
      repeatInput,
      toggleButton: toggleBtn,
      status,
      wrapper: null,
      versionEl: panel.querySelector("[data-role='version']"),
    };

    if (state.ui.versionEl && extensionVersion) {
      state.ui.versionEl.textContent = `v${extensionVersion}`;
    }

    return panel;
  };

  const ensureUi = () => {
    const buttonsRow = getButtonsRow();
    if (!buttonsRow) {
      return;
    }

    let toggle = document.querySelector("#yt-looper-toggle");
    if (!toggle) {
      toggle = document.createElement("button");
      toggle.id = "yt-looper-toggle";
      toggle.type = "button";
      toggle.className = "yt-looper-toggle yt-looper-btn";
      toggle.textContent = "Looper";
      toggle.addEventListener("click", () => {
        if (!state.ui) {
          const panel = buildUi();
          const wrapper = document.createElement("div");
          wrapper.id = "yt-looper-wrapper";
          wrapper.append(panel);
          buttonsRow.parentElement?.insertAdjacentElement("afterend", wrapper);
          state.ui.wrapper = wrapper;
          syncUi();
          return;
        }
        const wrapper = state.ui.wrapper;
        if (wrapper) {
          const isHidden = wrapper.dataset.hidden === "1";
          wrapper.dataset.hidden = isHidden ? "0" : "1";
        }
      });
      buttonsRow.appendChild(toggle);
    }

  };

  const setupForPage = async () => {
    const nextId = getVideoIdFromUrl();
    if (nextId && nextId !== state.videoId) {
      state.videoId = nextId;
      state.start = null;
      state.end = null;
      state.enabled = false;
      state.remaining = null;
      await loadState(nextId);
    }
    ensureVideoListeners();
    ensureUi();
    syncUi();
  };

  const onReady = () => {
    console.debug(logPrefix, "content script loaded");
    void setupForPage();

    let lastUrl = window.location.href;
    setInterval(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        void setupForPage();
      }
      ensureVideoListeners();
      ensureUi();
    }, 1000);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady, { once: true });
  } else {
    onReady();
  }
})();
