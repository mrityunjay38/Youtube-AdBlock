# Youtube-AdBlock

A simple chrome extension to block Youtube video ads previews for personal usage, since a third-party extension may or may not be prone to attackers and exploits.

Chrome extension MV3 reference link: https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/

Note: Currently, only when https://www.youtube.com is visited first. Unable to block advertisment previews for direct URL load/refresh with path "/watch?v=:id" pattern.

Possible cause, delayed script even on "document_start" injection/execution.