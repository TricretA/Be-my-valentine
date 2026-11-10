import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const [id, frames] = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const browserExecutable = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const comp = await selectComposition({serveUrl, id, browserExecutable});
for (const fr of frames.split(',').map(Number)) {
  const t = Date.now();
  await renderStill({composition: comp, serveUrl, frame: fr, output: `/tmp/tf-${fr}.jpg`, browserExecutable, imageFormat: 'jpeg', timeoutInMilliseconds: 240000});
  console.log('frame', fr, ((Date.now() - t) / 1000).toFixed(1) + 's');
}
