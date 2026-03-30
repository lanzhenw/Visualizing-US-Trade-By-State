import * as d3 from 'd3';
import { state, setState } from './state.js';
import { updateExportGraph } from './country-export.js';
import { updateImportGraph } from './country-import.js';
import { updateExportPack } from './packlayout_export.js';
import { updateImportPack } from './packlayout_import.js';
import { updateShowState } from './show-state.js';

const width = 960 * 0.7;
const height = 500 * 0.95;
const mapColors = ['#ffc7ff', '#eab2ef', '#d59de0', '#bf8ad1', '#a976c2', '#9364b4', '#7d52a6', '#654098', '#4d308b'];

const path = d3.geoPath()
  .projection(d3.geoAlbersUsa().translate([width / 2, height / 2]).scale([880]));

const svg = d3.select('#themap').append('svg')
  .attr('width', width)
  .attr('height', height);

const g = svg.append('g');

const mapColor = d3.scaleQuantize().range(mapColors);

let allData;
let geoFeatures;

export function initMap(allStateData, geoData) {
  allData = allStateData;
  geoFeatures = geoData.features;

  // Filter data for the selected year
  const yearData = allData.filter(d => String(d.time) === state.selectedTime);

  mapColor.domain([
    d3.min(yearData, d => d.total_trade_activity),
    d3.max(yearData, d => d.total_trade_activity),
  ]);

  // Merge CSV data into GeoJSON features
  mergeDataIntoGeo(yearData);

  // Bind data and create paths
  svg.selectAll('path')
    .data(geoFeatures)
    .enter()
    .append('path')
    .attr('d', path)
    .style('stroke', 'grey')
    .style('fill', function (d) {
      const value = d.properties.value;
      return value ? mapColor(value) : 'grey';
    })
    .on('click', function (event, d) {
      d3.select('.selected').classed('selected', false);
      d3.select(this).classed('selected', true);

      setState({ selectedState: d.properties.name });
      updateExportGraph();
      updateImportGraph();
      updateExportPack();
      updateImportPack();
      updateShowState();
    });

  // Update map title
  d3.select('.maptitle').text('Total Trade Volume in ' + state.selectedTime);

  buildMapLegend();
}

function mergeDataIntoGeo(yearData) {
  for (let i = 0; i < yearData.length; i++) {
    const dataState = yearData[i].state;
    const dataValue = yearData[i].total_trade_activity;
    for (let j = 0; j < geoFeatures.length; j++) {
      if (dataState === geoFeatures[j].properties.name) {
        geoFeatures[j].properties.value = dataValue;
        break;
      }
    }
  }
}

export function updateMap() {
  const yearData = allData.filter(d => String(d.time) === state.selectedTime);

  mapColor.domain([
    d3.min(yearData, d => d.total_trade_activity),
    d3.max(yearData, d => d.total_trade_activity),
  ]);

  mergeDataIntoGeo(yearData);

  svg.selectAll('path')
    .transition().duration(500)
    .style('fill', function (d) {
      const value = d.properties.value;
      return value ? mapColor(value) : 'grey';
    });

  d3.select('.maptitle').text('Total Trade Volume in ' + state.selectedTime);
}

function buildMapLegend() {
  const w = 280;
  const h = 50;

  const legend = d3.select('#themap')
    .append('svg')
    .attr('width', w)
    .attr('height', h)
    .attr('class', 'mapLegend');

  legend.selectAll('rect')
    .data(mapColors)
    .enter()
    .append('rect')
    .attr('x', (d, i) => i * 30)
    .attr('y', h - 10)
    .attr('height', 10)
    .attr('width', 30)
    .attr('fill', (d, i) => mapColors[i]);

  legend.append('text')
    .text('Trade Volume')
    .attr('class', 'legend-label')
    .attr('x', (mapColors.length * 30) / 3)
    .attr('y', h - 25);

  legend.append('text')
    .text('Low')
    .attr('class', 'legend-label')
    .attr('x', 0)
    .attr('y', h - 15)
    .style('font-size', '11px');

  legend.append('text')
    .text('High')
    .attr('class', 'legend-label')
    .attr('x', (mapColors.length * 30) - 25)
    .attr('y', h - 15)
    .style('font-size', '11px');
}
