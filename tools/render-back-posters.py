"""Render reverse views from the existing licensed FitBox Blender adaptations."""
import bpy,os
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
for gender in ['male','female']:
 bpy.ops.wm.open_mainfile(filepath=os.path.join(ROOT,'output','FitBox-'+gender+'-anatomy.blend'))
 for o in list(bpy.data.objects):
  if o.type in ['LIGHT','CAMERA']:bpy.data.objects.remove(o,do_unlink=True)
 world=bpy.data.worlds.new('Reverse studio');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[1].default_value=.28;bpy.context.scene.world=world
 for loc,power,size in [((3,5,6),650,4),((-3,2,3),240,4),((0,-3,5),900,3)]:
  bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.data.energy=power;o.data.size=size;o.data.color=(.7,.85,1);o.rotation_euler=(Vector((0,0,1.9))-o.location).to_track_quat('-Z','Y').to_euler()
 bpy.ops.object.camera_add(location=(-3,10,3));camera=bpy.context.object;camera.rotation_euler=(Vector((0,0,1.9))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=4.3;scene=bpy.context.scene;scene.camera=camera;scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True;scene.render.resolution_x=600;scene.render.resolution_y=850;scene.render.resolution_percentage=100;scene.render.film_transparent=True;scene.render.image_settings.file_format='PNG';scene.render.filepath=os.path.join(ROOT,'web','models','anatomy',gender+'-back-poster.png');bpy.ops.render.render(write_still=True)
