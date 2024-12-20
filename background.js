// background.js

// 初次启动时初始化 maskedCids 为一个空数组
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ maskedCids: [] });
});