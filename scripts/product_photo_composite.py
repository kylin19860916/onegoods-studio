"""Compose OGS's photographed cutouts into clearly labeled studio placeholders."""
import argparse
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
from product_photo_pipeline import backdrop

def paste(canvas, photo, size, center, baseline):
    photo = Image.open(photo).convert('RGBA')
    photo = photo.crop(photo.getchannel('A').getbbox())
    scale = size / max(photo.size)
    photo = photo.resize(tuple(round(n*scale) for n in photo.size),Image.Resampling.LANCZOS)
    x = round(center - photo.width/2)
    shadow = Image.new('L',canvas.size)
    ImageDraw.Draw(shadow).ellipse((x,baseline-16,x+photo.width,baseline+28),fill=82)
    canvas.paste((46,31,58),(0,0,*canvas.size),shadow.filter(ImageFilter.GaussianBlur(24)))
    canvas.alpha_composite(photo,(x,baseline-photo.height))

def save(canvas, output, name, sizes):
    for width,height in sizes:
        canvas.convert('RGB').resize((width,height),Image.Resampling.LANCZOS).save(output/f'{name}-{width}.webp',quality=82)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('cutouts',type=Path)
    parser.add_argument('mia',type=Path)
    parser.add_argument('output',type=Path)
    args = parser.parse_args()
    args.output.mkdir(parents=True,exist_ok=True)
    photos = args.cutouts
    hero = backdrop().resize((1600,1200))
    paste(hero,photos/'keynade-mx-cutout.png',585,390,935)
    paste(hero,photos/'cai-shi-yun-cutout.png',560,1120,875)
    paste(hero,args.mia,535,780,1078)
    save(hero,args.output,'hero',[(1600,1200),(800,600)])

    group = backdrop().resize((1600,500))
    for center,name in zip((245,630,980,1370),('keynade-mx','cai-shi-yun','enerkey-magnetic-keychain','lucky-stir-stick')):
        paste(group,photos/f'{name}-cutout.png',310,center,402)
    save(group,args.output,'goods-group',[(1600,500),(800,250)])
