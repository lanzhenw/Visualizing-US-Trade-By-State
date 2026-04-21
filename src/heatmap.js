import * as d3 from 'd3';

let exportData, importData, allState;
let tooltip;

export function initHeatmap(allData) {
  exportData = allData.stateExportData;
  importData = allData.stateImportData;
  allState = allData.allState;

  tooltip = d3.select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  renderHeatmap();

  document.getElementById('heatmap-flow').addEventListener('change', renderHeatmap);
  document.getElementById('heatmap-baseline').addEventListener('change', renderHeatmap);
  document.getElementById('heatmap-metric').addEventListener('change', renderHeatmap);
}

function renderHeatmap() {
  const flow = document.getElementById('heatmap-flow').value;
  const baselineYear = document.getElementById('heatmap-baseline').value;
  const metric = document.getElementById('heatmap-metric').value;

  const dataset = flow === 'exports' ? exportData : importData;
  const valueField = flow === 'exports' ? 'total_exports_value' : 'total_import_values';

  // Aggregate: for each (state, commodity), get the world-total value in baselineYear and 2025
  const byStateCommodity = {};
  for (const row of dataset) {
    if (row.country !== 'World Total') continue;
    const yr = row.time;
    if (yr !== baselineYear && yr !== '2025') continue;
    const key = row.state + '|' + row.commodity;
    if (!byStateCommodity[key]) byStateCommodity[key] = { state: row.state, commodity: row.commodity, base: 0, cur: 0 };
    const val = +row[valueField];
    if (yr === baselineYear) byStateCommodity[key].base += val;
    else if (yr === '2025') byStateCommodity[key].cur += val;
  }

  const rows = Object.values(byStateCommodity).filter(r => r.base > 0 || r.cur > 0);

  // Pick top 20 commodities by total 2025 value across all states
  const byCommodity = d3.rollup(rows, v => d3.sum(v, d => d.cur), d => d.commodity);
  const topCommodities = Array.from(byCommodity.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(d => d[0]);
  const commoditySet = new Set(topCommodities);

  // Sort states by 2025 total trade volume (descending)
  const stateTotals = allState.filter(s => s.time === '2025')
    .map(s => ({ state: s.state, total: s.total_trade_activity }))
    .sort((a, b) => b.total - a.total);
  const sortedStates = stateTotals.map(s => s.state);

  // Build matrix
  const cells = [];
  for (const r of rows) {
    if (!commoditySet.has(r.commodity)) continue;
    if (!sortedStates.includes(r.state)) continue;
    let value;
    if (metric === 'pct') {
      if (r.base === 0) value = r.cur > 0 ? 1000 : 0;
      else value = (r.cur - r.base) / r.base * 100;
    } else {
      value = (r.cur - r.base) / 1e9; // $B
    }
    cells.push({
      state: r.state,
      commodity: r.commodity,
      base: r.base,
      cur: r.cur,
      value,
    });
  }

  // Layout
  const cellW = 38;
  const cellH = 20;
  const leftMargin = 130;
  const topMargin = 200;  // space for rotated commodity labels
  const w = leftMargin + topCommodities.length * cellW + 20;
  const h = topMargin + sortedStates.length * cellH + 20;

  // Color scale
  const values = cells.map(c => c.value);
  let colorScale;
  if (metric === 'pct') {
    const absMax = Math.min(300, d3.max(values, Math.abs) || 100);
    colorScale = d3.scaleDiverging(d3.interpolateRdBu).domain([-absMax, 0, absMax]);
  } else {
    const absMax = d3.max(values, Math.abs) || 1;
    colorScale = d3.scaleDiverging(d3.interpolateRdBu).domain([-absMax, 0, absMax]);
  }

  // Clear and rebuild
  const container = d3.select('#heatmap-scroll');
  container.select('svg').remove();

  const svg = container.append('svg').attr('width', w).attr('height', h);

  // Commodity labels (top, rotated)
  svg.selectAll('.commodity-label')
    .data(topCommodities)
    .enter()
    .append('text')
    .attr('class', 'commodity-label')
    .attr('transform', (d, i) => `translate(${leftMargin + i * cellW + cellW / 2},${topMargin - 8}) rotate(-55)`)
    .attr('text-anchor', 'start')
    .attr('fill', 'lavender')
    .attr('font-size', 11)
    .text(d => d.slice(4).trim().length > 25 ? d.slice(4, 29).trim() + '…' : d.slice(4).trim());

  // State labels (left)
  svg.selectAll('.state-label')
    .data(sortedStates)
    .enter()
    .append('text')
    .attr('class', 'state-label')
    .attr('x', leftMargin - 6)
    .attr('y', (d, i) => topMargin + i * cellH + cellH / 2 + 4)
    .attr('text-anchor', 'end')
    .attr('fill', 'lavender')
    .attr('font-size', 11)
    .text(d => d);

  // Cells
  const commodityIndex = Object.fromEntries(topCommodities.map((c, i) => [c, i]));
  const stateIndex = Object.fromEntries(sortedStates.map((s, i) => [s, i]));

  svg.selectAll('.cell')
    .data(cells)
    .enter()
    .append('rect')
    .attr('class', 'cell')
    .attr('x', d => leftMargin + commodityIndex[d.commodity] * cellW)
    .attr('y', d => topMargin + stateIndex[d.state] * cellH)
    .attr('width', cellW - 1)
    .attr('height', cellH - 1)
    .attr('fill', d => colorScale(d.value))
    .attr('stroke', 'rgba(0,0,0,0.3)')
    .on('mouseover', function (event, d) {
      tooltip.transition().duration(200).style('opacity', 0.95);
      const fmt = d3.format(',.0f');
      const baseB = (d.base / 1e9).toFixed(2);
      const curB = (d.cur / 1e9).toFixed(2);
      const change = metric === 'pct'
        ? (d.value >= 0 ? '+' : '') + d.value.toFixed(0) + '%'
        : (d.value >= 0 ? '+$' : '−$') + Math.abs(d.value).toFixed(2) + 'B';
      tooltip.html(
        `<strong>${d.state}</strong><br/>` +
        `${d.commodity}<br/>` +
        `${baselineYear}: $${baseB}B<br/>` +
        `2025: $${curB}B<br/>` +
        `<em>Change: ${change}</em>`
      )
        .style('left', (event.pageX + 14) + 'px')
        .style('top', (event.pageY - 12) + 'px');
    })
    .on('mouseout', function () {
      tooltip.transition().duration(300).style('opacity', 0);
    });
}
