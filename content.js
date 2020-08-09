// To change the content of the context menu dynamically for
//  incognito and normal windwows, we update the context menu
//  the first time when the page is loaded
//
// But with that alone, when you for example go to a normal tab
//  immediately after visiting an incognito window, the context menu
//  won't be updated
//
// To solve that, we add an event listener to trigger on focus and
//  update the context menu whenever a new tab gets into focus
//
// This solves a sub set of a general problem of setting dynamic content
//  in the context menu
//
// This is still an open request in Chromium browser and is open since 2010!
// Refer: https://bugs.chromium.org/p/chromium/issues/detail?id=60758
//
// We need to migrate the following solution once the above feature is released

// Update the context menu when the page gets loaded
chrome.extension.sendMessage({
  message: "updateContextMenu",
});

// Update the context menu whenever a tab gets focussed
window.addEventListener("focus", () => {
  chrome.extension.sendMessage({
    message: "updateContextMenu",
  });
});
