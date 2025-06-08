async function load() {
  const res = await fetch('cs_map.json');
  const data = await res.json();

  const svg = document.getElementById('map');
  const width = 2000;
  const height = 2000;
  let viewBox = { x: 0, y: 0, w: width, h: height };
  svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);

  function updateView() {
    svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
  }

  let isPanning = false;
  let start = [0, 0];
  svg.addEventListener('mousedown', e => {
    isPanning = true;
    start = [e.clientX, e.clientY];
  });
  window.addEventListener('mouseup', () => isPanning = false);
  window.addEventListener('mousemove', e => {
    if (!isPanning) return;
    const dx = (start[0] - e.clientX) * (viewBox.w / svg.clientWidth);
    const dy = (start[1] - e.clientY) * (viewBox.h / svg.clientHeight);
    viewBox.x += dx;
    viewBox.y += dy;
    start = [e.clientX, e.clientY];
    updateView();
  });
  svg.addEventListener('wheel', e => {
    e.preventDefault();
    const scale = e.deltaY < 0 ? 0.9 : 1.1;
    const mx = e.offsetX / svg.clientWidth * viewBox.w + viewBox.x;
    const my = e.offsetY / svg.clientHeight * viewBox.h + viewBox.y;
    viewBox.w *= scale;
    viewBox.h *= scale;
    viewBox.x = mx - viewBox.w * (e.offsetX / svg.clientWidth);
    viewBox.y = my - viewBox.h * (e.offsetY / svg.clientHeight);
    updateView();
  });

  const radiusFactor = 10;
  const pos = [];
  const center = [width / 2, height / 2];
  const step = 2 * Math.PI / data.length;
  data.forEach((area, i) => {
    const r = area.weight * radiusFactor;
    const angle = i * step;
    const x = center[0] + 600 * Math.cos(angle);
    const y = center[1] + 600 * Math.sin(angle);
    pos.push({ id: area.id, x, y, r });
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', r);
    circle.setAttribute('class', 'bubble');
    circle.dataset.id = area.id;
    svg.appendChild(circle);
  });

  // draw lines on hover
  svg.addEventListener('mouseover', e => {
    if (e.target.tagName !== 'circle') return;
    const id = e.target.dataset.id;
    const area = data.find(a => a.id === id);
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('id', 'lines');
    svg.appendChild(group);
    area.depends_on.forEach(dep => {
      const p1 = pos.find(p => p.id === id);
      const p2 = pos.find(p => p.id === dep);
      if (!p1 || !p2) return;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', p1.x);
      line.setAttribute('y1', p1.y);
      line.setAttribute('x2', p2.x);
      line.setAttribute('y2', p2.y);
      line.setAttribute('stroke', '#888');
      group.appendChild(line);
    });
  });
  svg.addEventListener('mouseout', e => {
    const lines = document.getElementById('lines');
    if (lines) lines.remove();
  });

  const sidebar = document.getElementById('sidebar');
  svg.addEventListener('click', e => {
    if (e.target.tagName !== 'circle') return;
    const id = e.target.dataset.id;
    const area = data.find(a => a.id === id);
    sidebar.innerHTML = `<h2>${area.label}</h2><p>${area.summary}</p>`;
    if (area.problems.length) {
      sidebar.innerHTML += '<h3>Open problems</h3><ul>' + area.problems.map(p => `<li>${p.name}</li>`).join('') + '</ul>';
    }
    sidebar.classList.remove('hidden');
  });
});

load();
