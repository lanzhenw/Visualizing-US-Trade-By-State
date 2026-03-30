import * as d3 from 'd3';
import { setState } from './state.js';
import { updateExportPack } from './packlayout_export.js';
import { updateImportPack } from './packlayout_import.js';
import { updateExportGraph } from './country-export.js';
import { updateImportGraph } from './country-import.js';
import { updateShowState } from './show-state.js';
import { updateMap } from './usa.js';
import { updateTradeVolume } from './barChart_tradevolume.js';

export function initYearSelection() {
  const slider = document.getElementById('myRange');

  d3.select(slider)
    .on('input', function () {
      const selectedTime = String(this.value);
      setState({ selectedTime });
      updateExportPack();
      updateImportPack();
      updateImportGraph();
      updateExportGraph();
      updateShowState();
      updateMap();
      updateTradeVolume();
    });
}
