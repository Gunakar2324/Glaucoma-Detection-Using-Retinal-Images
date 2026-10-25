// frontend/js/app.js
// Main client application controller for Glaucoma AI

class GlaucomaApp {
  constructor() {
    this.currentView = "dashboard";
    this.activeAnalysisResult = null;
    this.currentImageMode = "original"; // "original" | "overlay" | "mask"
    this.init();
  }

  async init() {
    this.bindEvents();
    this.handleRoute();
    await this.loadDashboardData();
    await this.loadHistoryData();
    await this.loadPatientsData();
  }

  // Router & Event Binding
  bindEvents() {
    // Nav links
    document.querySelectorAll(".nav-item").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const view = link.getAttribute("data-view");
        this.navigateTo(view);
      });
    });

    // View All link on dashboard
    const viewAllBtn = document.getElementById("viewAllAnalysesBtn");
    if (viewAllBtn) {
      viewAllBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.navigateTo("history");
      });
    }

    // Global Search Bar in Header
    const globalSearch = document.getElementById("globalSearchInput");
    if (globalSearch) {
      globalSearch.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const q = globalSearch.value.trim();
          this.navigateTo("history");
          const histInput = document.getElementById("historySearchInput");
          if (histInput) {
            histInput.value = q;
            this.loadHistoryData(q);
          }
        }
      });
    }

    // Window PopState
    window.addEventListener("popstate", () => this.handleRoute());

    // File Upload Elements
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("fileInput");
    const browseLink = document.getElementById("browseLink");
    const uploadBtn = document.getElementById("uploadBtn");

    if (dropZone && fileInput) {
      const openPicker = (e) => {
        e.stopPropagation();
        fileInput.click();
      };
      if (browseLink) browseLink.addEventListener("click", openPicker);
      if (uploadBtn) uploadBtn.addEventListener("click", openPicker);
      dropZone.addEventListener("click", () => fileInput.click());

      // Drag and drop events
      ["dragenter", "dragover"].forEach((eventName) => {
        dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropZone.classList.add("dragover");
        });
      });

      ["dragleave", "drop"].forEach((eventName) => {
        dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropZone.classList.remove("dragover");
        });
      });

      dropZone.addEventListener("drop", (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files.length > 0) {
          this.handleFileUpload(files[0]);
        }
      });

      fileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files.length > 0) {
          this.handleFileUpload(e.target.files[0]);
        }
      });
    }

    // Sample Images Click
    document.querySelectorAll(".sample-card").forEach((card) => {
      card.addEventListener("click", () => {
        const sampleKey = card.getAttribute("data-sample");
        this.handleSampleAnalysis(sampleKey);
      });
    });

    // Result View Mode Tabs
    document.querySelectorAll(".mode-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".mode-tab-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const mode = btn.getAttribute("data-mode");
        this.switchResultImageMode(mode);
      });
    });

    // Analyze Another Image Button
    const analyzeAnotherBtn = document.getElementById("analyzeAnotherBtn");
    if (analyzeAnotherBtn) {
      analyzeAnotherBtn.addEventListener("click", () => {
        this.navigateTo("analyze");
      });
    }

    // Fullscreen View
    const fullscreenImgBtn = document.getElementById("fullscreenImgBtn");
    const fullscreenModal = document.getElementById("fullscreenModal");
    const closeFullscreenBtn = document.getElementById("closeFullscreenBtn");
    const fullscreenImgTarget = document.getElementById("fullscreenImgTarget");

    if (fullscreenImgBtn && fullscreenModal && fullscreenImgTarget) {
      fullscreenImgBtn.addEventListener("click", () => {
        const preview = document.getElementById("resultImagePreview");
        if (preview && preview.src) {
          fullscreenImgTarget.src = preview.src;
          fullscreenModal.classList.add("active");
        }
      });
      if (closeFullscreenBtn) {
        closeFullscreenBtn.addEventListener("click", () => {
          fullscreenModal.classList.remove("active");
        });
      }
      fullscreenModal.addEventListener("click", (e) => {
        if (e.target === fullscreenModal) {
          fullscreenModal.classList.remove("active");
        }
      });
    }

    // Print & PDF Download Buttons
    const printBtn = document.getElementById("printReportBtn");
    const downloadPdfBtn = document.getElementById("downloadPdfReportBtn");
    if (printBtn) {
      printBtn.addEventListener("click", () => this.generateAndPrintReport());
    }
    if (downloadPdfBtn) {
      downloadPdfBtn.addEventListener("click", () => this.downloadPdfReport());
    }

    // History Filters
    const histSearchBtn = document.getElementById("historySearchBtn");
    const histSearchInput = document.getElementById("historySearchInput");
    const histResultFilter = document.getElementById("historyResultFilter");

    if (histSearchBtn) {
      histSearchBtn.addEventListener("click", () => {
        const q = histSearchInput ? histSearchInput.value : "";
        const res = histResultFilter ? histResultFilter.value : "All";
        this.loadHistoryData(q, res);
      });
    }
    if (histSearchInput) {
      histSearchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const res = histResultFilter ? histResultFilter.value : "All";
          this.loadHistoryData(histSearchInput.value, res);
        }
      });
    }
    if (histResultFilter) {
      histResultFilter.addEventListener("change", () => {
        const q = histSearchInput ? histSearchInput.value : "";
        this.loadHistoryData(q, histResultFilter.value);
      });
    }

    // Export CSV
    const exportCsvBtn = document.getElementById("exportHistoryCsvBtn");
    const directCsvBtn = document.getElementById("downloadCsvDirectBtn");
    [exportCsvBtn, directCsvBtn].forEach((btn) => {
      if (btn) btn.addEventListener("click", () => this.exportHistoryAsCSV());
    });

    // Save Settings
    const saveSettingsBtn = document.getElementById("saveSettingsBtn");
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener("click", () => this.saveSettings());
    }
  }

  handleRoute() {
    const hash = window.location.hash.replace("#", "") || "dashboard";
    this.navigateTo(hash, false);
  }

  navigateTo(viewName, updateHash = true) {
    this.currentView = viewName;
    if (updateHash) {
      window.location.hash = viewName;
    }

    // Update active nav item
    document.querySelectorAll(".nav-item").forEach((item) => {
      if (item.getAttribute("data-view") === viewName) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    // Update active view section
    document.querySelectorAll(".view-section").forEach((sec) => {
      sec.classList.remove("active");
    });
    const targetSection = document.getElementById(`view-${viewName}`);
    if (targetSection) {
      targetSection.classList.add("active");
    }

    // Refresh lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Scroll to top
    const contentArea = document.getElementById("mainContent");
    if (contentArea) contentArea.scrollTop = 0;

    // View specific actions
    if (viewName === "dashboard") {
      this.loadDashboardData();
    } else if (viewName === "history") {
      this.loadHistoryData();
    } else if (viewName === "patients") {
      this.loadPatientsData();
    }
  }

  // Dashboard Data Loader
  async loadDashboardData() {
    try {
      const res = await fetch("/api/stats");
      const stats = await res.json();

      document.getElementById("statTotalAnalyses").textContent = stats.total_analyses;
      document.getElementById("statGlaucomaCount").textContent = stats.glaucoma_detected;
      document.getElementById("statGlaucomaSub").textContent = `${stats.glaucoma_percentage}% of total`;
      document.getElementById("statNormalCount").textContent = stats.normal_cases;
      document.getElementById("statNormalSub").textContent = `${stats.normal_percentage}% of total`;
      document.getElementById("statProcTime").textContent = stats.avg_processing_time;

      const legG = document.getElementById("legendGlaucoma");
      const legN = document.getElementById("legendNormal");
      if (legG) legG.textContent = `Glaucoma (${stats.glaucoma_detected})`;
      if (legN) legN.textContent = `Normal (${stats.normal_cases})`;

      // Render Charts
      if (window.dashboardCharts) {
        window.dashboardCharts.renderDonut(stats.glaucoma_percentage, stats.normal_percentage);
        window.dashboardCharts.renderTrend(stats.monthly_trend);
      }

      // Load Recent Analyses into Table
      const histRes = await fetch("/api/history");
      const history = await histRes.json();
      const recent = history.slice(0, 5);

      const tbody = document.getElementById("recentTableBody");
      if (tbody) {
        tbody.innerHTML = recent
          .map(
            (item, idx) => `
          <tr data-record-id="${item.id}">
            <td style="color: #94a3b8; font-weight: 500">${idx + 1}</td>
            <td>
              <img src="${item.image_thumb}" alt="Retina" class="table-thumb">
            </td>
            <td style="font-weight: 600; color: #1e293b">${item.patient_id}</td>
            <td>
              <span class="status-pill ${item.result.toLowerCase() === "glaucoma" ? "status-pill-red" : "status-pill-green"}">
                ${item.result}
              </span>
            </td>
            <td style="font-weight: 500">${item.confidence_formatted || item.confidence + "%"}</td>
            <td style="color: #64748b">${item.date_time}</td>
          </tr>
        `
          )
          .join("");

        // Attach click listeners to rows to view analysis
        tbody.querySelectorAll("tr").forEach((row) => {
          row.addEventListener("click", () => {
            const id = parseInt(row.getAttribute("data-record-id"));
            this.loadAndDisplayResultById(id);
          });
        });
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    }
  }

  // History Data Loader
  async loadHistoryData(search = "", resultFilter = "All") {
    try {
      let url = "/api/history?";
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (resultFilter && resultFilter !== "All") url += `result=${encodeURIComponent(resultFilter)}`;

      const res = await fetch(url);
      const records = await res.json();

      const tbody = document.getElementById("historyTableBody");
      const info = document.getElementById("paginationInfo");

      if (info) {
        info.textContent = `Showing 1 to ${records.length} of ${records.length} entries`;
      }

      if (tbody) {
        if (records.length === 0) {
          tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 24px; color: #94a3b8;">No matching analysis records found.</td></tr>`;
          return;
        }

        tbody.innerHTML = records
          .map(
            (item, idx) => `
          <tr data-record-id="${item.id}">
            <td style="color: #94a3b8; font-weight: 500">${idx + 1}</td>
            <td>
              <img src="${item.image_thumb}" alt="Retina" class="table-thumb">
            </td>
            <td style="font-weight: 600; color: #1e293b">${item.patient_id}</td>
            <td style="font-weight: 500">${item.patient_name || "Unknown"}</td>
            <td>
              <span class="status-pill ${item.result.toLowerCase() === "glaucoma" ? "status-pill-red" : "status-pill-green"}">
                ${item.result}
              </span>
            </td>
            <td style="font-weight: 500">${item.confidence_formatted || item.confidence + "%"}</td>
            <td style="color: #64748b">${item.date_time}</td>
            <td style="text-align: center">
              <div class="actions-cell">
                <button class="action-btn view-rec-btn" data-id="${item.id}" title="View Analysis Result">
                  <i data-lucide="eye"></i>
                </button>
                <button class="action-btn download-rec-btn" data-id="${item.id}" title="Download Clinical Report">
                  <i data-lucide="download"></i>
                </button>
              </div>
            </td>
          </tr>
        `
          )
          .join("");

        if (window.lucide) window.lucide.createIcons();

        // Bind action buttons
        tbody.querySelectorAll(".view-rec-btn").forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const id = parseInt(btn.getAttribute("data-id"));
            this.loadAndDisplayResultById(id);
          });
        });

        tbody.querySelectorAll(".download-rec-btn").forEach((btn) => {
          btn.addEventListener("click", async (e) => {
            e.stopPropagation();
            const id = parseInt(btn.getAttribute("data-id"));
            const rec = records.find((r) => r.id === id);
            if (rec) {
              this.activeAnalysisResult = rec;
              this.generateAndPrintReport();
            }
          });
        });

        tbody.querySelectorAll("tr").forEach((row) => {
          row.addEventListener("click", () => {
            const id = parseInt(row.getAttribute("data-record-id"));
            this.loadAndDisplayResultById(id);
          });
        });
      }
    } catch (err) {
      console.error("Error loading history:", err);
    }
  }

  // Patients Data Loader
  async loadPatientsData() {
    try {
      const res = await fetch("/api/patients");
      const patients = await res.json();

      const tbody = document.getElementById("patientsTableBody");
      if (tbody) {
        tbody.innerHTML = patients
          .map(
            (p) => `
          <tr>
            <td style="font-weight: 600; color: #1e293b">${p.id}</td>
            <td style="font-weight: 500">${p.name}</td>
            <td>${p.age} yrs</td>
            <td>${p.gender}</td>
            <td style="color: #64748b">${p.phone}</td>
            <td style="color: #64748b">${p.last_scan}</td>
            <td>
              <span class="status-pill ${p.diagnosis.toLowerCase() === "glaucoma"
                ? "status-pill-red"
                : p.diagnosis.toLowerCase() === "normal"
                  ? "status-pill-green"
                  : "status-pill-blue"
              }">
                ${p.diagnosis}
              </span>
            </td>
            <td>
              <span class="status-pill ${p.risk.toLowerCase() === "high"
                ? "status-pill-red"
                : p.risk.toLowerCase() === "low"
                  ? "status-pill-green"
                  : "status-pill-yellow"
              }">
                ${p.risk}
              </span>
            </td>
            <td style="color: #64748b">${p.doctor}</td>
            <td style="text-align: center">
              <button class="primary-btn btn-sm" onclick="app.launchScanForPatient('${p.id}', '${p.name}')">
                Scan Retina
              </button>
            </td>
          </tr>
        `
          )
          .join("");
      }
    } catch (err) {
      console.error("Error loading patients:", err);
    }
  }

  launchScanForPatient(patientId, patientName) {
    const idInput = document.getElementById("quickPatientId");
    const nameInput = document.getElementById("quickPatientName");
    if (idInput) idInput.value = patientId;
    if (nameInput) nameInput.value = patientName;
    this.navigateTo("analyze");
  }

  // Handle Real File Upload
  async handleFileUpload(file) {
    if (!file) return;

    const patientId = document.getElementById("quickPatientId")?.value || "P009";
    const patientName = document.getElementById("quickPatientName")?.value || "Alice Morgan";
    const patientEye = document.getElementById("quickPatientEye")?.value || "OD (Right Eye)";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("patient_id", patientId);
    formData.append("patient_name", patientName);
    formData.append("eye", patientEye);

    this.showScanningModal();

    try {
      this.updateScanStep("Extracting optic disc region...", 30);
      await this.sleep(400);

      this.updateScanStep("Executing Multi-Fold U-Net ONNX model...", 60);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Analysis failed on server.");
      }

      this.updateScanStep("Calculating Vertical CDR & Rim Thickness...", 90);
      await this.sleep(350);

      const result = await response.json();
      this.updateScanStep("Analysis complete!", 100);
      await this.sleep(300);

      this.hideScanningModal();
      this.displayAnalysisResult(result);
    } catch (err) {
      console.error("Error analyzing uploaded file:", err);
      this.hideScanningModal();
      alert("Error analyzing retinal image. Please make sure it is a valid fundus image.");
    }
  }

  // Handle Sample Analysis
  async handleSampleAnalysis(sampleKey) {
    const patientId = document.getElementById("quickPatientId")?.value || "P001";
    const patientName = document.getElementById("quickPatientName")?.value || "John Doe";
    const patientEye = document.getElementById("quickPatientEye")?.value || "OD (Right Eye)";

    this.showScanningModal();

    try {
      this.updateScanStep("Loading sample fundus photograph...", 25);
      await this.sleep(300);

      this.updateScanStep("Deep learning segmentation (Disc=Green, Cup=Red)...", 60);

      const response = await fetch("/api/analyze-sample", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sample_key: sampleKey,
          patient_id: patientId,
          patient_name: patientName,
          eye: patientEye
        })
      });

      if (!response.ok) {
        throw new Error("Sample analysis failed.");
      }

      this.updateScanStep("Computing Vertical Cup-to-Disc Ratio (VCDR)...", 85);
      await this.sleep(350);

      const result = await response.json();
      this.updateScanStep("Screening verdict ready!", 100);
      await this.sleep(250);

      this.hideScanningModal();
      this.displayAnalysisResult(result);
    } catch (err) {
      console.error("Error running sample analysis:", err);
      this.hideScanningModal();
      alert("Error running sample analysis.");
    }
  }

  // Load and display record by ID (from history / dashboard)
  async loadAndDisplayResultById(recordId) {
    try {
      const res = await fetch(`/api/history/${recordId}`);
      if (!res.ok) throw new Error("Record not found");
      const record = await res.json();
      this.displayAnalysisResult(record);
    } catch (err) {
      console.error("Error fetching record:", err);
    }
  }

  // Populate View 3: Analysis Result
  displayAnalysisResult(res) {
    this.activeAnalysisResult = res;

    // Set Default Image Mode to 'original'
    this.currentImageMode = "original";
    document.querySelectorAll(".mode-tab-btn").forEach((b) => {
      if (b.getAttribute("data-mode") === "original") b.classList.add("active");
      else b.classList.remove("active");
    });

    const preview = document.getElementById("resultImagePreview");
    const maskLegend = document.getElementById("maskLegend");
    if (maskLegend) maskLegend.style.display = "none";

    // Set preview image source
    if (res.images && res.images.original) {
      preview.src = res.images.original;
    } else if (res.image_thumb) {
      preview.src = res.image_thumb;
    }

    // Set File Info
    document.getElementById("resultFilename").textContent = res.filename || "P001_retina.jpg";
    document.getElementById("resultFileMeta").textContent = res.dimensions ? `1.2 MB | ${res.dimensions}` : "1.2 MB | 1024 × 1024";

    // Alert Banner Setup
    const banner = document.getElementById("resultAlertBanner");
    const title = document.getElementById("resultStatusTitle");
    const sub = document.getElementById("resultStatusSubtitle");
    const iconWrap = document.getElementById("alertIconWrap");

    const isGlaucoma = res.prediction_class.toLowerCase().includes("glaucoma");

    if (isGlaucoma) {
      banner.className = "alert-banner alert-danger";
      title.textContent = res.prediction_class === "Glaucoma" ? "Glaucoma Detected" : "Glaucoma Suspect Detected";
      sub.textContent = res.subtitle || "The model predicts a high likelihood of glaucoma.";
      iconWrap.innerHTML = `<i data-lucide="eye"></i>`;
    } else {
      banner.className = "alert-banner alert-success";
      title.textContent = "Normal Retina";
      sub.textContent = res.subtitle || "The optic disc and cup parameters appear within normal healthy limits.";
      iconWrap.innerHTML = `<i data-lucide="check-circle-2"></i>`;
    }

    // Metrics Setup
    const predBadge = document.getElementById("resultPredictionBadge");
    predBadge.textContent = res.prediction_class;
    predBadge.className = `status-pill ${isGlaucoma ? "status-pill-red" : "status-pill-green"}`;

    document.getElementById("resultConfidence").textContent = res.confidence_formatted || `${res.confidence}%`;

    const riskBadge = document.getElementById("resultRiskBadge");
    riskBadge.textContent = res.risk_level;
    riskBadge.className = `status-pill ${res.risk_level.toLowerCase() === "high"
        ? "status-pill-red"
        : res.risk_level.toLowerCase() === "low"
          ? "status-pill-green"
          : "status-pill-yellow"
      }`;

    document.getElementById("resultVcdr").textContent = res.vcdr_formatted || (res.cdr ? res.cdr.toFixed(2) : "0.78");

    // Key Findings List
    const findingsList = document.getElementById("resultFindingsList");
    if (findingsList) {
      const findings = res.key_findings || [
        "Enlarged optic cup to disc ratio",
        "Thinning of neuroretinal rim",
        "Possible optic nerve damage",
        "Features consistent with glaucoma"
      ];
      findingsList.innerHTML = findings.map((f) => `<li><span class="bullet-diamond">&#9670;</span> ${f}</li>`).join("");
    }

    if (window.lucide) window.lucide.createIcons();

    // Navigate to Result View
    this.navigateTo("result");
  }

  // Switch image mode (Original, Overlay, Mask)
  switchResultImageMode(mode) {
    this.currentImageMode = mode;
    const preview = document.getElementById("resultImagePreview");
    const maskLegend = document.getElementById("maskLegend");
    const res = this.activeAnalysisResult;

    if (!res) return;

    if (mode === "original") {
      preview.src = (res.images && res.images.original) ? res.images.original : res.image_thumb;
      if (maskLegend) maskLegend.style.display = "none";
    } else if (mode === "overlay") {
      preview.src = (res.images && res.images.overlay) ? res.images.overlay : res.image_thumb;
      if (maskLegend) maskLegend.style.display = "none";
    } else if (mode === "mask") {
      preview.src = (res.images && res.images.mask) ? res.images.mask : res.image_thumb;
      if (maskLegend) maskLegend.style.display = "flex";
    }
  }

  // Modal helpers
  showScanningModal() {
    const modal = document.getElementById("scanningModal");
    if (modal) modal.classList.add("active");
  }

  hideScanningModal() {
    const modal = document.getElementById("scanningModal");
    if (modal) modal.classList.remove("active");
  }

  updateScanStep(text, percent) {
    const stepText = document.getElementById("scanStepText");
    const fill = document.getElementById("scanProgressFill");
    if (stepText) stepText.textContent = text;
    if (fill) fill.style.width = `${percent}%`;
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Generate Printable Clinical Report
  async generateAndPrintReport() {
    const res = this.activeAnalysisResult;
    if (!res) {
      alert("No active analysis result to print.");
      return;
    }

    const container = document.getElementById("printReportContainer");
    if (!container) return;

    const isGlaucoma = res.prediction_class.toLowerCase().includes("glaucoma");
    const nowStr = new Date().toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" });

    // Ensure we get a valid image source (from current preview or result object)
    const currentPreview = document.getElementById("resultImagePreview");
    let imgSrc = (currentPreview && currentPreview.src) ? currentPreview.src : null;
    if (!imgSrc || imgSrc.length < 30) {
      imgSrc = (res.images && res.images.overlay) ? res.images.overlay : ((res.images && res.images.original) ? res.images.original : (res.image_thumb || "/assets/samples/glaucoma_advanced.jpg"));
    }

    container.innerHTML = `
      <div style="font-family: 'Inter', sans-serif; max-width: 800px; margin: 0 auto; color: #0f172a; line-height: 1.5; background: #ffffff;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px;">
          <div>
            <h1 style="color: #2563eb; font-size: 24px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">GLAUCOMA AI VISION INSTITUTE</h1>
            <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Department of Ophthalmic Imaging & Deep Learning Diagnostics</p>
          </div>
          <div style="text-align: right;">
            <span style="display: inline-block; background: #eff6ff; color: #2563eb; padding: 4px 12px; border-radius: 999px; font-weight: 700; font-size: 12px; border: 1px solid #bfdbfe;">CLINICAL REPORT</span>
            <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0;">Report Date: ${nowStr}</p>
          </div>
        </div>

        <!-- Patient Info Card -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; font-size: 13px;">
          <div><strong>Patient ID:</strong> ${res.patient_id || "P001"}</div>
          <div><strong>Patient Name:</strong> ${res.patient_name || "John Doe"}</div>
          <div><strong>Eye Examined:</strong> ${res.eye || "OD (Right Eye)"}</div>
          <div><strong>Age / Gender:</strong> ${res.age || 58} yrs / ${res.gender || "Male"}</div>
          <div><strong>Examiner:</strong> Dr. Raj Kumar, MD</div>
          <div><strong>Model Engine:</strong> Multi-Fold U-Net (FP16 ONNX)</div>
        </div>

        <!-- Diagnostic Summary -->
        <div style="display: grid; grid-template-columns: 260px 1fr; gap: 24px; margin-bottom: 24px; align-items: start;">
          <!-- Left: Retinal Image with Overlay -->
          <div style="text-align: center;">
            <div style="width: 250px; height: 250px; background: #000; border-radius: 12px; overflow: hidden; margin: 0 auto; border: 1px solid #cbd5e1; box-sizing: border-box;">
              <img id="printReportImgElem" src="${imgSrc}" width="250" height="250" style="width: 250px; height: 250px; object-fit: cover; display: block;" alt="Retinal fundus image">
            </div>
            <p style="font-size: 11px; color: #64748b; margin-top: 8px;">Figure 1: Retinal fundus image with optic disc and cup segmentation overlay</p>
          </div>

          <!-- Right: Key Measurements & Findings -->
          <div>
            <div style="background: ${isGlaucoma ? '#fee2e2' : '#dcfce7'}; border: 1px solid ${isGlaucoma ? '#fecaca' : '#bbf7d0'}; border-radius: 10px; padding: 14px; margin-bottom: 16px;">
              <h3 style="margin: 0; color: ${isGlaucoma ? '#dc2626' : '#16a34a'}; font-size: 17px; font-weight: 700;">
                ${isGlaucoma ? '⚠️ Glaucoma Detected' : '✓ Normal Retina - Negative for Glaucoma'}
              </h3>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #475569;">
                ${res.subtitle || ''}
              </p>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 16px;">
              <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 6px 0; color: #64748b;">Vertical Cup-to-Disc Ratio (VCDR):</td><td style="padding: 6px 0; font-weight: 700; color: #2563eb; text-align: right;">${res.vcdr_formatted || res.cdr}</td></tr>
              <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 6px 0; color: #64748b;">Confidence Score:</td><td style="padding: 6px 0; font-weight: 700; text-align: right;">${res.confidence_formatted || res.confidence + '%'}</td></tr>
              <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 6px 0; color: #64748b;">Calculated Risk Level:</td><td style="padding: 6px 0; font-weight: 700; color: ${isGlaucoma ? '#dc2626' : '#16a34a'}; text-align: right;">${res.risk_level}</td></tr>
              <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 6px 0; color: #64748b;">Diagnostic VCDR Threshold:</td><td style="padding: 6px 0; color: #64748b; text-align: right;">0.70 (Literature Consensus)</td></tr>
            </table>

            <h4 style="margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; color: #1e293b; letter-spacing: 0.5px;">Key Clinical Findings:</h4>
            <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #334155; line-height: 1.6;">
              ${(res.key_findings || []).map((f) => `<li style="margin-bottom: 4px;">${f}</li>`).join("")}
            </ul>
          </div>
        </div>

        <!-- Doctor Signature and Disclaimer -->
        <div style="border-top: 1px dashed #cbd5e1; padding-top: 18px; margin-top: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div style="max-width: 60%;">
            <p style="font-size: 10.5px; color: #64748b; margin: 0; line-height: 1.4;">
              <strong>Disclaimer:</strong> This screening document is produced by an automated artificial intelligence system utilizing deep learning convolutional neural networks (U-Net). It is intended as diagnostic decision support and must be corroborated with clinical gonioscopy, visual field testing, and tonometry by a licensed ophthalmologist.
            </p>
          </div>
          <div style="text-align: center; width: 220px;">
            <div style="border-bottom: 1px solid #0f172a; height: 35px; margin-bottom: 6px;"></div>
            <p style="font-weight: 700; font-size: 13px; margin: 0;">Dr. Raj Kumar, MD</p>
            <p style="font-size: 11px; color: #64748b; margin: 0;">Lead Consultant Ophthalmologist</p>
          </div>
        </div>
      </div>
    `;

    // Ensure image is fully loaded and rasterized in memory before triggering print dialog!
    const printImg = document.getElementById("printReportImgElem");
    if (printImg) {
      if (printImg.complete && printImg.naturalWidth > 0) {
        try { await printImg.decode(); } catch (e) { }
      } else {
        await new Promise((resolve) => {
          printImg.onload = resolve;
          printImg.onerror = resolve;
          setTimeout(resolve, 800);
        });
      }
    }

    await this.sleep(200);
    window.print();
  }

  // Direct High-Resolution PDF Download via ReportLab Backend
  async downloadPdfReport() {
    const res = this.activeAnalysisResult;
    if (!res) {
      alert("No active analysis result to download.");
      return;
    }

    const downloadBtn = document.getElementById("downloadPdfReportBtn");
    const originalText = downloadBtn ? downloadBtn.innerHTML : "";
    if (downloadBtn) {
      downloadBtn.innerHTML = `<i data-lucide="loader" class="spin"></i> Generating PDF...`;
      if (window.lucide) window.lucide.createIcons();
    }

    try {
      const currentPreview = document.getElementById("resultImagePreview");
      let currentImgSrc = (currentPreview && currentPreview.src) ? currentPreview.src : null;
      if (!currentImgSrc || currentImgSrc.length < 30) {
        currentImgSrc = (res.images && res.images.overlay) ? res.images.overlay : ((res.images && res.images.original) ? res.images.original : res.image_thumb);
      }

      const payload = {
        ...res,
        images: {
          ...res.images,
          overlay: currentImgSrc || res.images?.overlay || res.images?.original || res.image_thumb
        }
      };

      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to generate PDF on server");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Glaucoma_Clinical_Report_${res.patient_id || "P001"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generating PDF:", err);
      // Fallback to print
      this.generateAndPrintReport();
    } finally {
      if (downloadBtn) {
        downloadBtn.innerHTML = originalText;
        if (window.lucide) window.lucide.createIcons();
      }
    }
  }

  // Export CSV
  async exportHistoryAsCSV() {
    try {
      const res = await fetch("/api/history");
      const records = await res.json();

      let csv = "ID,Patient_ID,Patient_Name,Age,Gender,Eye,Result,Confidence,Risk_Level,VCDR,Date_Time\n";
      records.forEach((r) => {
        csv += `"${r.id}","${r.patient_id}","${r.patient_name || ""}","${r.age || ""}","${r.gender || ""}","${r.eye || ""}","${r.result}","${r.confidence_formatted || r.confidence}","${r.risk_level}","${r.vcdr_formatted || r.cdr}","${r.date_time}"\n`;
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Glaucoma_Screening_History_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error exporting CSV:", err);
    }
  }

  // Save Settings
  async saveSettings() {
    const glaucomaThresh = parseFloat(document.getElementById("settingGlaucomaThreshold")?.value || "0.70");
    const suspectThresh = parseFloat(document.getElementById("settingSuspectThreshold")?.value || "0.60");
    const clinicName = document.getElementById("settingClinicName")?.value || "Glaucoma AI Vision Institute";
    const doctorName = document.getElementById("settingDoctorName")?.value || "Dr. Raj Kumar, MD";
    const deviceMode = document.getElementById("settingDeviceMode")?.value || "CPU (ONNXRuntime FP16)";

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          glaucoma_threshold: glaucomaThresh,
          suspect_threshold: suspectThresh,
          clinic_name: clinicName,
          physician_name: doctorName,
          device_mode: deviceMode
        })
      });
      if (res.ok) {
        alert("Settings successfully saved!");
      }
    } catch (err) {
      console.error("Error saving settings:", err);
    }
  }
}

// Instantiate global app
window.app = new GlaucomaApp();
