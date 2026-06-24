/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-41ddd661'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "logo.png",
    "revision": "04361daa1ac37974f19ab0844f35ea32"
  }, {
    "url": "index.html",
    "revision": "c2eb03c984b128e0c3cafda7a9c59bfc"
  }, {
    "url": "icons.svg",
    "revision": "3b4fcfcf393eca4d264dca4a4663bc37"
  }, {
    "url": "favicon.svg",
    "revision": "7e840862161341271697daa99a40d76b"
  }, {
    "url": "favicon.png",
    "revision": "f9c2daa8f78293328a628d729cdd1e32"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "30a50f7a916ae8cd66e9726f9fbed74e"
  }, {
    "url": "icons/icon-512.png",
    "revision": "04361daa1ac37974f19ab0844f35ea32"
  }, {
    "url": "icons/icon-192.png",
    "revision": "597217b22b5dfded2bb40012ed59227f"
  }, {
    "url": "assets/index-DCYV3R0o.css",
    "revision": null
  }, {
    "url": "assets/index-C2jWEPxH.js",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "30a50f7a916ae8cd66e9726f9fbed74e"
  }, {
    "url": "favicon.png",
    "revision": "f9c2daa8f78293328a628d729cdd1e32"
  }, {
    "url": "logo.png",
    "revision": "04361daa1ac37974f19ab0844f35ea32"
  }, {
    "url": "icons/icon-192.png",
    "revision": "597217b22b5dfded2bb40012ed59227f"
  }, {
    "url": "icons/icon-512.png",
    "revision": "04361daa1ac37974f19ab0844f35ea32"
  }, {
    "url": "manifest.webmanifest",
    "revision": "e12212c8d0f350d684e5bc6b445c4f6f"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(({
    url
  }) => url.pathname.includes("/packs/"), new workbox.NetworkFirst({
    "cacheName": "knowledge-packs",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 2592000
    })]
  }), 'GET');

}));
