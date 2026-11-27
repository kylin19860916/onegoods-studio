"""Reframe approved product photos on the OGS studio background."""
import argparse
import subprocess
from pathlib import Path
from tempfile import TemporaryDirectory
from PIL import Image, ImageDraw, ImageFilter, ImageOps

SIZE = 1600
BACKGROUND_TOP = (237,230,245)
BACKGROUND_BOTTOM = (222,212,236)

def cutout(path, mask_command, work):
    image = ImageOps.exif_transpose(Image.open(path)).convert('RGB')
    image.thumbnail((2200,2200),Image.Resampling.LANCZOS)
    prepared, mask_path = (work/'original.png',work/'mask.png')
    image.save(prepared)
    subprocess.run([mask_command, str(prepared), str(mask_path)],check=True)
    mask = Image.open(mask_path).convert('L').resize(image.size,Image.Resampling.LANCZOS)
    mask = mask.point(lambda level: 0 if level < 20 else level)
    bounds = mask.getbbox()
    if not bounds:
        raise ValueError(f'Empty subject mask: {path}')
    image.putalpha(mask)
    return image.crop(bounds)

def backdrop():
    gradient = Image.new('RGB',(1,SIZE))
    gradient.putdata([tuple(round(a+(b-a)*y/(SIZE-1)) for a,b in zip(BACKGROUND_TOP,BACKGROUND_BOTTOM)) for y in range(SIZE)])
    return gradient.resize((SIZE,SIZE)).convert('RGBA')

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('source',type=Path)
    parser.add_argument('destination',type=Path)
    parser.add_argument('--mask-command',required=True)
    args = parser.parse_args()
    args.destination.mkdir(exist_ok=True,parents=True)
    with TemporaryDirectory() as tmp:
        subject = cutout(args.source,args.mask_command,Path(tmp))
    subject.thumbnail((round(SIZE*.68),round(SIZE*.68)),Image.Resampling.LANCZOS)
    scale = .68*SIZE/max(subject.size)
    if scale > 1:
        subject = subject.resize(tuple(round(n*scale) for n in subject.size),Image.Resampling.LANCZOS)
    x = (SIZE-subject.width)//2
    baseline = round(SIZE*.83)
    shadow = Image.new('L',(SIZE,SIZE))
    draw = ImageDraw.Draw(shadow)
    draw.ellipse((x+subject.width*.06,baseline-18,x+subject.width*.99,baseline+18),fill=95)
    shadow = shadow.filter(ImageFilter.GaussianBlur(24))
    canvas = backdrop()
    canvas.paste((46,31,58),(0,0,SIZE,SIZE),shadow)
    canvas.alpha_composite(subject,(x,baseline-subject.height))
    for width in (1600,800):
        canvas.convert('RGB').resize((width,width),Image.Resampling.LANCZOS).save(args.destination/f'{args.source.stem}-{width}.webp',quality=82)
    subject.save(args.destination/f'{args.source.stem}-cutout.png')

if __name__ == '__main__':
    main()
