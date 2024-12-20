// content.js

// 检查是否存在本地存储的数据
function getMaskedCids() {
  return new Promise((resolve) => {
    chrome.storage.local.get("maskedCids", (data) => {
      resolve(data.maskedCids || []);
    });
  });
}

// 更新本地存储的已屏蔽项
function pushMaskedCids(cid) {
  getMaskedCids().then((maskedCids) => {
    if (!maskedCids.includes(cid)) {
      maskedCids.push(cid);
      chrome.storage.local.set({ maskedCids });
    }
  });
}

function removeMaskedCids(cid) {
  getMaskedCids().then((maskedCids) => {
    const index = maskedCids.indexOf(cid);
    if (index > -1) {
      maskedCids.splice(index, 1);
      chrome.storage.local.set({ maskedCids });
    }
  });
}

// 处理页面中的 div 元素
function handleScholarDivs() {
  const divs = document.querySelectorAll(".gs_r.gs_or.gs_scl");
  getMaskedCids().then((maskedCids) => {
    divs.forEach((div) => {
      const cid = div.getAttribute("data-cid");
      const maskButton = document.createElement("button");
      maskButton.style.marginLeft = "0px";
      if (maskedCids.includes(cid)) {
        // Mask the div by changing the background color
        div.style.opacity = 0.2;
        maskButton.textContent = "Unmask";
      } else {
        div.style.opacity = 1;
        maskButton.textContent = "Mask";
      }
      // Add a button to mask the div
      maskButton.onclick = () => {
        if (maskButton.textContent === "Mask") {
          div.style.opacity = 0.2;
          pushMaskedCids(cid);
          maskButton.textContent = "Unmask";
        } else {
          div.style.opacity = 1;
          removeMaskedCids(cid);
          maskButton.textContent = "Mask";
        }
      };
      div.appendChild(maskButton);
    });
  });
}

// 在页面顶端添加按钮
function addExportImportButtons() {
  const container = document.createElement('div');
  // container.style.position = 'fixed';
  container.style.top = '10px';
  container.style.right = '10px';
  container.style.zIndex = '1000';

  // Export Button
  const exportButton = document.createElement('button');
  exportButton.textContent = 'Export';
  exportButton.style.marginLeft = '10px';
  exportButton.onclick = exportMaskedCids;
  container.appendChild(exportButton);

  // Import Button
  const importButton = document.createElement('button');
  importButton.textContent = 'Import';
  importButton.style.marginLeft = '10px';
  importButton.onclick = importMaskedCids;
  container.appendChild(importButton);

  const div = document.getElementById("gs_bdy");
  div.appendChild(container, div.firstChild);
}

// 导出 maskedCids 数据为 JSON 文件
function exportMaskedCids() {
  getMaskedCids().then((maskedCids) => {
    const blob = new Blob([JSON.stringify(maskedCids)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'maskedCids.json';
    a.click();
    URL.revokeObjectURL(url);
  });
}

// 导入 maskedCids 数据
function importMaskedCids() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const importedCids = JSON.parse(e.target.result);
        if (Array.isArray(importedCids)) {
          chrome.storage.local.set({ maskedCids: importedCids }, () => {
            alert('Import successful!');
            location.reload();  // Reload the page to apply imported data
          });
        } else {
          alert('Invalid file format.');
        }
      } catch (error) {
        alert('Error reading file.');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// 在页面加载时添加按钮
window.addEventListener("load", () => {
  addExportImportButtons();
  handleScholarDivs();
});