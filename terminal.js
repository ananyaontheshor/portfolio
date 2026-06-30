// === terminal.js ===
// a genuinely functional command interface. every command listed in `help` actually does something.
(function(){
  const screen = document.getElementById('console-screen');
  const input = document.getElementById('console-input');

  // ---- data model (kept in one place so terminal + scroll sections agree) ----
  const PROJECTS = [
    {
      id: 'kindle', name: 'kindle-analysis',
      title: 'does price determine what gets read?',
      tags: ['data analysis', 'tableau'],
      summary: '133k+ Kindle listings analyzed for pricing/discoverability structure.',
      detail: `a self-directed analysis of 133,000+ Amazon Kindle book listings, testing whether
Kindle Unlimited status, price tier, and genre structurally determine discoverability.
they do: KU titles significantly outperform paid titles on bestseller rank and reader
engagement across every genre, and titles priced over $15 are effectively invisible to
algorithmic discovery. tools: Python, pandas, matplotlib, seaborn, Tableau.`,
      link: 'https://public.tableau.com/app/profile/ananya.mittal8556/viz/KindleMarketplaceDiscoverabilityAnalysis/Dashboard1?publish=yes',
      linkLabel: 'tableau dashboard'
    },
    {
      id: 'nyayaai', name: 'nyayaai',
      title: 'agentic legal research platform',
      tags: ['legaltech', 'agentic ai'],
      summary: 'Claude API + MCP platform indexing 5 lakh+ Indian legal documents.',
      detail: `existing MCP connectors for Indian legal data exposed 5 lakh+ documents across the
Supreme Court, High Courts, SEBI, and RBI, with no reasoning layer for practitioners.
NyayaAI adds five specialised agent endpoints (case law search, document retrieval,
judgment analysis, compliance checking, act-to-judgment correlation), each routing
through Claude to a legal data hunter MCP. built and deployed full-stack using Claude
Code, with PDF/DOCX ingestion and source-cited outputs.`,
      link: 'https://nyayaai.up.railway.app',
      linkLabel: 'live app'
    },
    {
      id: 'churn', name: 'msme-churn-model',
      title: 'predicting MSME churn from logistics signals',
      tags: ['data science', 'power bi'],
      summary: 'logistic regression churn model on 9.5k+ Tata nexarc shipment records.',
      detail: `built during my Tata nexarc internship: engineered features across SLA compliance,
LSP performance, order sequence, and key account status from 9,500+ anonymised B2B
logistics shipment records. trained a logistic regression classifier and identified
first-order customers, SLA non-compliance, and LSP selection as the primary churn
signals. shipped as a Power BI dashboard with customer-level risk scores and
early-intervention recommendations.`,
      link: null
    },
    {
      id: 'sidequest', name: 'sidequest',
      title: 'the Letterboxd that games never got',
      tags: ['side project', 'fastapi'],
      summary: 'personal multi-platform game tracker with an arcade/CRT identity.',
      detail: `every other medium has a tracker with personality — Letterboxd for film, Goodreads
for books, Trakt for TV. games never got one. SideQuest is a personal game tracker with
an arcade/CRT visual identity, built on FastAPI and Jinja2, with RAWG API integration
for game discovery. pure product instinct, no client brief — i noticed the gap and built
the thing i wanted to use.`,
      link: 'https://sidequest-game.up.railway.app',
      linkLabel: 'live app'
    }
  ];

  const TIMELINE = [
    { date: '2026 — present', role: 'product management intern', org: 'CredgeSol.ai', note: 'presenting the Credge Clarity Engine pitch to internal stakeholders' },
    { date: 'apr — aug 2025', role: 'marketing analytics & SEO intern', org: 'Tata nexarc', note: 'cohort pipelines, churn models, 50+ campaign KPIs automated' },
    { date: '2024 — 2026', role: 'PGDM, big data analytics', org: 'Goa Institute of Management', note: 'pivoted from law into data and analytics' },
    { date: '2018 — 2023', role: 'BBA LL.B', org: 'Army Law College, Pune', note: 'where the systems-thinking habit started' }
  ];

  const LINKS = {
    linkedin: 'https://www.linkedin.com/in/ananyamittal2000/',
    github: 'https://github.com/ananyaontheshor',
    blog: 'https://ananyaontheshor.github.io',
    email: 'mailto:ananyamittal88@gmail.com'
  };

  // ---- output helpers ----
  function esc(s){
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function printLine(html, cls){
    const div = document.createElement('div');
    div.className = 'console-line' + (cls ? ' ' + cls : '');
    div.innerHTML = html;
    screen.appendChild(div);
    screen.scrollTop = screen.scrollHeight;
  }

  function printEcho(cmd){
    printLine(`<span class="prompt">$</span> ${esc(cmd)}`, 'cmd-echo');
  }

  function printTable(rows, headers){
    const div = document.createElement('div');
    div.className = 'console-line';
    let html = '<table class="console-table"><thead><tr>';
    headers.forEach(h => html += `<th>${esc(h)}</th>`);
    html += '</tr></thead><tbody>';
    rows.forEach(r => {
      html += '<tr>';
      r.forEach((cell, i) => html += `<td${i===0?' class="proj-name"':''}>${cell}</td>`);
      html += '</tr>';
    });
    html += '</tbody></table>';
    div.innerHTML = html;
    screen.appendChild(div);
    screen.scrollTop = screen.scrollHeight;
  }

  // ---- command implementations ----
  function cmdHelp(){
    printLine(`<span class="out-heading">available commands</span>`);
    printLine(`<span class="out-sage">whoami</span><span class="out-dim">           — quick bio</span>`);
    printLine(`<span class="out-sage">about</span><span class="out-dim">             — the longer version</span>`);
    printLine(`<span class="out-sage">ls projects</span><span class="out-dim">       — list project names</span>`);
    printLine(`<span class="out-sage">cat &lt;project&gt;</span><span class="out-dim">    — show project detail, e.g. "cat nyayaai"</span>`);
    printLine(`<span class="out-sage">select * from projects</span><span class="out-dim"> — view projects as a table</span>`);
    printLine(`<span class="out-sage">path</span><span class="out-dim">              — career timeline</span>`);
    printLine(`<span class="out-sage">contact</span><span class="out-dim">           — how to reach me</span>`);
    printLine(`<span class="out-sage">open &lt;linkedin|github|blog|email&gt;</span><span class="out-dim"> — open a link</span>`);
    printLine(`<span class="out-sage">clear</span><span class="out-dim">             — clear the screen</span>`);
  }

  function cmdWhoami(){
    printLine(`<span class="out-sage">ananya mittal</span> — product management intern at CredgeSol.ai.`);
    printLine(`PGDM, big data analytics (GIM) · earlier BBA LL.B. law background plus a data`);
    printLine(`brain, currently spent on AI governance product work and self-directed analysis.`);
  }

  function cmdAbout(){
    printLine(`i started with a <span class="out-sage">BBA LL.B</span> from Army Law College, Pune — taught me to`);
    printLine(`read systems for where they break. moved into <span class="out-sage">data and analytics</span> because`);
    printLine(`i wanted to build the systems, not just argue about them.`);
    printLine(``);
    printLine(`5 months at <span class="out-sage">Tata nexarc</span> doing marketing analytics: automated cohort`);
    printLine(`revenue pipelines across 5,700+ records, built churn models from logistics data,`);
    printLine(`consolidated 50+ campaign KPIs into self-updating dashboards.`);
    printLine(``);
    printLine(`now: product management intern at <span class="out-sage">CredgeSol.ai</span>, an AI decision`);
    printLine(`governance startup. also write, take photos, paint — most of it lives on`);
    printLine(`<a href="${LINKS.blog}" target="_blank" rel="noopener">my blog</a>. co-authored a PwC Whitepaper Challenge 4.0 paper on AI governance`);
    printLine(`(top 17 semifinalists).`);
  }

  function cmdLsProjects(){
    printLine(`<span class="out-dim">found ${PROJECTS.length} projects:</span>`);
    PROJECTS.forEach(p => {
      printLine(`  <span class="out-sage">${esc(p.name)}</span><span class="out-dim"> — ${esc(p.summary)}</span>`);
    });
    printLine(`<span class="out-dim">run "cat &lt;name&gt;" for detail, e.g. cat ${PROJECTS[0].name}</span>`);
  }

  function cmdCat(arg){
    if(!arg){
      printLine(`<span class="out-dim">usage: cat &lt;project-name&gt; — try "ls projects" first</span>`);
      return;
    }
    const needle = arg.toLowerCase().trim();
    const p = PROJECTS.find(p => p.name.toLowerCase().includes(needle) || p.id.toLowerCase().includes(needle));
    if(!p){
      printLine(`<span class="out-dim">cat: no project matching "${esc(arg)}" — run "ls projects" to see names</span>`);
      return;
    }
    printLine(`<span class="out-heading">${esc(p.title)}</span>`);
    printLine(`<span class="out-dim">${p.tags.map(esc).join(' · ')}</span>`);
    printLine(esc(p.detail).replace(/\n/g, '<br>'));
    if(p.link){
      printLine(`→ <a href="${p.link}" target="_blank" rel="noopener">${esc(p.linkLabel)}</a>`);
    }
  }

  function cmdSelectProjects(){
    printLine(`<span class="out-dim">SELECT * FROM projects;</span>`);
    printTable(
      PROJECTS.map(p => [esc(p.name), esc(p.tags.join(', ')), esc(p.summary)]),
      ['name', 'tags', 'summary']
    );
    printLine(`<span class="out-dim">${PROJECTS.length} rows returned</span>`);
  }

  function cmdPath(){
    printLine(`<span class="out-dim">career log, most recent first:</span>`);
    TIMELINE.forEach(t => {
      printLine(`<span class="out-sage">[${esc(t.date)}]</span> <span class="out-heading">${esc(t.role)}</span> — ${esc(t.org)}`);
      printLine(`  <span class="out-dim">${esc(t.note)}</span>`);
    });
  }

  function cmdContact(){
    printLine(`<span class="out-dim">reach me at:</span>`);
    printLine(`  email   <a href="${LINKS.email}" target="_blank" rel="noopener">ananyamittal88@gmail.com</a>`);
    printLine(`  github  <a href="${LINKS.github}" target="_blank" rel="noopener">github.com/ananyaontheshor</a>`);
    printLine(`  linkedin <a href="${LINKS.linkedin}" target="_blank" rel="noopener">linkedin.com/in/ananyamittal2000</a>`);
    printLine(`<span class="out-dim">or run "open &lt;name&gt;" to open one directly</span>`);
  }

  function cmdOpen(arg){
    if(!arg){
      printLine(`<span class="out-dim">usage: open &lt;linkedin|github|blog|email&gt;</span>`);
      return;
    }
    const key = arg.toLowerCase().trim();
    if(LINKS[key]){
      printLine(`<span class="out-dim">opening ${esc(key)}...</span>`);
      window.open(LINKS[key], '_blank', 'noopener');
    } else {
      printLine(`<span class="out-dim">open: unknown target "${esc(arg)}" — try linkedin, github, blog, or email</span>`);
    }
  }

  function cmdClear(){
    screen.innerHTML = '';
  }

  // ---- command parser ----
  function runCommand(raw){
    const cmd = raw.trim();
    if(!cmd) return;
    printEcho(cmd);

    const lower = cmd.toLowerCase();

    if(lower === 'help' || lower === '?'){ cmdHelp(); return; }
    if(lower === 'whoami'){ cmdWhoami(); return; }
    if(lower === 'about'){ cmdAbout(); return; }
    if(lower === 'ls projects' || lower === 'ls'){ cmdLsProjects(); return; }
    if(lower.startsWith('cat ')){ cmdCat(cmd.slice(4)); return; }
    if(lower === 'cat'){ cmdCat(''); return; }
    if(lower === 'select * from projects' || lower === 'select * from projects;'){ cmdSelectProjects(); return; }
    if(lower === 'path' || lower === 'history'){ cmdPath(); return; }
    if(lower === 'contact'){ cmdContact(); return; }
    if(lower.startsWith('open ')){ cmdOpen(cmd.slice(5)); return; }
    if(lower === 'open'){ cmdOpen(''); return; }
    if(lower === 'clear' || lower === 'cls'){ cmdClear(); return; }

    printLine(`<span class="out-dim">command not found: "${esc(cmd)}" — try "help"</span>`);
  }

  // ---- boot sequence ----
  function boot(){
    printLine(`<span class="out-dim">welcome. this terminal is real — type a command, or click a quick-action below.</span>`);
    printLine(`<span class="out-dim">try: <span class="out-sage">help</span></span>`);
  }
  boot();

  // ---- input handling ----
  const history = [];
  let historyIdx = -1;

  input.addEventListener('keydown', (e) => {
    if(e.key === 'Enter'){
      const val = input.value;
      if(val.trim()){
        history.push(val);
        historyIdx = history.length;
      }
      runCommand(val);
      input.value = '';
    } else if(e.key === 'ArrowUp'){
      e.preventDefault();
      if(historyIdx > 0){ historyIdx--; input.value = history[historyIdx] || ''; }
    } else if(e.key === 'ArrowDown'){
      e.preventDefault();
      if(historyIdx < history.length - 1){ historyIdx++; input.value = history[historyIdx] || ''; }
      else { historyIdx = history.length; input.value = ''; }
    }
  });

  // clicking anywhere on the console focuses the input, like a real terminal
  document.getElementById('console-obj').addEventListener('click', (e) => {
    if(e.target.tagName !== 'A') input.focus();
  });

  // expose for quick-command buttons
  window.__runTerminalCommand = runCommand;
  window.__focusTerminal = () => input.focus();
})();
