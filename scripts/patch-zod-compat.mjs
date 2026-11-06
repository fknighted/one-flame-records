// Keep Inngest's v3 API while bounding collection parsing in Zod's compatibility copy.
// Version + source hashes fail closed if an upstream install changes this code.
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);
const sdkRequire=createRequire(require.resolve('inngest'));
const directory=dirname(sdkRequire.resolve('zod/package.json'));
const version=JSON.parse(readFileSync(join(directory,'package.json'),'utf8')).version;
if(version!=='4.6.7')throw Error('Review the Zod compatibility repair before changing its pinned version.');
const hashes={'types.js':'d7214e1dacf9e6e70c9ca80247717b4be13b240510428fef132b7da3260d1a32','types.cjs':'7a2f06d88e280bdd198c60e0d292ed7f1e3993e877be4415de07e6abc7746dd1'};
const marker='// Claude OS: bound compatibility collection parsing before element validation.';
function repair(original){
 let result=original;
 for(const [name,needle,size,limit,type] of [
  ['ZodArray','        if (def.exactLength !== null) {','length','Math.min(def.exactLength?.value ?? 4096, def.maxLength?.value ?? 4096, 4096)','array'],
  ['ZodSet','        if (def.minSize !== null) {','size','Math.min(def.maxSize?.value ?? 4096, 4096)','set'],
  ['ZodMap','        const keyType = this._def.keyType;','size','4096','map'],
 ]){
  const start=result.indexOf(`class ${name} extends ZodType`),position=result.indexOf(needle,start);
  if(start<0||position<0)throw Error(`Cannot locate ${name} compatibility parser.`);
  const cjs=result.includes('const ZodError_js_1 = require(');
  const issue=cjs?'(0, parseUtil_js_1.addIssueToContext)':'addIssueToContext';
  const code=cjs?'ZodError_js_1.ZodIssueCode.too_big':'ZodIssueCode.too_big';
  const invalid=cjs?'parseUtil_js_1.INVALID':'INVALID';
  const addition=`        ${marker}\n        if (ctx.data.${size} > ${limit}) {\n            ${issue}(ctx, { code: ${code}, maximum: ${limit}, type: "${type}", inclusive: true, exact: false });\n            return ${invalid};\n        }\n`;
  result=result.slice(0,position)+addition+result.slice(position);
 }
 return result;
}
const updates=[];
for(const[file,hash]of Object.entries(hashes)){
 const path=join(directory,'v3',file),source=readFileSync(path,'utf8');
 // Idempotent installs must match the exact expected repaired upstream source.
 const pristine=source.includes(marker)?source.replace(/        \/\/ Claude OS: bound compatibility collection parsing before element validation\.\n        if \(ctx\.data\.(?:length|size) > .*?\) \{\n            .*?\n            return .*?;\n        \}\n/g,''):source;
 if(createHash('sha256').update(pristine).digest('hex')!==hash)throw Error(`Unrecognized Zod compatibility source: ${file}`);
 const repaired=repair(pristine);
 if(process.argv.includes("--check") && source!==repaired)throw Error(`Zod compatibility repair is missing: ${file}`);
 updates.push([path,repaired]);
}
if(!process.argv.includes("--check"))for(const[path,content]of updates)writeFileSync(path,content);
console.log('Verified and repaired Zod 4.6.7 v3 compatibility collection parsers (ESM/CJS).');
