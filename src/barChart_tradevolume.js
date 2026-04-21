import * as d3 from 'd3';
import { state } from './state.js';

let allData;
const legendData = ['Total Exports', 'Total Imports'];
const margin = { top: 50, right: 10, bottom: 10, left: 105 };
const TOTAL_W = 432;
const TOTAL_H = 577;
const width = TOTAL_W - margin.right - margin.left;
const height = TOTAL_H - margin.top - margin.bottom;
const colors = ['#C85FE5', '#6B56D3'];

let svg, tooltip, xScale, yScale;

function getYearData() {
  return allData.filter(d => String(d.time) === state.selectedTime);
}

export function initTradeVolume(data) {
  allData = data;
  const yearData = getYearData();

  svg = d3.select('#bar')
    .append('svg')
    .attr('viewBox', `0 0 ${TOTAL_W} ${TOTAL_H}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  tooltip = d3.select('#bar')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  xScale = d3.scaleLinear()
    .domain([0, d3.max(yearData, d => d.total_trade_activity) * 1.05])
    .range([0, width]);

  yScale = d3.scaleBand()
    .range([0, height])
    .domain(yearData.map(d => d.state))
    .padding(1);

  svg.append('g')
    .attr('class', 'axisLabel')
    .call(d3.axisLeft(yScale))
    .selectAll('text')
    .data(yearData)
    .enter()
    .append('text')
    .text(d => d.state)
    .attr('fill', 'white')
    .attr('class', 'axisLabels');

  // Lines
  svg.selectAll('.trade-line')
    .data(yearData)
    .enter()
    .append('line')
    .attr('class', 'trade-line')
    .attr('x1', d => xScale(d.total_trade_activity))
    .attr('x2', xScale(0))
    .attr('y1', d => yScale(d.state))
    .attr('y2', d => yScale(d.state))
    .attr('stroke', 'white');

  // Import circles (positioned at total = imports + exports)
  svg.selectAll('.import-circle')
    .data(yearData)
    .enter()
    .append('circle')
    .attr('class', 'import-circle')
    .attr('cx', d => xScale(d.imports + d.exports))
    .attr('cy', d => yScale(d.state))
    .attr('r', 4)
    .style('fill', colors[1])
    .attr('stroke', colors[1])
    .on('mouseover', function (event, d) {
      tooltip.transition().duration(500).style('opacity', 0.9);
      tooltip.html('Total ' + d.state + ' Imports: $' + d.imports + ' B')
        .style('left', event.pageX + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', function () {
      tooltip.transition().duration(500).style('opacity', 0);
    });

  // Export circles
  svg.selectAll('.export-circle')
    .data(yearData)
    .enter()
    .append('circle')
    .attr('class', 'export-circle')
    .attr('cx', d => xScale(d.exports))
    .attr('cy', d => yScale(d.state))
    .attr('r', 4)
    .style('fill', colors[0])
    .attr('stroke', colors[0])
    .on('mouseover', function (event, d) {
      tooltip.transition().duration(500).style('opacity', 0.9);
      tooltip.html('Total ' + d.state + ' Exports: $' + d.exports + ' B')
        .style('left', event.pageX + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', function () {
      tooltip.transition().duration(500).style('opacity', 0);
    });

  // Legend
  svg.selectAll('.legend')
    .data(legendData)
    .enter()
    .append('circle')
    .attr('cx', width - 150)
    .attr('cy', (d, i) => height - 50 + (i * 25))
    .attr('r', 10)
    .style('fill', (d, i) => colors[i])
    .attr('class', 'legend');

  svg.selectAll('.textLabels')
    .data(legendData)
    .enter()
    .append('text')
    .text(d => d)
    .attr('class', 'textLabels')
    .attr('x', width - 135)
    .attr('y', (d, i) => height - 45 + (i * 25));
}

export function updateTradeVolume() {
  const yearData = getYearData();
  xScale.domain([0, d3.max(yearData, d => d.total_trade_activity) * 1.05]);

  svg.selectAll('.trade-line')
    .data(yearData)
    .transition().duration(500)
    .attr('x1', d => xScale(d.total_trade_activity))
    .attr('y1', d => yScale(d.state))
    .attr('y2', d => yScale(d.state));

  svg.selectAll('.import-circle')
    .data(yearData)
    .transition().duration(500)
    .attr('cx', d => xScale(d.imports + d.exports))
    .attr('cy', d => yScale(d.state));

  svg.selectAll('.import-circle')
    .data(yearData)
    .on('mouseover', function (event, d) {
      tooltip.transition().duration(500).style('opacity', 0.9);
      tooltip.html('Total ' + d.state + ' Imports: $' + d.imports + ' B')
        .style('left', event.pageX + 'px')
        .style('top', (event.pageY - 28) + 'px');
    });

  svg.selectAll('.export-circle')
    .data(yearData)
    .transition().duration(500)
    .attr('cx', d => xScale(d.exports))
    .attr('cy', d => yScale(d.state));

  svg.selectAll('.export-circle')
    .data(yearData)
    .on('mouseover', function (event, d) {
      tooltip.transition().duration(500).style('opacity', 0.9);
      tooltip.html('Total ' + d.state + ' Exports: $' + d.exports + ' B')
        .style('left', event.pageX + 'px')
        .style('top', (event.pageY - 28) + 'px');
    });
}
