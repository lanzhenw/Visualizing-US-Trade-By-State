import * as d3 from 'd3';
import { state } from './state.js';

let importBarChartData;
let allData;
let barTooltip;

export function initImportGraph(data) {
  allData = data;

  filterData('Texas', '2018');

  const w = 550;
  const h = 280;
  const padding = 30;

  barTooltip = d3.select('#importBarChart')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  const xScale = d3.scaleLinear()
    .domain([0, d3.max(importBarChartData, d => d.Imports)])
    .range([padding, w]);

  const svg = d3.select('#importBarChart')
    .append('svg')
    .attr('width', w)
    .attr('height', h)
    .attr('class', 'importsChart');

  svg.selectAll('rect')
    .data(importBarChartData)
    .enter()
    .append('rect')
    .attr('x', padding)
    .attr('y', (d, i) => i * (h / importBarChartData.length))
    .attr('height', () => (h / importBarChartData.length) - 5)
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
    .attr('text-anchor', 'left')
    .attr('y', (d, i) => 18 + i * (h / importBarChartData.length))
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
  statesData.sort((a, b) => b.Imports - a.Imports);
  importBarChartData = statesData.slice(0, 10);
}

export function updateImportGraph() {
  filterData(state.selectedState || 'Texas', state.selectedTime || '2018');

  const w = 550;
  const h = 280;
  const padding = 30;

  const xScale = d3.scaleLinear()
    .domain([0, d3.max(importBarChartData, d => d.Imports)])
    .range([padding, w]);

  const svg = d3.select('#importBarChart');

  svg.selectAll('rect')
    .data(importBarChartData)
    .transition().duration(1000)
    .attr('x', padding)
    .attr('y', (d, i) => i * (h / importBarChartData.length))
    .attr('height', () => (h / importBarChartData.length) - 5)
    .attr('width', d => xScale(d.Imports))
    .attr('fill', '#6B56D3')
    .attr('class', 'chartBar');

  svg.selectAll('text')
    .data(importBarChartData)
    .transition()
    .delay((d, i) => i * 50)
    .duration(2000)
    .text((d, i) => importBarChartData[i].Country)
    .attr('text-anchor', 'left')
    .attr('y', (d, i) => 18 + i * (h / importBarChartData.length))
    .attr('x', padding + 5)
    .attr('fill', 'white')
    .attr('class', 'chart-label');
}
