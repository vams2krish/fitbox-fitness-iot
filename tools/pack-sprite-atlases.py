"""Mechanically split generated 6x4 atlases into runtime PNG strips and GIFs.

No redraw or recoloring: preserve each frame, add padding and resize for mobile.
Original prompts and atlas hashes are saved with the exported manifest.
"""
from pathlib import Path
from PIL import Image
import hashlib,json
root=Path(__file__).resolve().parents[1]
jobs=json.loads((root/'docs/source-atlases/manifest.json').read_text(encoding='utf-8'))
target=root/'web/assets/design/sprites';target.mkdir(parents=True,exist_ok=True)
records=[]
for job in jobs:
 source=root/job['source'];im=Image.open(source).convert('RGBA')
 if job.get('trimVertical'):
  box=im.getchannel('A').point(lambda a:255 if a>100 else 0).getbbox()
  if box:im=im.crop((0,max(0,box[1]-8),im.width,min(im.height,box[3]+8)))
 w,h=im.size;rows=len(job['ids'])
 alpha=im.getchannel('A');pixels=alpha.load()
 counts=[sum(pixels[x,y]>100 for x in range(w)) for y in range(h)]
 cuts=[0]
 for row in range(1,rows):
  center=round(h*row/rows);lo=max(cuts[-1]+30,center-70);hi=min(h-30,center+70)
  scores={y:sum(counts[max(0,y-2):min(h,y+3)]) for y in range(lo,hi)}
  minimum=min(scores.values());cut=min((y for y in scores if scores[y]<=minimum+5),key=lambda y:abs(y-center));cuts.append(cut)
 cuts.append(h)
 for row,id in enumerate(job['ids']):
  frames=[]
  for col in range(6):
   crop=im.crop((round(col*w/6),cuts[row],round((col+1)*w/6),cuts[row+1]));crop.thumbnail((90,90),Image.Resampling.NEAREST)
   frame=Image.new('RGBA',(96,96));frame.alpha_composite(crop,((96-crop.width)//2,(96-crop.height)//2));frames.extend([frame,frame.copy()])
  strip=Image.new('RGBA',(1152,96))
  for n,frame in enumerate(frames):strip.alpha_composite(frame,(n*96,0))
  strip.save(target/(id+'.png'),optimize=True)
  # GIF exports use an opaque FitBox backdrop; app PNG strips preserve transparency.
  gif=[]
  for frame in frames:
   bg=Image.new('RGBA',(96,96),'#edf2ff');bg.alpha_composite(frame);gif.append(bg.convert('RGB'))
  gif[0].save(target/(id+'.gif'),save_all=True,append_images=gif[1:],duration=150,loop=0)
 records.append({'index':job['index'],'ids':job['ids'],'prompt':job['prompt'],'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'rowCuts':cuts,'mode':'Built-in image generation, reference-guided atlas; mechanical frame packing'})
(root/'docs/animation-atlases.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
(target/'manifest.json').write_text(json.dumps({'size':96,'frames':12,'uniqueFrames':6,'layout':'horizontal','ids':list(dict.fromkeys(id for job in jobs for id in job['ids'])),'source':'docs/animation-atlases.json','purpose':'Illustrative exercise loops; not measured form feedback.'},indent=2),encoding='utf-8')
print('Packed',len(set(id for j in jobs for id in j['ids'])),'reference-guided sprite sheets.')
