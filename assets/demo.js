(() => {
  if (new URLSearchParams(location.search).get('demo') !== '1') return;

  const root = document.getElementById('guardian-demo');
  const profile = {
    sex: 'F', age: 46, height: 162, weight: 72,
    cur: { waist: 88, tg: 1.65, hdl: 0.96, sbp: 139, dbp: 88, fbg: 5.8 },
  };
  const reviewMetrics = { waist: 84, tg: 1.61, hdl: 1.02, sbp: 129, dbp: 84, fbg: 5.6 };
  const movement = { title: '快走', minutes: 30, distance: '2.4 km' };
  const steps = [
    { title: '从体检报告到 A 级', label: '核保分级', time: '0:00–0:35', action: '确认模拟复核' },
    { title: '把血压结果转成日常任务', label: '健康计划', time: '0:35–1:20', action: '查看血压管理任务' },
    { title: '记录当天的运动', label: '日常记录', time: '1:20–2:10', action: '导入示例运动记录' },
    { title: '年度重评与次年费率', label: '给付与重评', time: '2:10–3:00', action: '核对三次记录并计算优惠' },
  ];
  const rules = window.GuardianRules;

  document.documentElement.classList.add('guardian-demo-active');
  root.hidden = false;
  if (!rules) {
    root.innerHTML = '<p class="gd-panel">演示规则未加载。<a href="?demo=1">重新加载</a></p>';
    return;
  }

  const baseline = rules.assess(profile);
  const reviewCount = rules.checkItems(profile.sex, reviewMetrics).filter(item => item.ok).length;
  const reviews = [0, 6, 12].map(month => ({ month, count: reviewCount, reviewed: true }));
  const renewal = rules.renewal(baseline.level, 15, reviews);
  let current = 0;
  let completed = steps.map(() => false);

  const metrics = () => {
    const itemLabels = { waist: '腰围', bp: '血压', fbg: '空腹血糖', tg: '甘油三酯', hdl: 'HDL-C' };
    return '<dl class="gd-metrics">' + ['waist', 'bp', 'fbg', 'tg', 'hdl'].map(key => {
      const item = baseline.items.find(entry => entry.key === key);
      return `<div><dt>${itemLabels[key]}</dt><dd>${item.show}</dd><small class="${item.ok ? 'gd-abnormal' : ''}">${item.ok ? '异常' : '正常'}</small></div>`;
    }).join('') + '</dl>';
  };

  const panels = [
    done => `<article class="gd-panel"><h2>虚构体检报告</h2>${metrics()}<p>收缩压和舒张压合计一项。</p></article>
      <aside class="gd-panel gd-result" aria-live="polite"><p>核保模拟</p><strong>${done ? baseline.level + ' 级' : '待复核'}</strong>
      <p>${done ? '复核完成 · 五项指标中 ' + baseline.n + ' 项异常' : '审核人员核对原件与指标，再确认异常项数。'}</p></aside>`,
    done => `<article class="gd-panel"><h2>血压 139/88 mmHg</h2><p class="gd-abnormal">体检指标异常 · 已模拟复核</p>
      ${done ? '<div class="gd-detail"><h3>今日任务</h3><p>选一餐少放盐，记录当天血压。AI 教练提示测量时间，记录反馈。</p></div>' : '<p>打开任务，查看指标如何对应到当天的健康计划。</p>'}</article>
      <aside class="gd-panel gd-result"><h2>专业复核</h2><p>专业人员复核异常数据，评估是否需要线下复查。AI 可解释指标、发送提醒和记录反馈。</p></aside>`,
    done => `<article class="gd-panel"><h2>当天运动记录</h2><div class="gd-detail" aria-live="polite">${done ?
      `<h3>${movement.title} · ${movement.minutes} 分钟</h3><p>${movement.distance} · 已导入一条示例记录</p>` :
      '<p>暂无记录。可导入一条预置快走记录。</p>'}</div></article>
      <aside class="gd-panel gd-result"><h2>积分用途</h2><p>积分可兑换约定实物或服务。次年保费优惠依据体检复核，按健康改善条件核定。</p></aside>`,
    done => `<article class="gd-panel"><h2>三次模拟复核</h2><ol class="gd-timeline">${reviews.map((review, index) =>
      `<li><span>${['改善起始', '第 6 个月', '满 12 个月'][index]}</span><strong>${review.count} 项异常</strong><small>已复核</small></li>`
    ).join('')}</ol><p>异常项数持续不超过 2 项，次年按初始等级基准费率计算。</p>
      ${done ? `<p class="gd-rate" role="status">次年费率 <strong>${renewal.eligible ? '0.8 × P₀' : 'P₀'}</strong><br>P₀ 为初始 A 级对应的 AI 情景基准费率。</p>` : ''}</article>
      <aside class="gd-panel gd-result"><h2>给付与服务</h2><dl class="gd-coverage"><dt>现金给付</dt><dd>三病共用一次 100% 保额；严重进展和疾病相关身故各 20%。</dd>
      <dt>服务权益</dt><dd>体检 800 元/年；病后照护 5,000 元，12 个月内使用。</dd><dt>保费优惠</dt><dd>符合持续改善条件，次年按基准费率的 80% 收费。</dd></dl></aside>`,
  ];

  root.innerHTML = `<header class="gd-header"><a href="?">代谢健康守护</a><button id="gd-reset" type="button">重置案例</button></header>
    <main class="gd-main"><ol class="gd-progress" aria-label="演示进度">${steps.map(step => `<li>${step.label}</li>`).join('')}</ol>
    <div id="gd-screen"></div>
    <nav class="gd-nav" aria-label="演示操作">
      <button type="button" id="gd-prev">上一步</button>
      <button type="button" id="gd-next">下一步 <span aria-hidden="true">→</span></button>
      <a href="?" id="gd-finish" hidden>结束演示 <span aria-hidden="true">↗</span></a>
    </nav></main><footer class="gd-footer">虚构样例 · 保障与费率为方案演示</footer>`;

  const screen = document.getElementById('gd-screen');
  const progress = [...root.querySelectorAll('.gd-progress li')];
  const prev = document.getElementById('gd-prev');
  const next = document.getElementById('gd-next');
  const finish = document.getElementById('gd-finish');

  function render(focusId) {
    const step = steps[current];
    const done = completed[current];
    root.dataset.demoStep = String(current + 1);
    progress.forEach((item, index) => {
      if (index === current) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
    screen.innerHTML = `<div class="gd-intro"><p>李静 · 女 · 46 岁 <span>${step.time}</span></p>
      <h1 id="gd-title" tabindex="-1">${step.title}</h1></div>
      <div class="gd-grid">${panels[current](done)}</div>
      <button type="button" id="gd-action" ${done ? 'hidden' : ''}>${step.action}</button>`;
    prev.disabled = current === 0;
    next.disabled = !done;
    next.hidden = current === steps.length - 1;
    finish.hidden = !next.hidden || !done;
    document.getElementById('gd-action').addEventListener('click', () => {
      completed[current] = true;
      render(next.hidden ? 'gd-finish' : 'gd-next');
    });
    if (focusId) document.getElementById(focusId).focus({ preventScroll: true });
  }

  function move(direction) {
    const target = current + direction;
    if (target < 0 || target >= steps.length || (direction > 0 && !completed[current])) return;
    current = target;
    render('gd-title');
    window.scrollTo(0, 0);
  }

  prev.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  document.getElementById('gd-reset').addEventListener('click', () => {
    current = 0;
    completed = steps.map(() => false);
    render('gd-title');
    window.scrollTo(0, 0);
  });
  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.defaultPrevented) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      event.stopImmediatePropagation();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  }, true);
  render('gd-title');
})();
