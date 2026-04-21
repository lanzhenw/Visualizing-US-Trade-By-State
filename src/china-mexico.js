import * as d3 from 'd3';
import { observeSize } from './responsive.js';

export function initChinaMexico(allData) {
  const { importsByCountry, geoData } = allData;

  // Build state -> {chinaDelta, mexicoDelta, china16, china25, mex16, mex25} for 2016 & 2025
  const stateRecord = {};
  for (const row of importsByCountry) {
    if (row.Country !== 'China' && row.Country !== 'Mexico') continue;
    if (row.Time !== '2016' && row.Time !== '2025') continue;
    if (!stateRecord[row.State]) {
      stateRecord[row.State] = { china16: 0, china25: 0, mex16: 0, mex25: 0 };
    }
    const rec = stateRecord[row.State];
    const val = row.Imports;
    if (row.Country === 'China' && row.Time === '2016') rec.china16 += val;
    else if (row.Country === 'China' && row.Time === '2025') rec.china25 += val;
    else if (row.Country === 'Mexico' && row.Time === '2016') rec.mex16 += val;
    else if (row.Country === 'Mexico' && row.Time === '2025') rec.mex25 += val;
  }

  const states = Object.entries(stateRecord).map(([state, r]) => {
    const chinaDelta = (r.china25 - r.china16) / 1e9; // to $B
    const mexicoDelta = (r.mex25 - r.mex16) / 1e9;
    return {
      state,
      chinaDelta,
      mexicoDelta,
      china16: r.china16 / 1e9,
      china25: r.china25 / 1e9,
      mex16: r.mex16 / 1e9,
      mex25: r.mex25 / 1e9,
      substitution: mexicoDelta - chinaDelta,
    };
  }).filter(s => Math.abs(s.chinaDelta) > 0.1 || Math.abs(s.mexicoDelta) > 0.1);

  renderSubstitutionMap(states, geoData);
  renderSubstitutionBars(states);
  renderShareTrend(importsByCountry);
}

function renderSubstitutionMap(states, geoData) {
  const byName = Object.fromEntries(states.map(s => [s.state, s]));
  const scores = states.map(s => s.substitution);
  // Diverging scale needs monotonic domain [negative, 0, positive]. Almost all
  // substitution scores are positive (Mexico gained more than China lost in most
  // states), so clamp the negative end to ensure ordering.
  const minVal = Math.min(-0.5, d3.min(scores));
  const maxVal = Math.max(0.5, d3.max(scores));
  const color = d3.scaleDiverging(d3.interpolateRdYlGn).domain([minVal, 0, maxVal]);

  const container = document.getElementById('sub-map');
  const svg = d3.select(container).append('svg')
    .attr('preserveAspectRatio', 'xMidYMid meet');
  const g = svg.append('g');

  const tooltip = d3.select(container)
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  g.selectAll('path')
    .data(geoData.features)
    .enter()
    .append('path')
    .style('stroke', '#333')
    .style('fill', d => {
      const s = byName[d.properties.name];
      return s ? color(s.substitution) : '#222';
    })
    .on('mouseover', function (event, d) {
      const s = byName[d.properties.name];
      if (!s) return;
      tooltip.transition().duration(300).style('opacity', 0.95);
      const fmt = n => (n >= 0 ? '+$' : '−$') + Math.abs(n).toFixed(1) + 'B';
      tooltip.html(
        `<strong>${d.properties.name}</strong><br/>` +
        `China imports: $${s.china16.toFixed(1)}B → $${s.china25.toFixed(1)}B (${fmt(s.chinaDelta)})<br/>` +
        `Mexico imports: $${s.mex16.toFixed(1)}B → $${s.mex25.toFixed(1)}B (${fmt(s.mexicoDelta)})<br/>` +
        `<em>Substitution: ${fmt(s.substitution)}</em>`
      )
        .style('left', event.pageX + 'px')
        .style('top', (event.pageY - 20) + 'px');
    })
    .on('mouseout', function () {
      tooltip.transition().duration(300).style('opacity', 0);
    });

  observeSize(container, ({ width, height }) => {
    svg.attr('viewBox', `0 0 ${width} ${height}`)
       .attr('width', width).attr('height', height);
    const projection = d3.geoAlbersUsa().fitSize([width, height], geoData);
    const path = d3.geoPath().projection(projection);
    g.selectAll('path').attr('d', path);
  });
}

