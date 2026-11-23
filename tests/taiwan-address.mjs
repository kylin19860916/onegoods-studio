import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';
const dir=mkdtempSync(join(tmpdir(),'ogs-address-'));
await build({entryPoints:['server/taiwan-address.ts'],outfile:join(dir,'address.mjs'),bundle:true,platform:'node',format:'esm'});
const {validHomeAddress}=await import(pathToFileURL(join(dir,'address.mjs')));
const data=JSON.parse(readFileSync('src/taiwan-address-data.json','utf8'));
let allowed=0;
for(const [city,districts] of Object.entries(data.cities)) for(const [district,zip] of Object.entries(districts)) {
 const deliverable=!data.unsupportedCities.includes(city)&&!data.unsupportedDistricts.includes(district);
 assert.equal(validHomeAddress(city,district,zip),deliverable,city+district);if(deliverable)allowed++;
}
assert.equal(Object.keys(data.cities).length,22);assert.equal(allowed,349);
assert(validHomeAddress('台北市','南港區','115'));
assert(validHomeAddress('新竹市','東區','300'));
assert(validHomeAddress('嘉義市','西區','600'));
assert(!validHomeAddress('臺北市','板橋區','220'));
assert(!validHomeAddress('新北市','板橋區','115'));
assert(!validHomeAddress('__proto__','toString','115'));
assert(!validHomeAddress('臺北市','南港區','11'));
assert(!validHomeAddress('臺北市','南港區','100001'));
console.log('PASS: 22 source counties/cities, 349 deliverable districts; district ownership, shared postal prefixes, aliases, and unsupported districts verified. Street/house-number existence is not claimed.');
