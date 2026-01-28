const assert = require("assert");
const utils = require("../loop-utils");

const { clampNumber, formatTime, parseTimeString, isRangeValid } = utils;

assert.strictEqual(formatTime(null), "--:--");
assert.strictEqual(formatTime(NaN), "--:--");
assert.strictEqual(formatTime(0), "0:00");
assert.strictEqual(formatTime(61), "1:01");
assert.strictEqual(formatTime(3601), "60:01");

assert.strictEqual(parseTimeString(""), null);
assert.strictEqual(parseTimeString("  "), null);
assert.strictEqual(parseTimeString("90"), 90);
assert.strictEqual(parseTimeString("2:03"), 123);
assert.strictEqual(parseTimeString("01:02:03"), 3723);
assert.strictEqual(parseTimeString("99:99"), null);
assert.strictEqual(parseTimeString("abc"), null);
assert.strictEqual(parseTimeString("1:2:3:4"), null);

assert.strictEqual(clampNumber(5, 0, 3), 3);
assert.strictEqual(clampNumber(-1, 0, 3), 0);
assert.strictEqual(clampNumber(2, 0, 3), 2);

assert.strictEqual(isRangeValid(1, 2), true);
assert.strictEqual(isRangeValid(2, 1), false);
assert.strictEqual(isRangeValid(null, 2), false);
assert.strictEqual(isRangeValid(1, null), false);

console.log("utils tests passed");
