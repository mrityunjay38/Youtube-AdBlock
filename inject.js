/* 
Monkey patched window.fetch
Following script will be injected into YouTube content dom at runtime.

As per YouTube API calls < https://www.youtube.com/youtubei/v1/player/* >,
seems to be holding all the advertisment related configurations.

Params: ["adPlacements", "playerAds"]

Removing these shall interrupt short video advertisment previews that appear
before an actual video that user is trying to stream/play.
*/

((originalFetch) => {
  window.fetch = async (...args) => {
    let response = await originalFetch(...args);
    const stringReplacementMap = {
      adPlacements: "adPlacementRemoved",
      playerAds: "playerAdsRemoved",
    };

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
