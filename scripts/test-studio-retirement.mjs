// Offline regression checks. All services are mocked; no credentials or media are read.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
function load(file, imports) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  const mod = {exports:{}};
  new Function('require','module','exports','process',code)((key)=>{
    if (!(key in imports)) throw new Error(`Unexpected service/import: ${key}`);
    return imports[key];
  },mod,mod.exports,{env:{}});
  return mod.exports;
}
function walk(dir) {
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const file=path.join(dir,entry.name);
    return entry.isDirectory()?walk(file):/\.tsx?$/.test(file)?[file]:[];
  });
}
async function main() {
  // Enforce the paid-video boundary, including direct/crafted calls and retries.
  for(const file of walk('src')) {
    const tree=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true);
    function check(node) {
      if(ts.isStringLiteral(node)) {
        assert(!['video/generate.requested','campaign/video.requested'].includes(node.text),`${file}: video trigger survived`);
        assert(!['@higgsfield/client','fluent-ffmpeg','@ffmpeg-installer/ffmpeg'].some(x=>node.text.startsWith(x)),`${file}: video provider survived`);
        assert(!/^\/(portal\/videos\/new|admin\/artists\/.*\/videos\/new)/.test(node.text),`${file}: production link survived`);
      }
      if(ts.isCallExpression(node)&&ts.isPropertyAccessExpression(node.expression)&&node.expression.name.text==='insert') {
        assert(!node.expression.expression.getText(tree).includes('"video_jobs"'),`${file}: new video job insertion survived`);
      }
      ts.forEachChild(node,check);
    }
    check(tree);
  }
  // Execute retired routes and ensure they redirect without a database/provider import.
  for(const [file,params,target] of [
    ['src/app/portal/videos/new/page.tsx',{},'/portal/videos'],
    ['src/app/admin/artists/[id]/videos/new/page.tsx',{id:'test-artist'},'/admin/artists/test-artist/videos'],
  ]) {
    const page=load(file,{'next/navigation':{redirect:(url)=>{throw new Error(`redirect:${url}`);}}}).default;
    await assert.rejects(async()=>page({params:Promise.resolve(params)}),{message:`redirect:${target}`});
  }
  // Studio pages/actions and provider workers must be absent, not merely hidden.
  for (const entry of ['src/app/admin/ai-studio','src/app/admin/campaigns','src/app/admin/jobs','src/lib/inngest/functions/generate-video.ts','src/lib/inngest/functions/generate-campaign.ts','src/lib/inngest/functions/regenerate-campaign-piece.ts']) {
    assert(!fs.existsSync(entry), `Retired studio remains: ${entry}`);
  }
  const shell=fs.readFileSync('src/components/InkShell.tsx','utf8');
  assert(!/AI Studio|ai-studio|admin\/campaigns|admin\/jobs/.test(shell),'Studio navigation remains');
  for(const file of walk('src')) {
    const text=fs.readFileSync(file,'utf8');
    assert(!/\/admin\/(?:ai-studio|campaigns|jobs)|Draft with Claude|Generate with AI|from ["'](?:openai|@anthropic-ai\/sdk)/.test(text),`${file}: studio tool remains`);
  }
  const route=load('src/app/api/inngest/route.ts',{
    'inngest/next':{serve:({functions})=>{assert.deepEqual(functions,['hello','youtube']);return {GET:true,POST:true,PUT:true};}},
    '@/lib/inngest/client':{inngest:{}},
    '@/lib/inngest/functions/hello':{helloWorld:'hello'},
    '@/lib/inngest/functions/upload-to-youtube':{uploadToYoutubeJob:'youtube'},
  });
  assert(route.GET);
  console.log('PASS: studio pages/actions/providers/events/navigation absent; retired request routes redirect; only shared YouTube and hello workers registered.');

}
main().catch(error=>{console.error(error);process.exitCode=1;});
