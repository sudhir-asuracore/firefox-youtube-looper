#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const releaseType = process.argv[2];
if (!releaseType || !["patch", "minor", "major"].includes(releaseType)) {
  console.error("Usage: node scripts/bump-version.js <patch|minor|major>");
  process.exit(1);
}

const manifestPath = path.join(__dirname, "..", "manifest.json");
const raw = fs.readFileSync(manifestPath, "utf8");
const data = JSON.parse(raw);
const version = data.version || "0.0.0";
const parts = version.split(".");
if (parts.length !== 3 || !parts.every((part) => /^\d+$/.test(part))) {
  console.error(`Invalid version in manifest.json: ${version}`);
  process.exit(1);
}

let [major, minor, patch] = parts.map((part) => Number.parseInt(part, 10));
if (releaseType === "major") {
  major += 1;
  minor = 0;
  patch = 0;
} else if (releaseType === "minor") {
  minor += 1;
  patch = 0;
} else {
  patch += 1;
}

const newVersion = `${major}.${minor}.${patch}`;
data.version = newVersion;
fs.writeFileSync(manifestPath, JSON.stringify(data, null, 2) + "\n");
console.log(newVersion);
