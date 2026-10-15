import { mkdir, cp, copyFile, readFile, access } from 'node:fs/promises';
import vm from 'node:vm';

await mkdir('assets', { recursive: true });
await copyFile('node_modules/@panzoom/panzoom/dist/panzoom.min.js', 'assets/panzoom.min.js');
await copyFile('node_modules/@panzoom/panzoom/MIT-License.txt', 'assets/PANZOOM-LICENSE.txt');
const context = { window: {} };
vm.runInNewContext(await readFile('diagrams.js', 'utf8'), context);
for (const group of Object.values(context.window.DIAGRAMS)) {
  for (const sheet of group.sheets) await access(sheet.file);
}
await mkdir('dist', { recursive: true });
for (const path of ['index.html', 'app.js', 'diagrams.js', '.nojekyll', 'assets', 'umlDiagrams', 'machineStateMachineDiagrams', 'activityDiagrams']) {
  await cp(path, `dist/${path}`, { recursive: true });
}
console.log('Built static site in dist/. All 12 configured diagram files exist.');
