// References:
// - https://chromium.googlesource.com/chromium/src/+/master/chrome/common/extensions/docs/examples/api/windows/merge_windows

TOGGLE_CONTEXT_MENU_ID = "toggle-incognito";
currentTab = null;
targetWindow = null;

function createContextMenu() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    currentTab = tabs[0];

    var title = "Move to incognito";
    if (currentTab.incognito) title = "Move to normal tab";

    chrome.contextMenus.create({
      id: TOGGLE_CONTEXT_MENU_ID,
      title: title,
      visible: true,
      contexts: ["all"],
    });
  });
}

function updateContextMenu() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    currentTab = tabs[0];

    var title = "Move to incognito";
    if (currentTab.incognito) title = "Move to normal tab";

    chrome.contextMenus.update(TOGGLE_CONTEXT_MENU_ID, { title: title });
  });
}

function toggle() {
  // Fetch the current active tab from the current window
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    currentTab = tabs[0];

    chrome.windows.getAll({ populate: true }, (allWindows) => {
      if (currentTab.incognito) {
        // Current tab is in incognito
        // Open in normal window
        targetWindow = getNormal(allWindows);
      } else {
        // Current tab is not in incognito
        // Open in incognito window
        targetWindow = getIncognito(allWindows);
      }

      // Move the current tab to target window
      moveTab(currentTab, targetWindow);
      // // Update the text in context menu
      // updateContextMenu();
    });
  });
}

function getNormal(allWindows) {
  var normalWindow = null;
  if (allWindows != null) {
    for (var i = allWindows.length - 1; i >= 0; i--) {
      var currentWindow = allWindows[i];
      if (!currentWindow.incognito) {
        normalWindow = currentWindow;
        break;
      }
    }
  }

  return normalWindow;
}

function getIncognito(allWindows) {
  var incognitoWindow = null;
  if (allWindows != null) {
    for (var i = allWindows.length - 1; i >= 0; i--) {
      var currentWindow = allWindows[i];
      if (currentWindow.incognito) {
        incognitoWindow = currentWindow;
        break;
      }
    }
  }

  return incognitoWindow;
}

function getNewTabInWindow(window) {
  var newTab = null;
  if (window != null) {
    for (var i = window.tabs.length - 1; i >= 0; i--) {
      var currentTab = window.tabs[i];
      if (currentTab.url == "chrome://newtab/") {
        newTab = currentTab;
        break;
      }
    }
  }

  return newTab;
}

function moveTab(currentTab, targetWindow) {
  if (currentTab != null) {
    if (targetWindow != null) {
      // Cannot move a tab from normal window to incognito window or vice-versa, since they are not of the same profile
      // chrome.tabs.move(currentTab.id, {"windowId": targetWindow.id, "index": numTabsInTargetWindow + 1} );

      var newTab = getNewTabInWindow(targetWindow);
      if (newTab != null) {
        // There is a new tab without a loaded URL in target window
        chrome.tabs.update(newTab.id, {
          url: currentTab.url,
          active: true,
        });
      } else {
        // Calculate the number of tabs in the target window
        var numTabsInTargetWindow = targetWindow.tabs.length;

        // Create a new tab in the target window
        chrome.tabs.create({
          windowId: targetWindow.id,
          index: numTabsInTargetWindow + 1,
          url: currentTab.url,
        });
      }

      // Creating a new tab doesn't make the window focussed
      // Focus the targetWindow
      chrome.windows.update(targetWindow.id, {
        focused: true,
      });
    } else {
      // If there is no existing target window, open the URL in a new window
      // If current tab is in incognito, open in a new normal window
      // If current tab is not in incognito, open in a new incognito window
      chrome.windows.create({
        url: currentTab.url,
        incognito: !currentTab.incognito,
      });
    }
  }
}

// Create the context menu
createContextMenu();
chrome.contextMenus.onClicked.addListener(toggle);

// Trigger the toggle upon clicked
chrome.browserAction.onClicked.addListener(toggle);

chrome.extension.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message == "updateContextMenu") updateContextMenu();
  else sendResponse({});
});
