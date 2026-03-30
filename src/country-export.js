import * as d3 from 'd3';
import { state } from './state.js';

let exportBarChartData;
let allData;
let barTooltip;

export function initExportGraph(data) {
  allData = data;

  // Filter for default state/year
  filterData('Texas', '2018');

  const w = 550;
  const h = 280;
  const padding = 30;

  barTooltip = d3.select('#exportBarChart')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  const xScale = d3.scaleLinear()
    .domain([0, d3.max(exportBarChartData, d => d.Exports)])
    .range([padding, w]);

  const svg = d3.select('#exportBarChart')
    .append('svg')
    .attr('width', w)
    .attr('height', h)
    .attr('class', 'exportsChart');

  svg.selectAll('rect')
    .data(exportBarChartData)
    .enter()
    .append('rect')
    .attr('x', padding)
    .attr('y', (d, i) => i * (h / exportBarChartData.length))
    .attr('height', () => (h / exportBarChartData.length) - 5)
    .attr('width', d => xScale(d.Exports))
    .attr('fill', '#C85FE5')
    .attr('class', 'chartBar')
    .on('mouseover', function (event, d) {
      barTooltip.transition().duration(500).style('opacity', 0.9);
      const format = d3.format(',');
      const tip = '<strong>Total Exports to ' + d.Country + ':</strong> $' + format(d.Exports);
      barTooltip.html(tip)
        .style('left', event.pageX + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', function () {
      barTooltip.transition().duration(500).style('opacity', 0);
    });

  svg.selectAll('text')
    .data(exportBarChartData)
    .enter()
    .append('text')
    .text((d, i) => exportBarChartData[i].Country)
    .attr('text-anchor', 'left')
    .attr('y', (d, i) => 18 + i * (h / exportBarChartData.length))
    .attr('x', padding + 5)
    .attr('fill', 'white')
    .attr('class', 'chart-label');
}

function filterData(stateName, time) {
  let statesData = [];
  for (let i = 0; i < allData.length; i++) {
    if (allData[i].State === stateName && allData[i].Time === time && allData[i].Country !== 'World Total') {
      statesData.push(allData[i]);
    }
  }
  statesData.sort((a, b) => b.Exports - a.Exports);
  exportBarChartData = statesData.slice(0, 10);
}

export function updateExportGraph() {
  filterData(state.selectedState || 'Texas', state.selectedTime || '2018');

  const w = 550;
  const h = 280;
  const padding = 30;

  const xScale = d3.scaleLinear()
    .domain([0, d3.max(exportBarChartData, d => d.Exports)])
    .range([padding, w]);

  const svg = d3.select('#exportBarChart');

  svg.selectAll('rect')
    .data(exportBarChartData)
    .transition().duration(1000)
    .attr('x', padding)
    .attr('y', (d, i) => i * (h / exportBarChartData.length))
    .attr('height', () => (h / exportBarChartData.length) - 5)
    .attr('width', d => xScale(d.Exports))
    .attr('fill', '#C85FE5')
    .attr('class', 'chartBar');

  svg.selectAll('text')
    .data(exportBarChartData)
    .transition()
    .delay((d, i) => i * 50)
    .duration(2000)
    .text((d, i) => exportBarChartData[i].Country)
    .attr('text-anchor', 'left')
    .attr('y', (d, i) => 18 + i * (h / exportBarChartData.length))
    .attr('x', padding + 5)
    .attr('fill', 'white')
    .attr('class', 'chart-label');
}
