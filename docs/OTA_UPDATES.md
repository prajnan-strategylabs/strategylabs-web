# Mobile over-the-air updates

Strategy Labs uses `@capawesome/capacitor-live-update` to update the JavaScript
bundle in installed Android/iOS apps. Native-code changes, Capacitor plugin
changes, permission changes, and store-required changes still need a normal
store release.

## How it works

1. The native app calls `LiveUpdate.ready()` immediately during its custom
   splash screen, which marks the active bundle as safe before any network I/O.
2. It fetches `GET /api/v1/updates/latest` with a six-second timeout.
3. When the returned bundle ID differs from the active bundle, it downloads the
   immutable ZIP from R2, activates it for the next launch, and restarts.
4. If the manifest or download fails, the app continues with its current bundle.

The ZIP itself is stored at `updates/strategylabs/<bundle-id>.zip` in R2, with a
one-year immutable cache policy. The API reads a small `latest.json` manifest
from R2 and returns it with `Cache-Control: no-store`. Fly local storage is not
used for either file.

## One-time production setup

Set the following Fly secrets on `strategylabs-api`. The existing R2 credentials
and `R2_PUBLIC_URL` must point to a bucket/custom domain that can serve public
objects.

```powershell
fly secrets set LIVE_UPDATE_DEPLOY_SECRET="<long-random-secret>" `
  LIVE_UPDATE_R2_BUCKET_NAME="<optional-separate-r2-bucket>" `
  -a strategylabs-api
```

Leave `LIVE_UPDATE_R2_BUCKET_NAME` blank to reuse `R2_BUCKET_NAME`. Keep the
deploy secret outside all `VITE_` variables. Put the same value in the local
shell as `DEPLOY_SECRET` before publishing.

## Publish a web-bundle update

```powershell
$env:DEPLOY_SECRET = "<same-long-random-secret>"
npm run publish:ota
```

This builds `dist/`, zips it, calculates a SHA-256 checksum, uploads through the
authenticated API, then promotes the new manifest. The generated ZIP is ignored
by Git. Deploy the API before publishing the first bundle.

## Initial store release

The updater plugin has been synced into Android. Build and ship one ordinary
native release after merging this work; older app installs do not contain the
plugin and cannot receive OTA bundles.
