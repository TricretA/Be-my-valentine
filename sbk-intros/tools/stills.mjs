// usage: node tools/stills.mjs <CompId> <outDir> <f1,f2,...>
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
const [id, outDir, frames] = process.argv.slice(2);
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const browserExecutable = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const comp = await selectComposition({serveUrl, id, browserExecutable});
for (const fr of frames.split(',').map(Number)) {
  await renderStill({composition: comp, serveUrl, frame: fr, output: path.join(outDir, `${id}-${String(fr).padStart(4, '0')}.png`), browserExecutable, imageFormat: 'png', scale: 0.5});
  console.log('frame', fr);
}
