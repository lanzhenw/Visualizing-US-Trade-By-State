import * as d3 from 'd3';

let cachedData = null;

function parseExportByCountry(d) {
  d.Exports = parseFloat(d.Exports.replace(/,/g, ''));
  d.Time = String(d.Time).trim();
  return d;
}

function parseImportsByCountry(d) {
  d.Imports = parseFloat(d.Imports.replace(/,/g, ''));
  d.Time = String(d.Time).trim();
  return d;
}

function parseExportData(d) {
  d.total_exports_value = parseInt(d.total_exports_value.replace(/,/g, ''), 10);
  return d;
}

function parseImportData(d) {
  d.total_import_values = parseInt(d.total_import_values.replace(/,/g, ''), 10);
  return d;
}

function parseAllState(d) {
  d.total_trade_activity = +d.total_trade_activity;
  // Support both old format (import_2018/export_2018) and new format (imports/exports)
  if (d.imports !== undefined) {
    d.imports = +d.imports;
    d.exports = +d.exports;
  } else if (d.import_2018 !== undefined) {
    d.imports = +d.import_2018;
    d.exports = +d.export_2018;
  }
  d.trade_balance = +d.trade_balance;
  return d;
}

export async function loadAllData() {
  if (cachedData) return cachedData;

  const [exportByCountry, importsByCountry, stateExportData, stateImportData, allState, geoData] = await Promise.all([
    d3.csv('./data/csv/ExportByCountry.csv', parseExportByCountry),
    d3.csv('./data/csv/ImportsByCountry.csv', parseImportsByCountry),
    d3.csv('./data/csv/StateExportData.csv', parseExportData),
    d3.csv('./data/csv/StateImportData.csv', parseImportData),
    d3.csv('./data/csv/allState.csv', parseAllState),
    d3.json('./data/json/us-states.json'),
  ]);

  cachedData = { exportByCountry, importsByCountry, stateExportData, stateImportData, allState, geoData };
  return cachedData;
}
