import "server-only";
export function assertPublicReads(...results: {error: unknown}[]) {
 if(results.some(result=>result.error)) throw new Error("The catalog could not be loaded. Please try again shortly.");
}
export async function readAllRows<T>(page:(from:number,to:number)=>PromiseLike<{data:T[]|null;error:unknown}>) {
 const rows:T[]=[];
 for(let from=0;;from+=500){const result=await page(from,from+499);assertPublicReads(result);rows.push(...(result.data??[]));if((result.data?.length??0)<500)return rows;}
}
