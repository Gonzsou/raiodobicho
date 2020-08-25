import '@pwabuilder/pwainstall'

let manifest = browser.runtime.getManifest();
console.log(manifest.name);
