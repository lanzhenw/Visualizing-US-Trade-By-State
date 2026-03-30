/**
 * Fetches US trade data from the Census Bureau International Trade API
 * and generates CSV files compatible with the dashboard.
 *
 * API: https://api.census.gov/data/timeseries/intltrade/
 * Endpoints: exports/statenaics, imports/statenaics
 * Key param: time=YEAR-12 (December year-to-date = full year total)
 * No API key required.
 *
 * Usage: node scripts/fetch-trade-data.js
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'public', 'data', 'csv');

const API_BASE = 'https://api.census.gov/data/timeseries/intltrade';
const YEARS = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

// State abbreviation to full name mapping
const STATE_NAMES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'Dist of Columbia',
  FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois',
  IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana',
  ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota',
  MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada',
  NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York',
  NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma',
  OR: 'Oregon', PA: 'Pennsylvania', PR: 'Puerto Rico', RI: 'Rhode Island',
  SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas',
  UT: 'Utah', VT: 'Vermont', VA: 'Virginia', VI: 'US Virgin Islands',
  WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
};

// NAICS code to dashboard commodity name mapping
// The dashboard uses "CODE Description" format with title case
const NAICS_NAMES = {
  '111': '111 Agricultural Products',
  '112': '112 Livestock & Livestock Products',
  '113': '113 Forestry Products, Nesoi',
  '114': '114 Fish, Fresh/chilled/frozen & Other Marine Products',
  '115': '115 Products Supporting Agriculture & Forestry',
  '211': '211 Oil & Gas',
  '212': '212 Minerals & Ores',
  '311': '311 Food & Kindred Products',
  '312': '312 Beverages & Tobacco Products',
  '313': '313 Textiles & Fabrics',
  '314': '314 Textile Mill Products',
  '315': '315 Apparel & Accessories',
  '316': '316 Leather & Allied Products',
  '321': '321 Wood Products',
  '322': '322 Paper',
  '323': '323 Printed Matter And Related Products, Nesoi',
  '324': '324 Petroleum & Coal Products',
  '325': '325 Chemicals',
  '326': '326 Plastics & Rubber Products',
  '327': '327 Nonmetallic Mineral Products',
  '331': '331 Primary Metal Mfg',
  '332': '332 Fabricated Metal Products, Nesoi',
  '333': '333 Machinery, Except Electrical',
  '334': '334 Computer & Electronic Products',
  '335': '335 Electrical Equipment, Appliances & Components',
  '336': '336 Transportation Equipment',
  '337': '337 Furniture & Fixtures',
  '339': '339 Miscellaneous Manufactured Commodities',
  '910': '910 Waste And Scrap',
  '930': '930 Used Or Second-hand Merchandise',
  '980': '980 Goods Returned (exports For Canada Only)',
  '990': '990 Other Special Classification Provisions',
};

const VALID_STATES = Object.keys(STATE_NAMES);

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  if (res.status === 204) return null;
  return res.json();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatNumber(val) {
  return Number(val).toLocaleString('en-US');
}

function isRealCountry(ctyCode) {
  // Filter out regional groupings: codes with X, codes starting with 00, and total marker
  if (!ctyCode || ctyCode === '-') return false;
  if (ctyCode.includes('X')) return false;
  if (ctyCode.startsWith('00')) return false;
  return true;
}

function titleCase(str) {
  return str.replace(/\w\S*/g, txt =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

// ─── Fetch StateExportData.csv ────────────────────────────────────────────────
async function fetchStateExportData() {
  console.log('\n📦 Fetching State Export Data by Commodity...');
  const rows = ['commodity,state,time,country,total_exports_value'];

  for (const year of YEARS) {
    console.log(`  Year ${year}...`);
    const url = `${API_BASE}/exports/statenaics?get=STATE,NAICS,NAICS_LDESC,ALL_VAL_YR&time=${year}-12&COMM_LVL=NA3&CTY_CODE=-`;
    const data = await fetchJSON(url);
    if (!data) { console.log(`  ⚠ No data for ${year}`); continue; }

    for (let i = 1; i < data.length; i++) {
      const [stateAbbr, naics, , valYr] = data[i];
      if (!VALID_STATES.includes(stateAbbr)) continue;
      const stateName = STATE_NAMES[stateAbbr];
      const commodity = NAICS_NAMES[naics] || `${naics} Other`;
      rows.push(`${commodity},${stateName},${year},World Total,"${formatNumber(valYr)}"`);
    }
    await sleep(300);
  }

  writeFileSync(join(DATA_DIR, 'StateExportData.csv'), rows.join('\n'));
  console.log(`  ✓ Wrote ${rows.length - 1} rows`);
}

// ─── Fetch StateImportData.csv ────────────────────────────────────────────────
async function fetchStateImportData() {
  console.log('\n📦 Fetching State Import Data by Commodity...');
  const rows = ['commodity,state,time,country,total_import_values'];

  for (const year of YEARS) {
    console.log(`  Year ${year}...`);
    const url = `${API_BASE}/imports/statenaics?get=STATE,NAICS,NAICS_LDESC,GEN_VAL_YR&time=${year}-12&COMM_LVL=NA3&CTY_CODE=-`;
    const data = await fetchJSON(url);
    if (!data) { console.log(`  ⚠ No data for ${year}`); continue; }

    for (let i = 1; i < data.length; i++) {
      const [stateAbbr, naics, , valYr] = data[i];
      if (!VALID_STATES.includes(stateAbbr)) continue;
      const stateName = STATE_NAMES[stateAbbr];
      const commodity = NAICS_NAMES[naics] || `${naics} Other`;
      rows.push(`${commodity},${stateName},${year},World Total,"${formatNumber(valYr)}"`);
    }
    await sleep(300);
  }

  writeFileSync(join(DATA_DIR, 'StateImportData.csv'), rows.join('\n'));
  // Also write StateImportType.csv (same data, used by initial load)
  writeFileSync(join(DATA_DIR, 'StateImportType.csv'), rows.join('\n'));
  console.log(`  ✓ Wrote ${rows.length - 1} rows`);
}