function renderSubstitutionBars(states) {
  const top = states
    .slice()
    .sort((a, b) => b.substitution - a.substitution)
    .slice(0, 15);

  const W = 500, H = 420;
  const margin = { top: 10, right: 10, bottom: 30, left: 80 };
  const w = W - margin.left - margin.right;
  const h = H - margin.top - margin.bottom;

  const svg = d3.select('#sub-bars').append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const maxAbs = d3.max(top, d => Math.max(Math.abs(d.chinaDelta), Math.abs(d.mexicoDelta)));
  const x = d3.scaleLinear().domain([-maxAbs, maxAbs]).range([0, w]);
  const y = d3.scaleBand().domain(top.map(d => d.state)).range([0, h]).padding(0.25);

  // Center axis line
  g.append('line')
    .attr('x1', x(0)).attr('x2', x(0))
    .attr('y1', 0).attr('y2', h)
    .attr('stroke', '#666')
    .attr('stroke-dasharray', '2,2');

  // China loss bars (left side)
  g.selectAll('.china-bar')
    .data(top)
    .enter()
    .append('rect')
    .attr('class', 'china-bar')
    .attr('x', d => d.chinaDelta < 0 ? x(d.chinaDelta) : x(0))
    .attr('y', d => y(d.state))
    .attr('width', d => Math.abs(x(d.chinaDelta) - x(0)))
    .attr('height', y.bandwidth())
    .attr('fill', '#d73027')
    .append('title')
    .text(d => `${d.state}: China imports ${d.chinaDelta >= 0 ? '+' : '−'}$${Math.abs(d.chinaDelta).toFixed(1)}B`);

  // Mexico gain bars (right side)
  g.selectAll('.mex-bar')
    .data(top)
    .enter()
    .append('rect')
    .attr('class', 'mex-bar')
    .attr('x', d => d.mexicoDelta > 0 ? x(0) : x(d.mexicoDelta))
    .attr('y', d => y(d.state))
    .attr('width', d => Math.abs(x(d.mexicoDelta) - x(0)))
    .attr('height', y.bandwidth())
    .attr('fill', '#1a9850')
    .append('title')
    .text(d => `${d.state}: Mexico imports +$${d.mexicoDelta.toFixed(1)}B`);

  // State labels
  g.selectAll('.state-label')
    .data(top)
    .enter()
    .append('text')
    .attr('class', 'state-label')
    .attr('x', -4)
    .attr('y', d => y(d.state) + y.bandwidth() / 2 + 4)
    .attr('text-anchor', 'end')
    .attr('fill', 'lavender')
    .attr('font-size', 11)
    .text(d => d.state);

  // X axis
  g.append('g')
    .attr('transform', `translate(0,${h})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat(d => (d >= 0 ? '+' : '−') + '$' + Math.abs(d) + 'B'))
    .call(sel => sel.selectAll('text').attr('fill', 'lavender'))
    .call(sel => sel.selectAll('line, path').attr('stroke', '#666'));

  // Legend
  const legend = g.append('g').attr('transform', `translate(${w - 180},-4)`);
  legend.append('rect').attr('width', 12).attr('height', 12).attr('fill', '#d73027');
  legend.append('text').attr('x', 18).attr('y', 10).attr('fill', 'lavender').attr('font-size', 11).text('China loss');
  legend.append('rect').attr('x', 90).attr('width', 12).attr('height', 12).attr('fill', '#1a9850');
  legend.append('text').attr('x', 108).attr('y', 10).attr('fill', 'lavender').attr('font-size', 11).text('Mexico gain');
}

function renderShareTrend(importsByCountry) {
  // Compute yearly US-wide share of China and Mexico imports
  const byYear = {};
  for (const row of importsByCountry) {
    const year = +row.Time;
    if (!year || isNaN(year)) continue;
    if (!byYear[year]) byYear[year] = { total: 0, china: 0, mex: 0 };
    byYear[year].total += row.Imports;
    if (row.Country === 'China') byYear[year].china += row.Imports;
    else if (row.Country === 'Mexico') byYear[year].mex += row.Imports;
  }
  const years = Object.keys(byYear).map(Number).sort((a, b) => a - b);
  const series = years.map(y => ({
    year: y,
    china: byYear[y].china / byYear[y].total * 100,
    mex: byYear[y].mex / byYear[y].total * 100,
  }));

  const W = 900, H = 280;
  const margin = { top: 20, right: 100, bottom: 36, left: 50 };
  const w = W - margin.left - margin.right;
  const h = H - margin.top - margin.bottom;

  const svg = d3.select('#sub-trend').append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain(d3.extent(years)).range([0, w]);
  const y = d3.scaleLinear().domain([0, d3.max(series, d => Math.max(d.china, d.mex)) * 1.1]).range([h, 0]);

  // Axes
  g.append('g')
    .attr('transform', `translate(0,${h})`)
    .call(d3.axisBottom(x).tickFormat(d3.format('d')))
    .call(sel => sel.selectAll('text').attr('fill', 'lavender'))
    .call(sel => sel.selectAll('line, path').attr('stroke', '#666'));
  g.append('g')
    .call(d3.axisLeft(y).tickFormat(d => d + '%'))
    .call(sel => sel.selectAll('text').attr('fill', 'lavender'))
    .call(sel => sel.selectAll('line, path').attr('stroke', '#666'));

  // Lines
  const lineChina = d3.line().x(d => x(d.year)).y(d => y(d.china));
  const lineMex = d3.line().x(d => x(d.year)).y(d => y(d.mex));

  g.append('path').datum(series).attr('fill', 'none').attr('stroke', '#d73027').attr('stroke-width', 2.5).attr('d', lineChina);
  g.append('path').datum(series).attr('fill', 'none').attr('stroke', '#1a9850').attr('stroke-width', 2.5).attr('d', lineMex);

  // Points
  g.selectAll('.china-pt').data(series).enter().append('circle')
    .attr('cx', d => x(d.year)).attr('cy', d => y(d.china)).attr('r', 3).attr('fill', '#d73027')
    .append('title').text(d => `${d.year}: China ${d.china.toFixed(1)}%`);
  g.selectAll('.mex-pt').data(series).enter().append('circle')
    .attr('cx', d => x(d.year)).attr('cy', d => y(d.mex)).attr('r', 3).attr('fill', '#1a9850')
    .append('title').text(d => `${d.year}: Mexico ${d.mex.toFixed(1)}%`);

  // Labels on right
  const last = series[series.length - 1];
  g.append('text').attr('x', x(last.year) + 8).attr('y', y(last.china) + 4)
    .attr('fill', '#d73027').attr('font-size', 12).attr('font-weight', 'bold').text(`China ${last.china.toFixed(1)}%`);
  g.append('text').attr('x', x(last.year) + 8).attr('y', y(last.mex) + 4)
    .attr('fill', '#1a9850').attr('font-size', 12).attr('font-weight', 'bold').text(`Mexico ${last.mex.toFixed(1)}%`);
}
