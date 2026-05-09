import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dashboardEn = JSON.parse(
  fs.readFileSync(path.join(root, 'messages', 'dashboard-en.json'), 'utf8')
);
const dashboardEs = JSON.parse(
  fs.readFileSync(path.join(root, 'messages', 'dashboard-es.json'), 'utf8')
);

for (const [file, dash] of [
  ['en.json', dashboardEn],
  ['es.json', dashboardEs],
]) {
  const p = path.join(root, 'messages', file);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  data.dashboard = dash;
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8');
}
