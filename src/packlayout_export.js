import * as d3 from 'd3';
import { state } from './state.js';
import { switchColor } from './colors.js';

let allData;
let packExpTooltip;

export function initExportPack(data) {
  allData = data;

  packExpTooltip = d3.select('#packLayout-export')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  const dataset = filterData(state.selectedState, state.selectedTime);
  renderPack(dataset);
}

function filterData(stateName, time) {
  const filters = { state: stateName || 'Texas', time: time || '2018' };
  return allData.filter(function (row) {
    return ['commodity', 'state', 'time', 'country', 'total_exports_value'].reduce(function (pass, column) {
      return pass && (!filters[column] || row[column] === filters[column]);
    }, true);
  });
}

function renderPack(dataset) {
  const exportValue = dataset.map(el => el.total_exports_value);
  const biggest = exportValue.slice().sort((a, b) => b - a).slice(0, state.numberOfLabels);

  const s = 410;
  const max = d3.max(exportValue);
  const linearscale = d3.scaleLinear().domain([0, max]).range([0, s]);

  const data = {
    name: 'Total',
    children: dataset.map(el => ({
      name: el.commodity,
      value: linearscale(el.total_exports_value),
      exportValue: el.total_exports_value,
      tag: biggest.includes(el.total_exports_value),
    })),
  };

  const packLayout = d3.pack().size([s, s]);
  const rootNode = d3.hierarchy(data).sum(d => d.value);
  packLayout(rootNode);

  const nodes = d3.select('#packLayout-export svg g')
    .selectAll('circle')
    .data(rootNode.descendants())
    .enter();

  nodes.append('circle')
    .style('fill', d => switchColor(d.data.name))
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('r', d => d.r)
    .on('mouseover', function (event, d) {
      const textCategory = d.data.name.slice(3).trim();
      const textValue = Math.round(d.data.exportValue / 10000000);
      if (d.data.name !== 'Total') {
        packExpTooltip.transition().duration(500).style('opacity', 0.9);
      }
      if (textValue) {
        packExpTooltip.html(textCategory + ', $' + textValue / 100 + ' B')
          .style('left', event.pageX + 'px')
          .style('top', event.pageY + 'px');
      }
    })
    .on('mouseout', function () {
      packExpTooltip.transition().duration(500).style('opacity', 0);
    });

  nodes.append('text')
    .attr('class', 'packlayout-export-label-name')
    .attr('dx', d => d.x - 40)
    .attr('dy', d => d.y)
    .text(d => d.data.tag ? d.data.name.slice(3).trim() : '');

  nodes.append('text')
    .attr('class', 'packlayout-export-label-number')
    .attr('dx', d => d.x - 36)
    .attr('dy', d => d.y + 18)
    .text(d => {
      const textValue = Math.round(d.data.exportValue / 10000000);
      return d.data.tag ? ' $' + textValue / 100 + ' Billion' : '';
    });
}

export function updateExportPack() {
  const dataset = filterData(state.selectedState, state.selectedTime);
  const exportValue = dataset.map(el => el.total_exports_value);
  const biggest = exportValue.slice().sort((a, b) => b - a).slice(0, state.numberOfLabels);

  const s = 410;
  const max = d3.max(exportValue);
  const linearscale = d3.scaleLinear().domain([0, max]).range([0, s]);

  const data = {
    name: 'Total',
    children: dataset.map(el => ({
      name: el.commodity,
      value: linearscale(el.total_exports_value),
      exportValue: el.total_exports_value,
      tag: biggest.includes(el.total_exports_value),
    })),
  };

  const packLayout = d3.pack().size([s, s]);
  const t = d3.transition().duration(1000);
  const t2 = d3.transition().duration(2000);
  const rootNode = d3.hierarchy(data).sum(d => d.value);

  const nodes = d3.select('#packLayout-export svg g')
    .selectAll('circle')
    .data(packLayout(rootNode).descendants());

  const textName = d3.select('#packLayout-export svg g')
    .selectAll('.packlayout-export-label-name')
    .data(packLayout(rootNode).descendants());

  const textNumber = d3.select('#packLayout-export svg g')
    .selectAll('.packlayout-export-label-number')
    .data(packLayout(rootNode).descendants());

  nodes.transition(t)
    .style('fill', d => switchColor(d.data.name))
    .attr('r', d => d.r)
    .attr('cx', d => d.x)
    .attr('cy', d => d.y);

  textName.transition(t2)
    .text(d => d.data.tag ? d.data.name.slice(3).trim() : '')
    .attr('dx', d => d.x - 40)
    .attr('dy', d => d.y);

  textNumber.transition(t2)
    .text(d => {
      const textValue = Math.round(d.data.exportValue / 10000000);
      return d.data.tag ? ' $' + textValue / 100 + ' Billion' : '';
    })
    .attr('dx', d => d.x - 36)
    .attr('dy', d => d.y + 18);
}
