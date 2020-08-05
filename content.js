window.addEventListener(
  "contextmenu",
  (event) => {
    // event.preventDefault();

    if (event.button === 2 || event.which === 3) {
      chrome.extension.sendMessage({
        message: "updateContextMenu",
      });
    } else {
      return false;
    }
  },
  { capture: true }
);
