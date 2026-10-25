// frontend/js/charts.js
// Interactive SVG chart renderer for Glaucoma AI Dashboard

class DashboardCharts {
  constructor() {
    this.donutContainer = document.getElementById("donutContainer");
    this.trendContainer = document.getElementById("trendContainer");
  }

  renderDonut(glaucomaPct = 28.9, normalPct = 71.1) {
    if (!this.donutContainer) return;

    const size = 140;
    const strokeWidth = 14;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    // Normal stroke (base full circle)
    // Glaucoma stroke (dash offset)
    const glaucomaDash = (glaucomaPct / 100) * circumference;
    const normalDash = circumference - glaucomaDash;

    const svg = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <!-- Background track (Normal: Green) -->
        <circle
          cx="${size / 2}"
          cy="${size / 2}"
          r="${radius}"
          fill="none"
          stroke="#10b981"
          stroke-width="${strokeWidth}"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="0"
          transform="rotate(-90 ${size / 2} ${size / 2})"
        />
        <!-- Active slice (Glaucoma: Red) -->
        <circle
          cx="${size / 2}"
          cy="${size / 2}"
          r="${radius}"
          fill="none"
          stroke="#ef4444"
          stroke-width="${strokeWidth}"
          stroke-linecap="round"
          stroke-dasharray="${glaucomaDash} ${circumference}"
          stroke-dashoffset="0"
          transform="rotate(-90 ${size / 2} ${size / 2})"
          style="transition: stroke-dasharray 0.8s ease;"
        />
        <!-- Center Text -->
        <g text-anchor="middle" dominant-baseline="middle">
          <text x="${size / 2}" y="${size / 2 - 5}" font-family="Inter, sans-serif" font-weight="700" font-size="20" fill="#0f172a">
            ${glaucomaPct}%
          </text>
          <text x="${size / 2}" y="${size / 2 + 14}" font-family="Inter, sans-serif" font-weight="500" font-size="11" fill="#64748b">
            Glaucoma
          </text>
        </g>
      </svg>
    `;

    this.donutContainer.innerHTML = svg;
  }

  renderTrend(monthlyData) {
    if (!this.trendContainer) return;

    const defaultData = [
      { month: "Jan", total: 28, glaucoma: 8 },
      { month: "Feb", total: 35, glaucoma: 10 },
      { month: "Mar", total: 42, glaucoma: 12 },
      { month: "Apr", total: 38, glaucoma: 11 },
      { month: "May", total: 49, glaucoma: 14 },
      { month: "Jun", total: 56, glaucoma: 17 }
    ];

    const data = monthlyData && monthlyData.length ? monthlyData : defaultData;

    const width = this.trendContainer.clientWidth || 280;
    const height = 120;
    const padding = { top: 15, right: 15, bottom: 25, left: 25 };

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxVal = 65;

    // Helper functions for coordinates
    const getX = (i) => padding.left + (i / (data.length - 1)) * chartW;
    const getY = (v) => padding.top + chartH - (v / maxVal) * chartH;

    // Build path coordinates
    const totalPoints = data.map((d, i) => `${getX(i)},${getY(d.total)}`);
    const glaucomaPoints = data.map((d, i) => `${getX(i)},${getY(d.glaucoma)}`);

    const totalPath = `M ${totalPoints.join(" L ")}`;
    const glaucomaPath = `M ${glaucomaPoints.join(" L ")}`;

    // Generate grid lines
    let gridLines = "";
    [0, 20, 40, 60].forEach((v) => {
      const y = getY(v);
      gridLines += `
        <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#f1f5f9" stroke-width="1" />
        <text x="${padding.left - 6}" y="${y + 3}" text-anchor="end" font-size="9" fill="#94a3b8">${v}</text>
      `;
    });

    // Month labels
    let monthLabels = "";
    data.forEach((d, i) => {
      const x = getX(i);
      monthLabels += `
        <text x="${x}" y="${height - 6}" text-anchor="middle" font-size="10" font-weight="500" fill="#64748b">${d.month}</text>
      `;
    });

    // Data dots
    let dots = "";
    data.forEach((d, i) => {
      const tx = getX(i);
      const ty = getY(d.total);
      const gx = getX(i);
      const gy = getY(d.glaucoma);

      dots += `
        <!-- Total dot -->
        <circle cx="${tx}" cy="${ty}" r="4" fill="#2563eb" stroke="#ffffff" stroke-width="2" class="chart-point" data-tip="Total: ${d.total}"/>
        <!-- Glaucoma dot -->
        <circle cx="${gx}" cy="${gy}" r="4" fill="#ef4444" stroke="#ffffff" stroke-width="2" class="chart-point" data-tip="Glaucoma: ${d.glaucoma}"/>
      `;
    });

    const svg = `
      <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" style="overflow: visible;">
        <!-- Grid -->
        ${gridLines}

        <!-- Total Line (Blue) -->
        <path d="${totalPath}" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />

        <!-- Glaucoma Line (Red) -->
        <path d="${glaucomaPath}" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />

        <!-- Dots -->
        ${dots}

        <!-- Month Labels -->
        ${monthLabels}
      </svg>
    `;

    this.trendContainer.innerHTML = svg;
  }
}

window.dashboardCharts = new DashboardCharts();
