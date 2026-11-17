import {readFile,writeFile,mkdir,readdir,unlink} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,resolve,relative,basename} from 'node:path';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {packAtlases} from './pack-atlases.mjs';
import {GAME_REGISTRY,assetDirectory,assertTranslation,catalogSource,gameChunk,rankingKey,readGameInputs} from './game-registry.mjs';

const root=dirname(fileURLToPath(import.meta.url)),project=root,out=resolve(root,'lib');
const readText=async file=>(await readFile(file,'utf8')).replaceAll('\r\n','\n');
const catalog=catalogSource();
const zh=JSON.parse(await readText(resolve(root,'locale/zh.json')));
const en=JSON.parse(await readText(resolve(root,'locale/en.json')));
assertTranslation(zh,en,'plugin locale');
const ruleFingerprints=Object.fromEntries(GAME_REGISTRY.map(game=>[game.id,rankingKey(game)]));
await mkdir(out,{recursive:true});
await writeFile(resolve(out,'catalog.mjs'),catalog);
const packageInfo=JSON.parse(await readFile(resolve(root,'package.json'),'utf8'));

// Small compiler for this finite set of authored, dependency-free ESM files.
// Each module retains its closure; unknown syntax or externals fail the build.
async function compile(entry,{pixi=false}={}){
  const definitions=[],seen=new Set(),visiting=new Set(),moduleExports=new Map();
  async function visit(file){
    const sourceId=relative(project,file).replaceAll('\\','/');
    const pluginPath=relative(root,file).replaceAll('\\','/');
    const id=pluginPath.startsWith('../')?sourceId:pluginPath;
    if(visiting.has(id))throw Error('Circular build import '+id);
    if(seen.has(id))return id;seen.add(id);visiting.add(id);
    const input=await readText(file);
    let source=input.replaceAll('__BRAINGAMES_VERSION__',JSON.stringify(packageInfo.version)),imports=[];
    for(const m of source.matchAll(/^import (.+?) from ['"](.+?)['"];?\s*$/gm)){
      const [line,binding,path]=m;let expression;
      if(path==='react')expression="require('react')";
      else if(path==='./pixi.mjs'&&pixi)expression='__pixi';
      else{
        if(!path.startsWith('.'))throw Error('Unexpected build external '+path);
        const dependency=await visit(resolve(dirname(file),path));expression='__get('+JSON.stringify(dependency)+')';
        if(binding.startsWith('{'))for(const item of binding.slice(1,-1).split(',')){
          const name=item.trim().split(/\s+as\s+/)[0];
          if(!moduleExports.get(dependency)?.has(name))throw Error(`Missing build export ${name} from ${dependency} (used by ${id})`);
        }
      }
      const left=binding.startsWith('* as ')?binding.slice(5):binding.startsWith('{')?binding.replace(/\s+as\s+/g,':'):binding;
      imports.push([line,'const '+left+'='+expression+';']);
    }
    const exports=[];
    source=source.replace(/^export \{([^}]+)\};?\s*$/gm,(_,names)=>{exports.push(...names.split(',').map(s=>s.trim()));return'';});
    source=source.replace(/^export (async )?(function|class|const|let) (\w+)/gm,(_,async='',kind,name)=>{exports.push(name);return async+kind+' '+name;});
    for(const [line,replacement]of imports)source=source.replace(line,replacement);
    if(/^import |^export /m.test(source))throw Error('Unsupported module syntax '+file);
    source=source.replaceAll('import.meta.url',JSON.stringify('braingames:/'+basename(file)));
    moduleExports.set(id,new Set(exports));
    visiting.delete(id);
    definitions.push('__defs['+JSON.stringify(id)+']=()=>{\n'+source+'\nreturn {'+exports.join(',')+'};\n};');return id;
  }
  const id=await visit(entry);
  return'const __defs=Object.create(null),__cache=Object.create(null);const __get=id=>__cache[id]??(__cache[id]=__defs[id]());\n'+definitions.join('\n')+'\nconst __entry=__get('+JSON.stringify(id)+');\n';
}
const resources = [];
const sizes = {};
let packingReport;
function addImageResource(name, bytes, sha256 = createHash('sha256').update(bytes).digest('hex')) {
  resources.push({name, type: 'image/png', bytes: bytes.length, sha256});
}

for (const game of GAME_REGISTRY) {
  const inputs = await readGameInputs(project, game);
  const ui = {
    markup: await readText(resolve(project, inputs.markup)),
    style: await readText(resolve(project, inputs.style)),
    font: (await readFile(resolve(project, inputs.font))).toString('base64'),
  };
  if (inputs.icons.length) {
    ui.icons = {};
    for (const [icon, file] of inputs.icons) {
      ui.icons['./' + icon] = 'data:image/svg+xml;base64,' + Buffer.from(await readText(resolve(project, file))).toString('base64');
    }
  }
  if (inputs.meals?.length) {
    ui.mealImages = {};
    for (const [meal, file] of inputs.meals) {
      ui.mealImages[meal] = 'data:image/png;base64,' + (await readFile(resolve(project, file))).toString('base64');
    }
  }

  let manifest = inputs.manifest;
  let pixiSource = '';
  if (game.atlas.packed) {
    const packed = await packAtlases(resolve(project, 'assets/g10'), resolve(out, 'assets'));
    manifest = packed.manifest;
    packingReport = packed.report;
    for (const {image} of manifest.atlases) {
      addImageResource(image, await readFile(resolve(out, 'assets', image)));
    }
    const pixi = (await readText(resolve(project, 'vendor/pixi.mjs')))
      .replace(/\/\/# sourceMappingURL=.*$/gm, '')
      .replace(/export \{([^}]+)\};/g, (_, names) => 'return {' + names.split(',').map(name => {
        const pair = name.trim().split(/\s+as\s+/);
        return pair.length === 2 ? pair[1] + ':' + pair[0] : pair[0];
      }).join(',') + '};')
      .replaceAll('import.meta.url', "'braingames:/pixi.mjs'");
    pixiSource = 'const __pixi=(()=>{\n' + pixi + '\n})();\n';
  } else {
    const bytes = await readFile(resolve(project, inputs.image));
    const hash = createHash('sha256').update(bytes).digest('hex');
    const directory = assetDirectory(game);
    manifest.image = directory + '/' + hash.slice(0, 20) + '.png';
    await mkdir(resolve(out, 'assets', directory), {recursive: true});
    await writeFile(resolve(out, 'assets', manifest.image), bytes);
    addImageResource(manifest.image, bytes, hash);
  }

  const file = gameChunk(game);
  const code = await compile(resolve(project, inputs.entry), {pixi: game.atlas.packed});
  const bundle = '// Generated by build.mjs.\nwindow.__ModuleLoader__.load({id:' + JSON.stringify('dsh-braingames/' + file) +
    ',factory:require=>{\n' + pixiSource + code + '\nconst ui=' + JSON.stringify(ui) + ';\nconst manifest=' +
    JSON.stringify(manifest) + ';\n' + [
      'return {mountBundledStage(container,options){',
      '  return __entry.mountStage(container,{...options,ui:{...ui,fontBytes:Uint8Array.from(atob(ui.font),c=>c.charCodeAt(0)).buffer},manifest,',
      '    async loadAtlas(name){',
      '      const resource=await options.loadResource(name);',
      '      if(resource.type!=="image/png"||!ArrayBuffer.isView(resource.bytes))throw Error("像素资源格式无效");',
      '      return createImageBitmap(new Blob([resource.bytes],{type:resource.type}),{premultiplyAlpha:"none"});',
      '    }});',
      '}};',
      '}});',
    ].join('\n') + '\n';
  new vm.Script(bundle, {filename: file});
  await writeFile(resolve(out, file), bundle);
  if (game.atlas.packed) {
    sizes.lazyBytes = Buffer.byteLength(bundle);
    sizes.atlasPages = manifest.atlases.length;
    sizes.atlasDecodedBytes = manifest.atlases.reduce((total, page) => total + page.width * page.height * 4, 0);
  } else {
    const [width, height] = manifest.atlas ?? [manifest.width, manifest.height];
    sizes[game.chunk + 'LazyBytes'] = Buffer.byteLength(bundle);
    sizes[game.chunk + 'DecodedBytes'] = width * height * 4;
  }
}

const popupFont = (await readFile(resolve(root, 'ui/popup.ttf'))).toString('base64');
const latinFont = (await readFile(resolve(root, 'ui/latin.ttf'))).toString('base64');
const hostUiCss = (await readText(resolve(root, 'host-ui.css')))
  .replace('__BRAINGAMES_POPUP_FONT__', popupFont).replace('__BRAINGAMES_LATIN_FONT__', latinFont);
const entryCode = (await compile(resolve(root, 'client-entry.mjs')))
  .replace('__BRAINGAMES_HOST_UI_CSS__', JSON.stringify(hostUiCss))
  .replace('__BRAINGAMES_RULES__', JSON.stringify(ruleFingerprints));
const entryBundle = '// Generated by build.mjs; game code and images remain lazy.\n' +
  "window.__ModuleLoader__.load({id:'dsh-braingames',factory:require=>{\n" + entryCode + '\nreturn __entry;\n}});\n';
new vm.Script(entryBundle, {filename: 'client.js'});
await writeFile(resolve(out, 'client.js'), entryBundle);
await writeFile(resolve(out, 'KENNEY-LICENSE.txt'), await readText(resolve(project, 'vendor/KENNEY-LICENSE.txt')));
await writeFile(resolve(out, 'FONT-LICENSE.txt'), await readText(resolve(project, 'games/rice-bubbles/ui/OFL.txt')));
await writeFile(resolve(out, 'PIXI-LICENSE.txt'), await readText(resolve(project, 'vendor/PIXI-LICENSE')));
await writeFile(resolve(out, 'resources.json'), JSON.stringify(resources, null, 2) + '\n');

// Only obsolete generated PNGs in registered asset directories are removed.
const currentImages = new Set(resources.map(resource => resource.name));
for (const directory of new Set(GAME_REGISTRY.map(assetDirectory))) {
  for (const file of await readdir(resolve(out, 'assets', directory))) {
    if (/^[a-f0-9]{20}\.png$/.test(file) && !currentImages.has(directory + '/' + file)) {
      await unlink(resolve(out, 'assets', directory, file));
    }
  }
}
await writeFile(resolve(root, 'build-report.json'),
  JSON.stringify({version: packageInfo.version, rules: ruleFingerprints, packing: packingReport}, null, 2) + '\n');
console.log(JSON.stringify({
  entryBytes: Buffer.byteLength(entryBundle), ...sizes,
  imageBytes: resources.reduce((total, resource) => total + resource.bytes, 0),
}));
