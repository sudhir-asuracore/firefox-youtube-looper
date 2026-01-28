(() => {
  const clampNumber = (value, min, max) => Math.min(max, Math.max(min, value));

  const formatTime = (value) => {
    if (value == null || Number.isNaN(value)) {
      return "--:--";
    }
    const total = Math.max(0, Math.floor(value));
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  };

  const parseTimeString = (raw) => {
    if (!raw) {
      return null;
    }
    const value = raw.trim();
    if (!value) {
      return null;
    }
    if (/^\d+(\.\d+)?$/.test(value)) {
      const seconds = Number.parseFloat(value);
      return Number.isFinite(seconds) ? seconds : null;
    }
    const parts = value.split(":").map((part) => part.trim());
    if (parts.length < 2 || parts.length > 3) {
      return null;
    }
    const numbers = parts.map((part) => Number.parseInt(part, 10));
    if (numbers.some((num) => !Number.isFinite(num) || num < 0)) {
      return null;
    }
    const [hours, minutes, seconds] =
      numbers.length === 3 ? numbers : [0, numbers[0], numbers[1]];
    if (minutes > 59 || seconds > 59) {
      return null;
    }
    return hours * 3600 + minutes * 60 + seconds;
  };

  const isRangeValid = (start, end) =>
    start != null && end != null && Number.isFinite(start) && Number.isFinite(end) && end > start;

  const utils = {
    clampNumber,
    formatTime,
    parseTimeString,
    isRangeValid,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = utils;
  } else {
    window.YtLooperUtils = utils;
  }
})();
