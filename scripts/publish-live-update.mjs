import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const apiBase = process.env.VITE_API_URL || "https://strategylabs-api.fly.dev";
const deploySecret = process.env.DEPLOY_SECRET;

if (!deploySecret) throw new Error("DEPLOY_SECRET is required to publish a live update.");

const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url)));
const zipBytes = await readFile(new URL("../live-update.zip", import.meta.url));
const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
const bundleId = `${packageJson.version}-${stamp}`;
const sha256 = createHash("sha256").update(zipBytes).digest("hex");

const form = new FormData();
form.append("bundle_id", bundleId);
form.append("sha256", sha256);
form.append("file", new Blob([zipBytes], { type: "application/zip" }), "live-update.zip");

const response = await fetch(`${apiBase.replace(/\/$/, "")}/api/v1/updates`, {
  method: "POST",
  headers: { "x-deploy-secret": deploySecret },
  body: form,
});
if (!response.ok) throw new Error(`Update publish failed (${response.status}): ${await response.text()}`);
console.log(`Published live-update bundle ${bundleId}`);
