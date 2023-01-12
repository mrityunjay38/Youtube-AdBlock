/* 
# Monkey patched window.fetch
# Following script will be injected into YouTube content dom at runtime.
*/

((originalFetch) => {
  window.fetch = async (...args) => {
    let response = await originalFetch(...args);
    console.log("fetch args:  ", args);

    const json = () =>
      response
        .clone()
        .json()
        .then((data) => data);

    const text = () =>
      response
        .clone()
        .text()
        .then((data) => data);

    response.json = json;
    response.text = text;
    return response;
  };
})(window.fetch);
