import { loadAllData } from './data.js';
import { initYearSelection } from './yearSelection.js';
import { initMap, redrawMap } from './usa.js';
import { initShowState } from './show-state.js';
import { initExportGraph } from './country-export.js';
import { initImportGraph } from './country-import.js';
import { initExportPack } from './packlayout_export.js';
import { initImportPack } from './packlayout_import.js';
import { initTradeVolume } from './barChart_tradevolume.js';
import { observeSize } from './responsive.js';
import { initTabs } from './tabs.js';
import { initInsights } from './insights.js';
import { initChinaMexico } from './china-mexico.js';
import { initHeatmap } from './heatmap.js';

async function init() {
  const data = await loadAllData();

  initTabs();

  // Dashboard tab
  initYearSelection();
  initMap(data.allState, data.geoData);
  initShowState();
  initExportGraph(data.exportByCountry);
  initImportGraph(data.importsByCountry);
  initExportPack(data.stateExportData);
  initImportPack(data.stateImportData);
  initTradeVolume(data.allState);
  initInsights();

  // Map needs real responsive behavior (projection.fitSize)
  observeSize('#themap', redrawMap);

  // Eagerly init the other tabs — their SVGs use viewBox so they render
  // correctly regardless of container size, and observeSize in china-mexico
  // will fire when the tab becomes visible (ResizeObserver catches 0→N).
  initChinaMexico(data);
  initHeatmap(data);
}

init();
