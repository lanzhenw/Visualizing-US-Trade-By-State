const INSIGHTS = [
  // === 10 macro shifts, 2016 → 2025 ===
  {
    period: '2016-2025',
    title: 'China imports collapsed; Mexico became #1',
    headline: '21.9% → 9.2%',
    body: "China's share of US imports fell from 21.9% to 9.2% while Mexico rose from 13.8% to 16.3%. In absolute terms: China $459B → $300B (−35%); Mexico $290B → $532B (+84%). Two-step decline: a dip during 2018-19 Section 301 tariffs ($535B → $445B), then a free-fall in 2025 ($434B → $300B) aligned with Trump II's tariff reinstatement.",
    tags: ['China', 'Mexico', 'Tariffs'],
  },
  {
    period: '2016-2025',
    title: 'Texas became an energy superpower',
    headline: '+$401B total trade',
    body: "Texas oil & gas exports went from $13.9B (2016) → $161B (2022 peak) → $137B (2025) — nearly 10×. Petroleum products doubled to $68B. The post-2015 crude-export-ban repeal + Permian Basin + Gulf Coast LNG terminals combined for the largest absolute trade gain of any state. TX total trade: $460B → $862B.",
    tags: ['Texas', 'Oil & Gas', 'LNG'],
  },
  {
    period: '2016-2025',
    title: 'Taiwan imports exploded',
    headline: '+418% ($39B → $200B)',
    body: "Semiconductor dependence made visible. US imports of Computer & Electronic Products jumped from $372B to $720B (+94%). Taiwan is now the 4th-largest supplier to the US despite no free-trade deal. This is TSMC/ASE packaging flowing into Apple, Nvidia, and AMD supply chains.",
    tags: ['Taiwan', 'Semiconductors'],
  },
  {
    period: '2016-2025',
    title: 'Vietnam is the clearest China+1 story',
    headline: '+360% ($42B → $193B)',
    body: "Every major importing state diversified to Vietnam in parallel: California $11B → $56B, Illinois $3B → $22B, Tennessee $2B → $12B, Kentucky $0.5B → $4.7B (9×). Thailand (+210%), India (+126%), and Malaysia (+61%) tell the same rerouting story.",
    tags: ['Vietnam', 'Supply Chain'],
  },
  {
    period: '2016-2025',
    title: 'New Mexico had the fastest % growth of any state',
    headline: '+366%',
    body: "Computer & Electronic Products alone went $2.1B → $12.9B — the semiconductor corridor spilling from Phoenix (TSMC/Intel) into Rio Rancho (Intel Fab 11X). Plus Permian oil crossing the TX/NM border. The smallest trading state by volume had the biggest relative jump.",
    tags: ['New Mexico', 'Semiconductors'],
  },
  {
    period: '2016-2025',
    title: 'Indiana became a pharma powerhouse',
    headline: '+163% ($84B → $222B)',
    body: "Chemicals exports tripled from $8.7B → $33.8B — Eli Lilly's GLP-1 franchise (Mounjaro/Zepbound), which didn't exist in 2016. Indiana jumped from ~#11 to #6 in total state trade, and had the largest % jump in imports from Switzerland ($1.3B → $9.2B) — pharma intermediates + Lonza contract manufacturing.",
    tags: ['Indiana', 'Pharma'],
  },
  {
    period: '2016-2025',
    title: 'Arizona rode the semiconductor wave',
    headline: '+145% ($42B → $102B)',
    body: "Computer & Electronic Products exports +251% ($5.6B → $19.6B) as TSMC Fab 21 (Phoenix) and Intel Ocotillo came online. AZ's Mexico imports also surged +88%, showing integrated Sonora-Arizona auto + electronics manufacturing.",
    tags: ['Arizona', 'Semiconductors', 'CHIPS Act'],
  },
  {
    period: '2016-2025',
    title: "Louisiana became America's LNG terminal",
    headline: 'Oil & Gas exports +1,552%',
    body: "Oil & Gas exports: $2B → $33B. Louisiana's trade surplus jumped from +$16B to +$60B — the largest surplus improvement of any state. Cameron LNG, Sabine Pass expansions, and Plaquemines LNG came online during the window.",
    tags: ['Louisiana', 'LNG', 'Energy'],
  },
  {
    period: '2016-2025',
    title: 'Industrial heartland deficits blew out',
    headline: 'Reshoring rhetoric vs reality',
    body: "States associated with US manufacturing revival saw their trade deficits expand: Illinois −$62B → −$131B, Indiana −$15B → −$84B, Pennsylvania −$41B → −$84B, Kentucky −$11B → −$46B, North Carolina −$17B → −$58B. Finished-goods exports grew, but intermediate-component imports (from Mexico, Vietnam, Ireland) grew faster.",
    tags: ['Trade Deficit', 'Manufacturing'],
  },
  {
    period: '2016-2025',
    title: 'Sanctions visibly reshaped sourcing',
    headline: 'Russia −74%, Venezuela −66%',
    body: "Russia imports fell from $14.5B → $3.8B, Venezuela −66%, Saudi Arabia −38%. Meanwhile Canada crude (+38%) and Guyana offshore oil absorbed the gap. Pure 2022 Ukraine invasion + 2017 Venezuela PDVSA sanctions showing up in state-level shipments.",
    tags: ['Sanctions', 'Energy'],
  },

  // === 5 post-pandemic shifts, 2022 → 2025 ===
  {
    period: '2022-2025',
    title: 'The 2025 China cliff — tariff shock, quantified',
    headline: '$434B → $300B in one year',
    body: "China import share declined gradually from 2022-2024 (17.1% → 14.4% → 13.9%) but crashed to 9.2% in 2025 — a $134B single-year drop. No other trend in the dataset is this sharp. This is the Trump II tariff regime hitting between the 2024 and 2025 data pulls.",
    tags: ['China', 'Tariffs'],
  },
  {
    period: '2022-2025',
    title: 'Louisiana LNG peaked in 2022 and cooled',
    headline: '$123B → $93B exports',
    body: "Louisiana exports: $123B (2022) → $99B → $87B → $93B (2025) — down 24% from peak. The post-Ukraine European LNG panic buy-up ended, and the Biden LNG permit pause (Jan 2024) shows up here. Biggest 2022→2025 decline among top-trading states.",
    tags: ['Louisiana', 'LNG'],
  },
  {
    period: '2022-2025',
    title: 'Washington State imports cratered',
    headline: '−25% ($75B → $56B)',
    body: "Boeing's 737 MAX supply-chain issues + decoupling from China (WA's #1 partner, largely aircraft components) + trans-Pacific container traffic shifting from Seattle/Tacoma to LA/LB and East Coast ports.",
    tags: ['Washington', 'Aerospace', 'Ports'],
  },
  {
    period: '2022-2025',
    title: 'Arizona is the fastest-growing big exporter',
    headline: '+63% ($27B → $44B)',
    body: "The cleanest semiconductor-reshoring story in the data. It happened after the CHIPS Act passed (Aug 2022) and maps directly to TSMC Fab 21 Phase 1 ramp + Intel 18A samples.",
    tags: ['Arizona', 'CHIPS Act'],
  },
  {
    period: '2022-2025',
    title: 'Nearshoring is quantified, not hype',
    headline: 'TX: Mexico imports +120%',
    body: "Texas imports from Mexico went $81B → $177B (+120%) while TX imports from China dropped 24%. Georgia Mexico imports +263% ($6.5B → $23.5B). Kentucky Mexico imports +103%. The substitution is 1:1 visible at state level — Mexico is absorbing what China is losing.",
    tags: ['Nearshoring', 'Mexico'],
  },
];

export function initInsights() {
  const container = document.getElementById('insights');
  if (!container) return;

  container.innerHTML = INSIGHTS.map(ins => `
    <div class="insight-card" data-period="${ins.period}">
      <div class="insight-period">${ins.period === '2016-2025' ? 'Macro • 2016 → 2025' : 'Post-pandemic • 2022 → 2025'}</div>
      <h3 class="insight-title">${escapeHtml(ins.title)}</h3>
      <div class="insight-headline">${escapeHtml(ins.headline)}</div>
      <p class="insight-body">${escapeHtml(ins.body)}</p>
      <div class="insight-tags">${ins.tags.map(t => `<span class="insight-tag">${escapeHtml(t)}</span>`).join('')}</div>
    </div>
  `).join('');

  // Wire filter buttons
  document.querySelectorAll('.insights-filters button').forEach(btn => {
    btn.addEventListener('click', () => {
      const period = btn.dataset.period;
      document.querySelectorAll('.insights-filters button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.insight-card').forEach(card => {
        const show = period === 'all' || card.dataset.period === period;
        card.classList.toggle('hidden', !show);
      });
    });
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
