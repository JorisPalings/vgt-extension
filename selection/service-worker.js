chrome.runtime.onInstalled.addListener(() => {
	// Create the context menu when the extension is installed
	chrome.contextMenus.create({
	  id: "toon-gebaar",
	  title: "Toon gebaar voor '%s'",
	  contexts: ["selection"]
	})
  })
  
  // Ensure that the event listener for context menu is only added once
  chrome.contextMenus.onClicked.addListener((info, tab) => {
	if (info.menuItemId === "toon-gebaar" && info.selectionText) {
	  chrome.scripting.executeScript({
		target: { tabId: tab.id },
		files: ["content-script.js"]
	  }, () => {
		// Send the selected text to the content script, but only once
		chrome.tabs.sendMessage(tab.id, { selectedText: info.selectionText })
	  })
	}
  })
  