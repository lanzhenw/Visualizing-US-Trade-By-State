const expColors = [
  '#ae3871', '#3e40d3', '#df6fa3', '#4e1ab2', '#e53296',
  '#5f8ddb', '#7a28d1', '#7a2255', '#9251f2', '#752063',
  '#4d62ea', '#b93497', '#6a7ee8', '#e04eca', '#445ba7',
  '#d851ec', '#313380', '#e78bd7', '#37149a', '#b390e0',
  '#48218e', '#bb6fce', '#502a69', '#aa3dcf', '#7a53a0',
  '#7231b8', '#a34e97', '#574db8', '#682278', '#a16de7',
  '#9131a7'
];

// Map NAICS 3-digit codes to colors.
// Uses specific hex for key commodities, expColors array for the rest.
const COMMODITY_COLORS = {
  '111': '#9221ac',
  '112': '#d5c3fc',
  '113': expColors[2],
  '114': expColors[3],
  '211': '#714fdb',
  '212': expColors[5],
  '311': expColors[6],
  '312': '#a085de',
  '313': expColors[8],
  '314': expColors[9],
  '315': expColors[10],
  '316': expColors[11],
  '321': expColors[12],
  '322': expColors[13],
  '323': expColors[14],
  '324': expColors[15],
  '325': '#4d308b',
  '326': expColors[17],
  '327': expColors[18],
  '331': expColors[19],
  '332': expColors[20],
  '333': expColors[21],
  '334': expColors[22],
  '335': expColors[23],
  '336': expColors[24],
  '337': expColors[25],
  '339': expColors[26],
  '910': expColors[27],
  '930': expColors[28],
  '980': expColors[29],
  '990': expColors[30],
};

// Match on NAICS code prefix (first 3 chars) so it works with
// both old format ("111 Agricultural Products") and new API format
export function switchColor(commodity) {
  const code = commodity.slice(0, 3);
  return COMMODITY_COLORS[code] || 'rgba(0, 0, 0, 0)';
}
