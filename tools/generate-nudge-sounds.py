"""Original FitBox chimes, dedicated to CC0. No samples or third-party recordings."""
import math,struct,wave
from pathlib import Path
root=Path(__file__).resolve().parents[1]
target=root/'android/app/src/main/res/raw';target.mkdir(parents=True,exist_ok=True)
for name,tones in {'workout':[659.25,830.61,987.77],'rest':[523.25,659.25],'membership':[587.33,783.99]}.items():
 rate=16000;length=.65;values=[]
 for i in range(int(rate*length)):
  time=i/rate;sample=0
  for n,freq in enumerate(tones):
   t=time-n*.14
   if 0<=t<.3:
    envelope=min(1,t/.018)*math.exp(-t*13)*(1-min(1,max(0,(t-.25)/.05)))
    sample+=.14*envelope*(math.sin(2*math.pi*freq*t)+.15*math.sin(2*math.pi*freq*2*t))
  values.append(struct.pack('<h',int(max(-1,min(1,sample))*32767)))
 with wave.open(str(target/('nudge_'+name+'.wav')),'wb') as audio:
  audio.setnchannels(1);audio.setsampwidth(2);audio.setframerate(rate);audio.writeframes(b''.join(values))
print('Generated three original CC0 notification chimes.')
