/* 
Monkey patched window.fetch
Following script will be injected into YouTube content dom at runtime.

As per YouTube API calls < https://www.youtube.com/youtubei/v1/player/* >,
seems to be holding all the advertisment related configurations.

Params: ["adPlacements", "playerAds"]

Removing these shall interrupt short video advertisment previews that appear
before an actual video that user is trying to stream/play.

---------------------------------------------------------------------------------------

var ytInitialPlayerResponse = {}
https://www.youtube.com/watch?v=nbxxywixxehirwr initially return HTML containing ytInitialPlayerResponse already defined.
Overidding this using Object.setter method to remove advertisement config ex: adPlacements, playerAds.

*/

const stringReplacementMap = {
  adPlacements: "adPlacementRemoved",
  playerAds: "playerAdsRemoved",
};

/* Monkey patch window.fetch */
((originalFetch) => {
  const targetUrl = "/youtubei/v1/player";

  window.fetch = async (...args) => {
    let response = await originalFetch(...args);
    const { url } = response;

    if (!url?.includes(targetUrl)) {
      return response;
    }

    /* Modifying both json() as well text() response methods to be double sure */
    const json = () =>
      response
        .clone()
        .json()
        .then((data) => ({ ...data, adPlacements: [], playerAds: [] }));

    const text = () =>
      response
        .clone()
        .text()
        .then((data) =>
          data.replace(/adPlacements|playerAds/gi, (substring) => {
            return stringReplacementMap[substring];
          })
        );

    response.json = json;
    response.text = text;
    return response;
  };
})(window.fetch);

/* Monkey patch XMLHttpRequest */
((XHR) => {
  const mySend = XHR.send;
  const myOpen = XHR.open;
  XHR.open = function theOpen(...args) {
    if (args.length > 1) {
      [, this.url] = args;
    } else {
      this.url = "";
    }
    return myOpen.apply(this, args);
  };
  XHR.send = function theSend(...args) {
    if (this.url.includes("youtubei/v1/player" || "/watch?=")) {
      this.addEventListener("load", function eventHandler() {
        try {
          this.response = this.response.replace(
            /adPlacements|playerAds/gi,
            (substring) => {
              return stringReplacementMap[substring];
            }
          );
        } catch (err) {
          console.log("err", err);
        }
      });
    }
    return mySend.apply(this, args);
  };
})(window.XMLHttpRequest.prototype);

/* Monkey patch Object getter/setter */
((window) => {
  let currentDescriptor = Object.getOwnPropertyDescriptor(
    window,
    "ytInitialPlayerResponse"
  );
  let ytInitialPlayerResponseWrapped;

  if (!currentDescriptor) {
    currentDescriptor = {
      configurable: true,
      get() {
        return ytInitialPlayerResponseWrapped;
      },
      set(newValue) {
        newValue = { ...newValue, adPlacements: [], playerAds: [] };
        ytInitialPlayerResponseWrapped = newValue;
      },
    };
  }
  Object.defineProperty(window, "ytInitialPlayerResponse", currentDescriptor);
})(window);
