import * as d3 from 'd3';
import { state } from './state.js';

export function initShowState() {
  d3.select('#show-state g')
    .append('text')
    .text(state.selectedState + ',   ' + state.selectedTime)
    .attr('x', 250)
    .attr('y', 25)
    .attr('font-size', '30px')
    .attr('fill', 'white')
    .attr('class', 'show-state-name')
    .attr('z-index', 20);
}

export function updateShowState() {
  d3.select('#show-state text').remove();
  d3.select('#show-state g')
    .append('text')
    .attr('x', 250)
    .attr('y', 25)
    .attr('fill', 'white')
    .attr('font-size', '30px')
    .attr('class', 'show-state-name')
    .attr('z-index', 20)
    .text((state.selectedState || 'Texas') + ',   ' + (state.selectedTime || '2018'));
}
