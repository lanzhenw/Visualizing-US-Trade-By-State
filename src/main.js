import { loadAllData } from './data.js';
import { initYearSelection } from './yearSelection.js';
import { initMap } from './usa.js';
import { initShowState } from './show-state.js';
import { initExportGraph } from './country-export.js';
import { initImportGraph } from './country-import.js';
import { initExportPack } from './packlayout_export.js';
import { initImportPack } from './packlayout_import.js';
import { initTradeVolume } from './barChart_tradevolume.js';

async function init() {
  const data = await loadAllData();

  initYearSelection();
  initMap(data.allState, data.geoData);
  initShowState();
  initExportGraph(data.exportByCountry);
  initImportGraph(data.importsByCountry);
  initExportPack(data.stateExportData);
  initImportPack(data.stateImportData);
  initTradeVolume(data.allState);
}

init();
