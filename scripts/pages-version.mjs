import {writeFile,readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
// Hash the actual static output, including uncommitted local builds.
// This also works in the delivery folder before a Git repository is created.
const digest=createHash('sha256');
async function record(folder) {
  for(const entry of (await readdir(folder,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))) {
    if(['zzky-game-version.json','.nojekyll'].includes(entry.name))continue;
    const file=folder+'/'+entry.name;
    if(entry.isDirectory())await record(file);
    else {digest.update(file);digest.update(await readFile(file));}
  }
}
await record('dist-pages');
const revision=digest.digest('hex');
await writeFile('dist-pages/zzky-game-version.json',JSON.stringify({application:'gerceklik-oyunu',revision,built_at:new Date().toISOString()}));
await writeFile('dist-pages/.nojekyll','');
