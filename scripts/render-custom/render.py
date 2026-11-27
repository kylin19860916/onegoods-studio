"""Render geometry exported from the production customizers with Blender Cycles."""
import json
import math
import sys
from pathlib import Path
import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector

arguments = sys.argv[sys.argv.index('--') + 1:]
source, output = map(Path, arguments[:2])
face_view = '--face' in arguments[2:]
view = 'face' if face_view else 'front34'
camera_azimuth, camera_elevation = (0, 86) if face_view else (30, 18)
output.mkdir(parents=True, exist_ok=True)
samples = json.loads(source.read_text())
if face_view:
    samples.pop('press-abc', None)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 256
scene.cycles.adaptive_threshold = 0.10
scene.cycles.use_denoising = True
scene.cycles.seed = 27
scene.render.resolution_x = scene.render.resolution_y = 1024 if face_view else 2048
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.image_settings.color_mode = 'RGBA'
scene.view_settings.view_transform = 'Khronos PBR Neutral' if face_view else 'AgX'
scene.view_settings.exposure = .1 if face_view else 0
scene.world = bpy.data.worlds.new('Neutral fill')
scene.world.use_nodes = True
scene.world.node_tree.nodes['Background'].inputs[0].default_value = (.35, .35, .35, 1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value = .16

def unit(azimuth, elevation):
    a, e = map(math.radians, (azimuth, elevation))
    return Vector((math.sin(a)*math.cos(e), -math.cos(a)*math.cos(e), math.sin(e)))

def aim(obj, target):
    obj.rotation_euler = (target - obj.location).to_track_quat('-Z', 'Y').to_euler()

lamps = [
    ('Key', -45, 45, 5200, 1.00, 240),
    ('Rim', 150, 35, 6500, .60, 105),
    ('Fill', 52, 29, 5800, .25, 230),
]
for name, azimuth, elevation, temperature, energy, size in lamps:
    lamp = bpy.data.lights.new(name, 'AREA')
    if face_view:
        temperature = max(temperature, 5800)
    lamp.energy, lamp.shape, lamp.size = 580000 * energy, 'DISK', size
    lamp.use_shadow = name == 'Key'
    if hasattr(lamp, 'temperature'):
        lamp.use_temperature = True
        lamp.temperature = temperature
    obj = bpy.data.objects.new(name, lamp)
    scene.collection.objects.link(obj)
    obj.location = unit(azimuth, elevation) * 200
    aim(obj, Vector((0, 0, 6)))

bpy.ops.mesh.primitive_plane_add(size=2400, location=(0, 0, -0.012))
floor = bpy.context.object
floor.is_shadow_catcher = True

lens = bpy.data.cameras.new('85 mm')
lens.lens, lens.sensor_width = 85, 36
camera = bpy.data.objects.new('Product camera', lens)
scene.collection.objects.link(camera)
scene.camera = camera
materials = {}

def material(color):
    if color in materials:
        return materials[color]
    rgba = [int(color[i:i+2], 16) / 255 for i in (1, 3, 5)]
    rgb = [v / 12.92 if v <= .04045 else ((v+.055)/1.055)**2.4 for v in rgba]
    pla = bpy.data.materials.new(color)
    pla.use_nodes = True
    nodes, links = pla.node_tree.nodes, pla.node_tree.links
    bsdf = nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = (*rgb, 1)
    bsdf.inputs['Roughness'].default_value = .60
    bsdf.inputs['Metallic'].default_value = 0
    bsdf.inputs['Coat Weight'].default_value = 0
    bands = nodes.new('ShaderNodeTexWave')
    bands.bands_direction = 'Z'
    bands.inputs['Scale'].default_value = math.tau / (20 * .2)
    coords = nodes.new('ShaderNodeTexCoord')
    bump = nodes.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value = .10
    bump.inputs['Distance'].default_value = .012
    links.new(coords.outputs['Object'], bands.inputs['Vector'])
    links.new(bands.outputs['Fac'], bump.inputs['Height'])
    links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    materials[color] = pla
    return pla

for sample in samples.values():
    points = [pt for mesh in sample['meshes'] for pt in mesh['vertices']]
    low = Vector(tuple(min(p[i] for p in points) for i in range(3)))
    high = Vector(tuple(max(p[i] for p in points) for i in range(3)))
    translate = Vector(((low.x+high.x)/2, (low.y+high.y)/2, low.z))
    sample['points'] = [Vector(p)-translate for p in points]
    sample['offset'] = translate
    sample['dimensions'] = high - low

def frame(sample, distance):
    target = Vector((0, 0, sample['dimensions'].z / 2))
    camera.location = target + unit(camera_azimuth, camera_elevation) * distance
    aim(camera, target)
    lens.shift_x = lens.shift_y = 0
    bpy.context.view_layer.update()
    projected = [world_to_camera_view(scene,camera,v) for v in sample['points']]
    x0, x1 = min(p.x for p in projected), max(p.x for p in projected)
    y0, y1 = min(p.y for p in projected), max(p.y for p in projected)
    lens.shift_x = (x0 + x1) / 2 - .5
    lens.shift_y = (y0 + y1) / 2 - .5 if face_view else y0 - .22
    return max(x1-x0,y1-y0)

near, far = 100, 900
for _ in range(13):
    middle = (near+far)/2
    largest = max(frame(samples[name], middle) for name in ('nameplate','press','articulated'))
    if largest > (.76 if face_view else .64): near = middle
    else: far = middle
distance = round(far, 3)

for name, sample in samples.items():
    required = ('.png','.json') if face_view else ('.png','_shadow-raw.png','.json')
    if all((output / f'{name}_{view}{suffix}').is_file() for suffix in required):
        continue
    sample_distance = round(distance * 1.65, 3) if name == 'press-abc' else distance
    span = frame(sample, sample_distance)
    objects = []
    for index, part in enumerate(sample['meshes']):
        mesh = bpy.data.meshes.new(f'{name}-{index}')
        mesh.from_pydata([Vector(p)-sample['offset'] for p in part['vertices']], [], part['triangles'])
        mesh.update()
        obj = bpy.data.objects.new(mesh.name, mesh)
        scene.collection.objects.link(obj)
        obj.data.materials.append(material(part['color']))
        # Keep the exact customizer silhouette and add narrow highlights to hard edges.
        if len(mesh.vertices) < 20000:
            bpy.context.view_layer.objects.active = obj
            obj.select_set(True)
            bpy.ops.object.mode_set(mode='EDIT')
            bpy.ops.mesh.select_all(action='SELECT')
            bpy.ops.mesh.remove_doubles(threshold=0.0001)
            bpy.ops.object.mode_set(mode='OBJECT')
            obj.select_set(False)
            bevel = obj.modifiers.new('Highlight hard edges', 'BEVEL')
            bevel.width, bevel.segments, bevel.angle_limit = .3, 2, .6
        objects.append(obj)
    scene.render.filepath = str(output / f'{name}_{view}.png')
    floor.hide_render = True
    scene.render.resolution_percentage = 100
    scene.cycles.samples = 96 if face_view else 256
    if not Path(scene.render.filepath).is_file():
        bpy.ops.render.render(write_still=True)
    if not face_view:
        floor.hide_render = False
        for obj in objects:
            obj.visible_camera = False
        scene.render.filepath = str(output / f'{name}_front34_shadow-raw.png')
        scene.render.resolution_percentage = 50
        scene.cycles.samples = 24
        bpy.ops.render.render(write_still=True)
        scene.render.resolution_percentage = 100
    metadata = {k: sample[k] for k in ('name','font','source','palette')}
    metadata.update(
        renderer=f'Blender {bpy.app.version_string} Cycles', resolution=[scene.render.resolution_x,scene.render.resolution_y],
        dimensions_mm=list(sample['dimensions']),
        camera={'lens_mm':85,'sensor_mm':36,'azimuth':camera_azimuth,'elevation':camera_elevation,'distance_mm':sample_distance,
                'product_span':round(span,4),'product_baseline':None if face_view else .78},
        lamps=lamps, samples=96 if face_view else 256, denoise=True, layer_period_mm=.2, roughness=.60, bevel_mm=.3,
    )
    (output / f'{name}_{view}.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+'\n')
    for obj in objects:
        bpy.data.objects.remove(obj,do_unlink=True)
