// Ensure everything is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Fetch the current active tab from the current window
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    currentTab = tabs[0];

    // Open the URL in a new incognito window
    chrome.windows.create({ url: currentTab.url, incognito: true });
  });
});
