"""Render distinct, illustrative body preferences from the licensed FitBox Blender asset."""
import bpy,os,math
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));OUT=os.path.join(ROOT,'web','models','anatomy','body-types');os.makedirs(OUT,exist_ok=True)
shapes={'thin':(.69,.72,.70,.92,.76),'lean':(.83,.87,.83,.97,.88),'muscle':(1.16,.89,1.03,1,1.09),'fit':(.98,.92,.94,1,.96),'bulk':(1.20,1.33,1.24,1.02,1.29),'strong':(1.42,1.13,1.28,1.04,1.18)}
for gender in ['male','female']:
 for name,(shoulder,waist,hip,head,depth) in shapes.items():
  bpy.ops.wm.open_mainfile(filepath=os.path.join(ROOT,'output','FitBox-'+gender+'-anatomy.blend'))
  for o in list(bpy.data.objects):
   if o.type in ['LIGHT','CAMERA']:bpy.data.objects.remove(o,do_unlink=True)
  for o in list(bpy.context.scene.objects):
   if o.type!='MESH':continue
   mat=o.matrix_world.copy();inv=mat.inverted()
   for v in o.data.vertices:
    p=mat@v.co;z=p.z
    if z>3.18:factor=head
    elif z>2.65:factor=shoulder
    elif z>2.10:factor=waist+(shoulder-waist)*(z-2.10)/.55
    elif z>1.55:factor=hip+(waist-hip)*(z-1.55)/.55
    else:factor=hip*.94
    p.x*=factor;p.y*=depth;v.co=inv@p
   o.data.update()
  world=bpy.data.worlds.new('Body type studio');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[1].default_value=.35;bpy.context.scene.world=world
  for loc,power,size in [((3,-5,6),700,4),((-3,-2,3),300,4),((0,3,5),850,3)]:
   bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.data.energy=power;o.data.size=size;o.data.color=(.70,.85,1);o.rotation_euler=(Vector((0,0,1.9))-o.location).to_track_quat('-Z','Y').to_euler()
  bpy.ops.object.camera_add(location=(1,-10,2.7));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,1.9))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=4.4;scene=bpy.context.scene;scene.camera=cam;scene.render.engine='CYCLES';scene.cycles.samples=12;scene.cycles.use_denoising=True;scene.render.resolution_x=400;scene.render.resolution_y=600;scene.render.resolution_percentage=100;scene.render.film_transparent=True;scene.render.image_settings.file_format='PNG';scene.render.filepath=os.path.join(OUT,gender+'-'+name+'.png');bpy.ops.render.render(write_still=True)
print('FITBOX_BODY_VARIANTS_COMPLETE')
