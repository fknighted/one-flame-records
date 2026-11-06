import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const qs = require('qs');
test('comma query serialization handles hostile element coercion without crashing', () => {
  for (const options of [{arrayFormat:'comma'}, {arrayFormat:'comma', encodeValuesOnly:true}]) {
    assert.doesNotThrow(() => qs.stringify({a:[{toString:'hostile'}]}, options));
    assert.doesNotThrow(() => qs.stringify({a:[Object.create(null)]}, options));
  }
  assert.equal(qs.stringify({a:['one','two']},{arrayFormat:'comma'}),'a=one%2Ctwo');
});

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const glob = require('glob');
// Regression boundaries adapted from upstream node-glob 4682e8c and minimatch 77a0f5c (ISC).
test('aborted directory traversal stops further filesystem reads', async t => {
  const cwd=fs.mkdtempSync(path.join(os.tmpdir(),'security-glob-'));
  t.after(()=>fs.rmSync(cwd,{recursive:true,force:true}));
  function tree(p,n){fs.mkdirSync(p,{recursive:true});fs.writeFileSync(path.join(p,'file.txt'),'fixture');if(n){tree(path.join(p,'a'),n-1);tree(path.join(p,'b'),n-1);}}
  tree(cwd,4);
  const ac=new AbortController();const reason=new Error('cancelled fixture');let reads=0;
  const counted={...fs,readdir(...args){if(++reads===1)ac.abort(reason);return fs.readdir(...args);}};
  await assert.rejects(glob.glob('**',{cwd,signal:ac.signal,fs:counted}),e=>e===reason);
  const atReject=reads;await new Promise(r=>setTimeout(r,100));
  assert.equal(reads,atReject,'cancelled operation must not keep walking');
  assert.equal(reads,1);
});
test('complex path optimization honors its expansion budget and keeps normal matching',()=>{
  const globRequire=createRequire(require.resolve('glob/package.json'));
  const {Minimatch}=globRequire('minimatch');
  const m=new Minimatch(Array(8).fill('**/../a/b').join('/'),{optimizationLevel:2,braceExpandMax:64});
  assert.ok(m.set.length<=64,'path expansion must honor configured capacity');
  const normal=new Minimatch('**/../a/b/**/../c/d',{optimizationLevel:2});
  assert.equal(normal.match('../a/b/../c/d'),true);
  assert.equal(normal.match('x/a/b/y/c/d'),true);
});

test('glob commonjs/esm callers and rimraf retain file selection and cleanup behavior',async t=>{
  const cwd=fs.mkdtempSync(path.join(os.tmpdir(),'security-callers-'));t.after(()=>fs.rmSync(cwd,{recursive:true,force:true}));
  fs.writeFileSync(path.join(cwd,'keep.txt'),'fixture');fs.writeFileSync(path.join(cwd,'remove.tmp'),'fixture');
  const esm=await import('glob');
  assert.deepEqual(glob.globSync('*.txt',{cwd}),['keep.txt']);
  assert.deepEqual(await esm.glob('*.txt',{cwd}),['keep.txt']);
  const {rimraf}=require('rimraf');assert.equal(await rimraf(path.join(cwd,'*.tmp'),{glob:true}),true);
  assert.equal(fs.existsSync(path.join(cwd,'remove.tmp')),false);assert.equal(fs.existsSync(path.join(cwd,'keep.txt')),true);
});
