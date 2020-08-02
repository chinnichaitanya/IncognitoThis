// References:
// - https://chromium.googlesource.com/chromium/src/+/master/chrome/common/extensions/docs/examples/api/windows/merge_windows

currentTab = null;
targetWindow = null;

function start() {
  // Fetch the current active tab from the current window
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    currentTab = tabs[0];

    chrome.windows.getAll({ populate: true }, (allWindows) => {
      incognitoWindow = getIncognito(allWindows);
      moveTab(currentTab, incognitoWindow);
    });
  });
}

function getIncognito(allWindows) {
  incognitoWindow = null;
  if (allWindows != null) {
    for (i = 0; i < allWindows.length; i++) {
      currentWindow = allWindows[i];
      if (currentWindow.incognito == true) {
        incognitoWindow = currentWindow;
        break;
      }
    }
  }

  return incognitoWindow;
}

function moveTab(currentTab, targetWindow) {
  if (currentTab != null) {
    if (targetWindow != null) {
      // Calculate the number of tabs in the target window
      var numTabsInTargetWindow = targetWindow.tabs.length;

      // Cannot move a tab from normal window to incognito window, since they are not of the same profile
      // chrome.tabs.move(currentTab.id, {"windowId": targetWindow.id, "index": numTabsInTargetWindow + 1} );

      // Create a new tab in the incognito window
      chrome.tabs.create({
        windowId: targetWindow.id,
        index: numTabsInTargetWindow + 1,
        url: currentTab.url,
      });
      // Creating a new tab doesn't make the window focussed
      // Focus the targetWindow
      chrome.windows.update(targetWindow.id, {
        focused: true,
      });
    } else {
      // If there is no existing incognito window, open the URL in a new incognito window
      chrome.windows.create({ url: currentTab.url, incognito: true });
    }
  }
}

// Ensure everything is loaded
document.addEventListener("DOMContentLoaded", () => {
  start();
});
