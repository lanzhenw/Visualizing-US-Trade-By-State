import * as d3 from 'd3';
import { state } from './state.js';

const W = 620;
const H = 43;

export function initShowState() {
  d3.select('#show-state')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  d3.select('#show-state g')
    .append('text')
    .text(state.selectedState + ',   ' + state.selectedTime)
    .attr('x', W / 2)
    .attr('y', H - 10)
    .attr('text-anchor', 'middle')
    .attr('font-size', '26px')
    .attr('fill', 'white')
    .attr('class', 'show-state-name');
}

export function updateShowState() {
  d3.select('#show-state text').remove();
  d3.select('#show-state g')
    .append('text')
    .attr('x', W / 2)
    .attr('y', H - 10)
    .attr('text-anchor', 'middle')
    .attr('fill', 'white')
    .attr('font-size', '26px')
    .attr('class', 'show-state-name')
    .text((state.selectedState || 'Texas') + ',   ' + (state.selectedTime || '2025'));
}
