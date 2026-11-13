export const responseHeaders={'Access-Control-Allow-Origin':'https://juice-butterfly.github.io','Cache-Control':'no-store'};
let start=0,total=0;const clients=new Map();
export function hasCapacity(client){const now=Date.now();if(now-start>=60000){start=now;total=0;clients.clear();}const count=clients.get(client)||0;if(count>=12||total>=60)return false;clients.set(client,count+1);total++;return true;}
export function OPTIONS(request){if(request.headers.get('origin')!==responseHeaders['Access-Control-Allow-Origin'])return new Response(null,{status:403});return new Response(null,{status:204,headers:{...responseHeaders,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'}});}
