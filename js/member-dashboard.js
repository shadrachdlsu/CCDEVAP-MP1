document.addEventListener("DOMContentLoaded", () => {
  const DATA_URL = "../data/documents.json";
  const pendingList = document.getElementById("pending-list");
  const previewPanel = document.getElementById("preview-panel");
  const statPending = document.querySelector(
    ".stats-row .stat-card:nth-child(1)",
  );
  const statSignedToday = document.querySelector(
    ".stats-row .stat-card:nth-child(2)",
  );
  const statTotalSigned = document.querySelector(
    ".stats-row .stat-card:nth-child(3)",
  );

  let docs = [];
  let currentItems = [];
  let selectedDoc = null;
  let currentFilter = "pending";

  function getFilteredItems() {
    const now = new Date();

    if (currentFilter === "pending") {
      return docs.filter((d) => d.status.toLowerCase() === "pending");
    }

    if (currentFilter === "today") {
      return docs.filter((d) => {
        if (!d.signedAt) return false;
        const dt = new Date(d.signedAt);
        return (
          dt.getFullYear() === now.getFullYear() &&
          dt.getMonth() === now.getMonth() &&
          dt.getDate() === now.getDate()
        );
      });
    }

    if (currentFilter === "signed") {
      return docs.filter(
        (d) =>
          d.status.toLowerCase() === "signed" ||
          d.status.toLowerCase() === "approved",
      );
    }

    return docs;
  }

  function refreshCurrentList() {
    renderPendingList(getFilteredItems());
  }

  function formatDateISO(iso) {
    try {
      return new Date(iso).toLocaleString();
    } catch (e) {
      return iso;
    }
  }

  function renderPendingList(items) {
    pendingList.innerHTML = "";
    if (items.length === 0) {
      pendingList.innerHTML =
        '<div style="color:#64748b">No documents found.</div>';
      return;
    }

    currentItems = items;
    items.forEach((d) => {
      const article = document.createElement("article");
      article.className = "pending-item";
      article.dataset.id = d.id;
      article.innerHTML = `
        <div class="meta">${d.docNumber} <span class="priority ${d.priority.toLowerCase()}">${d.priority}</span></div>
        <h3>${d.title}</h3>
        <div class="sub">${d.category} · ${d.department}</div>
        <div class="time">${formatDateISO(d.uploadedAt)}</div>
      `;
      article.addEventListener("click", () => {
        selectedDoc = d;
        pendingList
          .querySelectorAll(".pending-item.selected")
          .forEach((item) => item.classList.remove("selected"));
        article.classList.add("selected");
        renderPreview(d);
      });
      article.addEventListener("mouseover", () => {
        article.style.cursor = "pointer";
      });
      pendingList.appendChild(article);
    });
  }

  function renderPreview(doc) {
    if (!doc) {
      previewPanel.innerHTML = `<div class="panel-card preview-card"><div class="preview-empty"><div class="preview-icon">🗂️</div><h3>Select a Document</h3><p>Choose a document from the list to preview and take action</p></div></div>`;
      return;
    }

    const embedHtml = doc.file
      ? `<iframe src="${doc.file}" style="width:100%;height:520px;border:0;border-radius:8px"></iframe>`
      : `<div style="margin-top:18px;color:#374151">No file available for preview.</div>`;

    previewPanel.innerHTML = `
      <div class="panel-card">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px">
          <div>
            <div style="font-size:13px;color:#6b7280">${doc.docNumber} · ${doc.category} · ${doc.department}</div>
            <div style="font-size:20px;font-weight:700;margin-top:6px">${doc.title}</div>
            <div style="color:#6b7280;margin-top:8px">Status: ${doc.status} · Priority: ${doc.priority}</div>
          </div>
          <div class="action-row">
            <button id="open-doc-button" class="action-btn action-open">Open</button>
            <button id="approve-doc-button" class="action-btn action-approve">Approve</button>
            <button id="deny-doc-button" class="action-btn action-deny">Deny</button>
            <button id="cancel-doc-button" class="action-btn action-cancel">Cancel</button>
          </div>
        </div>
        ${embedHtml}
      </div>
    `;

    const openButton = document.getElementById("open-doc-button");
    const approveButton = document.getElementById("approve-doc-button");
    const denyButton = document.getElementById("deny-doc-button");
    const cancelButton = document.getElementById("cancel-doc-button");

    if (openButton) {
      openButton.addEventListener("click", () => {
        const target = doc.file || doc.url;
        if (target) {
          window.open(target, "_blank");
        }
      });
    }

    if (approveButton) {
      approveButton.addEventListener("click", () => {
        if (selectedDoc) {
          selectedDoc.status = "Approved";
          updateStats();
          refreshCurrentList();
          const currentFiltered = getFilteredItems();
          if (!currentFiltered.includes(selectedDoc)) {
            selectedDoc = null;
            renderPreview(null);
          } else {
            renderPreview(selectedDoc);
          }
          alert("Document approved.");
        }
      });
    }

    if (denyButton) {
      denyButton.addEventListener("click", () => {
        if (selectedDoc) {
          selectedDoc.status = "Denied";
          updateStats();
          refreshCurrentList();
          const currentFiltered = getFilteredItems();
          if (!currentFiltered.includes(selectedDoc)) {
            selectedDoc = null;
            renderPreview(null);
          } else {
            renderPreview(selectedDoc);
          }
          alert("Document denied.");
        }
      });
    }

    if (cancelButton) {
      cancelButton.addEventListener("click", () => {
        selectedDoc = null;
        pendingList
          .querySelectorAll(".pending-item.selected")
          .forEach((item) => item.classList.remove("selected"));
        renderPreview(null);
      });
    }
  }

  function updateStats() {
    const now = new Date();
    const pendingCount = docs.filter(
      (d) => d.status.toLowerCase() === "pending",
    ).length;
    const totalSigned = docs.filter(
      (d) =>
        d.status.toLowerCase() === "signed" ||
        d.status.toLowerCase() === "approved",
    ).length;
    const signedToday = docs.filter((d) => {
      if (!d.signedAt) return false;
      const dt = new Date(d.signedAt);
      return (
        dt.getFullYear() === now.getFullYear() &&
        dt.getMonth() === now.getMonth() &&
        dt.getDate() === now.getDate()
      );
    }).length;

    statPending.querySelector(".stat-number")?.remove();
    statPending.insertAdjacentHTML(
      "afterbegin",
      `<div class="stat-number">${pendingCount}</div>`,
    );

    statSignedToday.querySelector(".stat-number")?.remove();
    statSignedToday.insertAdjacentHTML(
      "afterbegin",
      `<div class="stat-number">${signedToday}</div>`,
    );

    statTotalSigned.querySelector(".stat-number")?.remove();
    statTotalSigned.insertAdjacentHTML(
      "afterbegin",
      `<div class="stat-number">${totalSigned}</div>`,
    );
  }

  function attachStatHandlers() {
    statPending.addEventListener("click", () => {
      currentFilter = "pending";
      renderPendingList(getFilteredItems());
      renderPreview(null);
    });

    statSignedToday.addEventListener("click", () => {
      currentFilter = "today";
      renderPendingList(getFilteredItems());
      renderPreview(null);
    });

    statTotalSigned.addEventListener("click", () => {
      currentFilter = "signed";
      renderPendingList(getFilteredItems());
      renderPreview(null);
    });
  }

  async function init() {
    try {
      const res = await fetch(DATA_URL);
      docs = await res.json();
    } catch (e) {
      console.error("Failed to load documents", e);
      docs = [];
    }

    updateStats();
    attachStatHandlers();
    renderPendingList(docs.filter((d) => d.status.toLowerCase() === "pending"));
    renderPreview(null);
  }

  init();
});
