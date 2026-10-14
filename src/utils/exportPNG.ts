import { BoardItem, BoardEdge } from '../types';
import { calculateEdgePath } from './geometry';
import { FRAME_STATUS_CONFIGS, RING_CONFIGS } from '../data/constants';
export async function exportPNG(items: BoardItem[], edges: BoardEdge[], name: string) {
  const canvas=document.createElement('canvas');canvas.width=1800;canvas.height=1200;
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas');
  ctx.fillStyle='#050608';ctx.fillRect(0,0,1800,1200);
  const left=Math.min(0,...items.map(i=>i.x)),top=Math.min(0,...items.map(i=>i.y));
  const right=Math.max(800,...items.map(i=>i.x+i.width)),bottom=Math.max(500,...items.map(i=>i.y+i.height));
  const scale=Math.min(1640/(right-left),1040/(bottom-top));ctx.translate(80,80);ctx.scale(scale,scale);ctx.translate(-left,-top);
  ctx.lineWidth=2;ctx.font='12px sans-serif';ctx.textAlign='center';
  for(const edge of edges){const a=items.find(i=>i.id===edge.fromId),b=items.find(i=>i.id===edge.toId);if(!a||!b)continue;
    const path=calculateEdgePath(a,b);const {x,y}=path.fromPoint;const {x:u,y:v}=path.toPoint;
    ctx.strokeStyle=edge.color||'#6b7280';ctx.setLineDash(edge.isDashed?[6,4]:[]);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(u,v);ctx.stroke();ctx.setLineDash([]);
    const angle=Math.atan2(v-y,u-x);ctx.beginPath();ctx.moveTo(u,v);ctx.lineTo(u-12*Math.cos(angle-.4),v-12*Math.sin(angle-.4));ctx.moveTo(u,v);ctx.lineTo(u-12*Math.cos(angle+.4),v-12*Math.sin(angle+.4));ctx.stroke();ctx.fillStyle='#cbd5e1';ctx.fillText(edge.label||'',(x+u)/2,(y+v)/2-8);
  }
  const lines=(text:string,x:number,y:number,width:number,count:number)=>{ctx.textAlign='left';let line='',row=0;for(const word of text.split(/\s+/)){if(ctx.measureText(line+' '+word).width>width&&line){ctx.fillText(line,x,y+row*17);line=word;if(++row>=count)return;}else line+=(line?' ':'')+word;}ctx.fillText(line,x,y+row*17);};
  for(const item of items){ctx.save();ctx.translate(item.x,item.y);ctx.fillStyle=item.bgHex&&item.bgHex!=='#ffffff'?item.bgHex:'#0c121e';ctx.strokeStyle=FRAME_STATUS_CONFIGS[item.frameStatus]?.color||'#4b5563';ctx.lineWidth=3;
    if(item.type==='CARD'){ctx.beginPath();ctx.roundRect(0,0,item.width,item.height,10);ctx.fill();ctx.stroke();ctx.fillStyle=item.colorHex||'#1d4ed8';ctx.fillRect(0,0,item.width,30);ctx.fillStyle='#fff';ctx.font='bold 12px sans-serif';lines(item.title,10,20,item.width-20,1);ctx.fillStyle='#cbd5e1';ctx.font='11px sans-serif';lines(item.description,10,50,item.width-20,Math.max(1,Math.floor((item.height-55)/17)));}
    else{ctx.beginPath();ctx.arc(item.width/2,item.height/2,item.width/2,0,Math.PI*2);ctx.fill();ctx.stroke();if(item.ringType&&item.ringType!=='NONE'){ctx.strokeStyle=(item.ringTone==='DARK'?RING_CONFIGS[item.ringType].darkColor:RING_CONFIGS[item.ringType].lightColor);ctx.lineWidth=5;ctx.stroke();}ctx.fillStyle='#fff';ctx.font='10px sans-serif';ctx.textAlign='center';ctx.fillText(item.title,item.width/2,item.height/2,item.width-8);}ctx.restore();
  }
  const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('PNG')), 'image/png'));
  const url=URL.createObjectURL(blob);const link=document.createElement('a');link.download=name+'_goruntusu.png';link.href=url;link.click();setTimeout(()=>URL.revokeObjectURL(url),5000);
}
