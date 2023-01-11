/* Entry content script */
console.log("Executing content script!");

const injectableScript = document.createElement("script");
injectableScript.src = chrome.runtime.getURL("inject.js");

try {
  (document.body || document.head || document.documentElement).appendChild(
    injectableScript
  );
} catch (err) {
  console.log(err);
}
