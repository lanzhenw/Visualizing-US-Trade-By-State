import * as d3 from 'd3';
import { state } from './state.js';

const W = 550;
const H = 280;
const PAD = 30;

let importBarChartData;
let allData;
let barTooltip;
let svg;

export function initImportGraph(data) {
  allData = data;
  filterData(state.selectedState || 'Texas', state.selectedTime || '2025');

  barTooltip = d3.select('#importBarChart')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  svg = d3.select('#importBarChart')
    .append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .attr('class', 'importsChart');

  renderBars();
}

function renderBars() {
  const xScale = d3.scaleLinear()
    .domain([0, d3.max(importBarChartData, d => d.Imports)])
    .range([PAD, W]);

  const rowH = H / importBarChartData.length;

  svg.selectAll('rect')
    .data(importBarChartData)
    .enter()
    .append('rect')
    .attr('x', PAD)
    .attr('y', (d, i) => i * rowH)
    .attr('height', rowH - 5)
    .attr('width', d => xScale(d.Imports))
    .attr('fill', '#6B56D3')
    .attr('class', 'chartBar')
    .on('mouseover', function (event, d) {
      barTooltip.transition().duration(500).style('opacity', 0.9);
      const format = d3.format(',');
      const tip = '<strong>Total Imports from ' + d.Country + ':</strong> $' + format(d.Imports);
      barTooltip.html(tip)
        .style('left', event.pageX + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', function () {
      barTooltip.transition().duration(500).style('opacity', 0);
    });

  svg.selectAll('text')
    .data(importBarChartData)
    .enter()
    .append('text')
    .text((d, i) => importBarChartData[i].Country)
    .attr('text-anchor', 'start')
    .attr('y', (d, i) => 18 + i * rowH)
    .attr('x', PAD + 5)
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
  statesData.sort((a, b) => b.Imports - a.Imports);
  importBarChartData = statesData.slice(0, 10);
}

export function updateImportGraph() {
  filterData(state.selectedState || 'Texas', state.selectedTime || '2025');

  const xScale = d3.scaleLinear()
    .domain([0, d3.max(importBarChartData, d => d.Imports)])
    .range([PAD, W]);

  const rowH = H / importBarChartData.length;

  svg.selectAll('rect')
    .data(importBarChartData)
    .transition().duration(1000)
    .attr('x', PAD)
    .attr('y', (d, i) => i * rowH)
    .attr('height', rowH - 5)
    .attr('width', d => xScale(d.Imports))
    .attr('fill', '#6B56D3')
    .attr('class', 'chartBar');

  svg.selectAll('rect')
    .data(importBarChartData)
    .on('mouseover', function (event, d) {
      barTooltip.transition().duration(500).style('opacity', 0.9);
      const format = d3.format(',');
      const tip = '<strong>Total Imports from ' + d.Country + ':</strong> $' + format(d.Imports);
      barTooltip.html(tip)
        .style('left', event.pageX + 'px')
        .style('top', (event.pageY - 28) + 'px');
    });

  svg.selectAll('text')
    .data(importBarChartData)
    .transition()
    .delay((d, i) => i * 50)
    .duration(2000)
    .text((d, i) => importBarChartData[i].Country)
    .attr('text-anchor', 'start')
    .attr('y', (d, i) => 18 + i * rowH)
    .attr('x', PAD + 5)
    .attr('fill', 'white')
    .attr('class', 'chart-label');
}
