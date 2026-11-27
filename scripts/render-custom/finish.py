"""Cap the Cycles shadow-catcher opacity and export transparent web assets."""
import sys
from pathlib import Path
from PIL import Image, ImageChops, ImageFilter, ImageOps

source, output, evidence = map(Path, sys.argv[1:])
output.mkdir(parents=True,exist_ok=True)
evidence.mkdir(parents=True,exist_ok=True)
variants = ['nameplate','press','articulated','press-abc']
for name in variants:
    stem = name+'_front34'
    product = Image.open(source/(stem+'.png')).convert('RGBA')
    raw = Image.open(source/(stem+'_shadow-raw.png')).getchannel('A')
    alpha = raw.resize(product.size,Image.Resampling.LANCZOS).filter(ImageFilter.GaussianBlur(1.5))
    peak = max(alpha.getextrema()[1],1)
    alpha = alpha.point(lambda value: round(89*max(0,value-12)/max(1,peak-12)))
    tail = Image.new('L',(product.width,1))
    margin = product.width * .09
    tail.putdata([round(255*min(1,x/margin,(product.width-1-x)/margin)) for x in range(product.width)])
    alpha = ImageChops.multiply(alpha,tail.resize(product.size))
    shadow = Image.new('RGBA',product.size,(0,0,0,0))
    shadow.putalpha(alpha)
    shadow.save(output/(stem+'_shadow.png'),optimize=True)
    image = Image.alpha_composite(shadow,product)
    image.save(evidence/(stem+'.png'),optimize=True)
    for size in (2048,1024):
        name_for_web = stem + ('-1024' if size == 1024 else '') + '.webp'
        image.resize((size,size),Image.Resampling.LANCZOS).save(output/name_for_web,quality=85,method=4)
    (output/(stem+'.json')).write_bytes((source/(stem+'.json')).read_bytes())

for label, colors in [('stage',('#30243b','#30243b')),('studio',('#ede6f5','#ded4ec'))]:
    width, height = 1500, 500
    gradient = Image.new('L',(1,height))
    gradient.putdata([round(255*y/(height-1)) for y in range(height)])
    board = ImageOps.colorize(gradient.resize((width,height)),*colors).convert('RGBA')
    for index, name in enumerate(variants[:3]):
        image = Image.open(evidence/(name+'_front34.png'))
        board.alpha_composite(image.resize((500,500),Image.Resampling.LANCZOS),(500*index,0))
    board.convert('RGB').save(evidence/f'render-review-{label}.jpg',quality=94)
    if label == 'stage':
        for width in (600,1200):
            board.convert('RGB').resize((width,width//3),Image.Resampling.LANCZOS).save(output/f'trio-{width}.webp',quality=85)
