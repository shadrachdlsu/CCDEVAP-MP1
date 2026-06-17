document.addEventListener("DOMContentLoaded", () => {
  const DATA_URL = "../data/documents.json";
  const pendingList = document.getElementById("pending-list");
  const pendingChartPanel = document.getElementById("pending-chart-panel");
  const pendingChartContent = document.getElementById("pending-chart-content");
  const documentsTitle = document.getElementById("documents-title");
  const statPending = document.querySelector(
    ".stats-row .stat-card:nth-child(1)",
  );
  const statSignedToday = document.querySelector(
    ".stats-row .stat-card:nth-child(2)",
  );
  const statTotalSigned = document.querySelector(
    ".stats-row .stat-card:nth-child(3)",
  );
  const themeToggle = document.getElementById("themeToggle");
  const logoutButton = document.querySelector(".logout-btn");
  const viewAllButton = document.querySelector(".view-all");

  let docs = [];
  let selectedDoc = null;
  let currentFilter = "pending";

  const priorityColors = {
    High: "#dc2626",
    Medium: "#f59e0b",
    Low: "#2563eb",
  };

  const signedTodaySamples = [
    {
      id: "sample-signed-001",
      docNumber: "DOC-2024-052",
      title: "Travel Authority Approval",
      category: "Leave/Travel",
      department: "HR Office",
      priority: "Medium",
      status: "Signed",
      uploadedAt: new Date().toISOString(),
      file: "../pdfs/PAJE_FLOWCHART.pdf",
    },
    {
      id: "sample-signed-002",
      docNumber: "DOC-2024-053",
      title: "Office Supply Request",
      category: "Requisition",
      department: "Administration",
      priority: "Low",
      status: "Signed",
      uploadedAt: new Date().toISOString(),
      file: "../pdfs/CCPROG1 Term 1, AY 2024- 2025 syllabus.docx (1).pdf",
    },
    {
      id: "sample-signed-003",
      docNumber: "DOC-2024-054",
      title: "Training Attendance Memo",
      category: "Memorandum",
      department: "HR Office",
      priority: "High",
      status: "Approved",
      uploadedAt: new Date().toISOString(),
      file: "../pdfs/ITSRAQA MCO1.pdf",
    },
  ];

  function getFilteredItems() {
    if (currentFilter === "pending") {
      return docs.filter((d) => d.status.toLowerCase() === "pending");
    }

    if (currentFilter === "today") {
      return signedTodaySamples;
    }

    if (currentFilter === "signed") {
      return getAllSignedItems();
    }

    return docs;
  }

  function getSignedDocs() {
    return docs.filter((d) =>
      ["signed", "approved"].includes(d.status.toLowerCase()),
    );
  }

  function getAllSignedItems() {
    return [...getSignedDocs(), ...signedTodaySamples];
  }

  function formatDateISO(iso) {
    try {
      return new Date(iso).toLocaleString();
    } catch (e) {
      return iso;
    }
  }

  function setActiveStat(activeCard) {
    [statPending, statSignedToday, statTotalSigned].forEach((card) => {
      card.classList.remove("active");
    });

    if (activeCard) {
      activeCard.classList.add("active");
    }
  }

  function renderPendingChart() {
    const pendingItems = docs.filter((d) => d.status.toLowerCase() === "pending");
    const chartRows = ["High", "Medium", "Low"].map((priority) => ({
      label: `${priority} Priority`,
      value: pendingItems.filter((doc) => doc.priority === priority).length,
      color: priorityColors[priority],
    }));
    let start = 0;
    const total = pendingItems.length;
    const gradient =
      total === 0
        ? "#e5e7eb 0 100%"
        : chartRows
            .map((row) => {
              const end = start + (row.value / total) * 100;
              const segment = `${row.color} ${start}% ${end}%`;
              start = end;
              return segment;
            })
            .join(", ");

    pendingChartPanel.style.display = "block";
    pendingChartContent.innerHTML = `
      <div class="member-chart-layout">
        <div
          class="pie-chart"
          style="background: conic-gradient(${gradient})"
          aria-label="Pending signed distribution"
        >
          <span>${total}</span>
        </div>
        <div class="chart-list">
          ${chartRows
            .map(
              (row) => `
                <div class="chart-row">
                  <span class="chart-swatch" style="background: ${row.color}"></span>
                  <span>${row.label}</span>
                  <strong>${row.value}</strong>
                </div>
              `,
            )
            .join("")}
        </div>
      </div>
    `;
  }

  function hidePendingChart() {
    pendingChartPanel.style.display = "none";
  }

  function setDocumentsTitle(title) {
    if (documentsTitle) {
      documentsTitle.textContent = title;
    }
  }

  function renderPendingList(items, showActions = false) {
    pendingList.innerHTML = "";

    if (items.length === 0) {
      pendingList.innerHTML =
        '<div class="preview-unavailable">No documents found.</div>';
      return;
    }

    items.forEach((doc) => {
      const article = document.createElement("article");
      article.className = "pending-item";
      article.dataset.id = doc.id;
      article.innerHTML = `
        <div class="pending-main">
          <button class="doc-icon" type="button" aria-label="Open ${doc.title}">
            <i class="fas fa-file-alt"></i>
          </button>
          <div class="pending-details">
            <div class="meta">${doc.docNumber} <span class="priority ${doc.priority.toLowerCase()}">${doc.priority}</span></div>
            <h3>${doc.title}</h3>
            <div class="sub">${doc.category} - ${doc.department}</div>
            <div class="time">${formatDateISO(doc.uploadedAt)}</div>
          </div>
          <span class="status-badge">${doc.status}</span>
        </div>
        ${
          showActions
            ? `<div class="inline-actions">
                <button class="action-btn action-approve" type="button">Approve</button>
                <button class="action-btn action-deny" type="button">Deny</button>
                <button class="action-btn action-cancel" type="button">Cancel</button>
              </div>`
            : ""
        }
      `;

      article.querySelector(".doc-icon").addEventListener("click", (e) => {
        e.stopPropagation();
        const target = doc.file || doc.url;

        if (target) {
          window.open(target, "_blank");
        }
      });

      if (showActions) {
        article.addEventListener("click", () => {
          selectedDoc = doc;
          pendingList
            .querySelectorAll(".pending-item.selected")
            .forEach((item) => item.classList.remove("selected"));
          article.classList.add("selected");
        });

        article
          .querySelector(".action-approve")
          .addEventListener("click", (e) => {
            e.stopPropagation();
            selectedDoc = doc;
            updateDocumentStatus("Approved");
          });

        article.querySelector(".action-deny").addEventListener("click", (e) => {
          e.stopPropagation();
          selectedDoc = doc;
          updateDocumentStatus("Denied");
        });

        article
          .querySelector(".action-cancel")
          .addEventListener("click", (e) => {
            e.stopPropagation();
            selectedDoc = null;
            article.classList.remove("selected");
          });
      }

      pendingList.appendChild(article);
    });
  }

  function updateDocumentStatus(status) {
    if (!selectedDoc) return;

    selectedDoc.status = status;
    updateStats();
    renderPendingList(getFilteredItems());

    if (!getFilteredItems().includes(selectedDoc)) {
      selectedDoc = null;
    }

    alert(`Document ${status.toLowerCase()}.`);
  }

  function updateStats() {
    const pendingCount = docs.filter(
      (d) => d.status.toLowerCase() === "pending",
    ).length;
    const signedToday = signedTodaySamples.length;
    const totalSigned = getAllSignedItems().length;

    statPending.querySelector(".stat-number").textContent = pendingCount;
    statSignedToday.querySelector(".stat-number").textContent = signedToday;
    statTotalSigned.querySelector(".stat-number").textContent = totalSigned;
  }

  function attachStatHandlers() {
    statPending.addEventListener("click", () => {
      currentFilter = "pending";
      setActiveStat(statPending);
      renderPendingChart();
      setDocumentsTitle("Pending Signed");
      renderPendingList(getFilteredItems());
    });

    statSignedToday.addEventListener("click", () => {
      currentFilter = "today";
      setActiveStat(statSignedToday);
      hidePendingChart();
      setDocumentsTitle("Signed Today");
      renderPendingList(getFilteredItems());
    });

    statTotalSigned.addEventListener("click", () => {
      currentFilter = "signed";
      setActiveStat(statTotalSigned);
      hidePendingChart();
      setDocumentsTitle("Total Signed");
      renderPendingList(getFilteredItems());
    });
  }

  if (viewAllButton) {
    viewAllButton.addEventListener("click", () => {
      currentFilter = "all";
      setActiveStat(null);
      hidePendingChart();
      setDocumentsTitle("All Documents");
      renderPendingList(docs, true);
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      const icon = themeToggle.querySelector("i");

      if (document.body.classList.contains("dark-mode")) {
        icon.classList.remove("fa-moon");
        icon.classList.add("fa-sun");
      } else {
        icon.classList.remove("fa-sun");
        icon.classList.add("fa-moon");
      }
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      if (confirm("Are you sure you want to logout?")) {
        window.location.href = "login.html";
      }
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
    setActiveStat(statPending);
    renderPendingChart();
    setDocumentsTitle("Pending Signed");
    renderPendingList(getFilteredItems());
  }

  init();
});
