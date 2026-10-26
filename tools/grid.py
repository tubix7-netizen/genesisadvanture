import json,base64,io,sys
from PIL import Image, ImageDraw
d=json.load(open('/tmp/claude-poses.json')); ims=[Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))) for _,u in d]
cols=int(sys.argv[2]) if len(sys.argv)>2 else 6; w,h=ims[0].size; rows=(len(ims)+cols-1)//cols
out=Image.new('RGB',(w*cols,h*rows),'white'); dr=ImageDraw.Draw(out)
for i,(im,(l,_)) in enumerate(zip(ims,d)):
    x,y=(i%cols)*w,(i//cols)*h; out.paste(im,(x,y)); dr.rectangle([x,y,x+len(l)*7+6,y+14],fill='black'); dr.text((x+3,y+1),l,fill='white')
out.save(sys.argv[1])