// ─── Fetch ExportByCountry.csv ────────────────────────────────────────────────
async function fetchExportByCountry() {
  console.log('\n📦 Fetching Exports by Country per State...');
  const rows = ['State,Country,Time,Exports'];

  for (const year of YEARS) {
    console.log(`  Year ${year}...`);
    const url = `${API_BASE}/exports/statenaics?get=STATE,CTY_NAME,CTY_CODE,ALL_VAL_YR&time=${year}-12`;
    const data = await fetchJSON(url);
    if (!data) { console.log(`  ⚠ No data for ${year}`); continue; }

    for (let i = 1; i < data.length; i++) {
      const [stateAbbr, ctyName, ctyCode, valYr] = data[i];
      if (!VALID_STATES.includes(stateAbbr)) continue;
      if (!isRealCountry(ctyCode)) continue;
      if (!ctyName) continue;
      const stateName = STATE_NAMES[stateAbbr];
      const country = titleCase(ctyName);
      rows.push(`${stateName},${country},${year},"${formatNumber(valYr)}"`);
    }
    await sleep(500);
  }

  writeFileSync(join(DATA_DIR, 'ExportByCountry.csv'), rows.join('\n'));
  console.log(`  ✓ Wrote ${rows.length - 1} rows`);
}

// ─── Fetch ImportsByCountry.csv ───────────────────────────────────────────────
async function fetchImportsByCountry() {
  console.log('\n📦 Fetching Imports by Country per State...');
  const rows = ['State,Country,Time,Imports'];

  for (const year of YEARS) {
    console.log(`  Year ${year}...`);
    const url = `${API_BASE}/imports/statenaics?get=STATE,CTY_NAME,CTY_CODE,GEN_VAL_YR&time=${year}-12`;
    const data = await fetchJSON(url);
    if (!data) { console.log(`  ⚠ No data for ${year}`); continue; }

    for (let i = 1; i < data.length; i++) {
      const [stateAbbr, ctyName, ctyCode, valYr] = data[i];
      if (!VALID_STATES.includes(stateAbbr)) continue;
      if (!isRealCountry(ctyCode)) continue;
      if (!ctyName) continue;
      const stateName = STATE_NAMES[stateAbbr];
      const country = titleCase(ctyName);
      rows.push(`${stateName},${country},${year},"${formatNumber(valYr)}"`);
    }
    await sleep(500);
  }

  writeFileSync(join(DATA_DIR, 'ImportsByCountry.csv'), rows.join('\n'));
  console.log(`  ✓ Wrote ${rows.length - 1} rows`);
}

// ─── Fetch allState.csv ───────────────────────────────────────────────────────
async function fetchAllState() {
  console.log('\n📦 Fetching All-State summary data...');
  const rows = ['state,id,time,imports,exports,total_trade_activity,trade_balance'];

  for (const year of YEARS) {
    console.log(`  Year ${year}...`);

    // Fetch export totals per state
    const expUrl = `${API_BASE}/exports/statenaics?get=STATE,ALL_VAL_YR&time=${year}-12&CTY_CODE=-`;
    const expData = await fetchJSON(expUrl);

    // Fetch import totals per state
    const impUrl = `${API_BASE}/imports/statenaics?get=STATE,GEN_VAL_YR&time=${year}-12&CTY_CODE=-`;
    const impData = await fetchJSON(impUrl);

    if (!expData || !impData) { console.log(`  ⚠ No data for ${year}`); continue; }

    // Build lookup: stateAbbr -> export total
    const exportTotals = {};
    for (let i = 1; i < expData.length; i++) {
      const [stateAbbr, valYr] = expData[i];
      if (VALID_STATES.includes(stateAbbr)) {
        exportTotals[stateAbbr] = Number(valYr);
      }
    }

    // Build lookup: stateAbbr -> import total
    const importTotals = {};
    for (let i = 1; i < impData.length; i++) {
      const [stateAbbr, valYr] = impData[i];
      if (VALID_STATES.includes(stateAbbr)) {
        importTotals[stateAbbr] = Number(valYr);
      }
    }

    // Merge and write rows
    for (const abbr of VALID_STATES) {
      const exp = exportTotals[abbr] || 0;
      const imp = importTotals[abbr] || 0;
      const expB = +(exp / 1e9).toFixed(1);
      const impB = +(imp / 1e9).toFixed(1);
      const total = +(expB + impB).toFixed(1);
      const balance = +(expB - impB).toFixed(1);
      rows.push(`${STATE_NAMES[abbr]},${abbr},${year},${impB},${expB},${total},${balance}`);
    }

    await sleep(300);
  }

  writeFileSync(join(DATA_DIR, 'allState.csv'), rows.join('\n'));
  console.log(`  ✓ Wrote ${rows.length - 1} rows`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🇺🇸 Fetching US Trade Data from Census Bureau API');
  console.log(`   Years: ${YEARS[0]}-${YEARS[YEARS.length - 1]}`);
  console.log(`   Output: ${DATA_DIR}`);

  await fetchStateExportData();
  await fetchStateImportData();
  await fetchExportByCountry();
  await fetchImportsByCountry();
  await fetchAllState();

  console.log('\n✅ All data fetched successfully!');
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
