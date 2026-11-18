"""Blender adaptation of the CC BY-SA atlas; see web/models/anatomy/ATTRIBUTION.txt.
Run with --background --factory-startup --python tools/build-anatomy.py.
Source files are downloaded by tools/vendor-anatomy.mjs (pinned hashes).
"""
import bpy,os,json,math
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));OUT=os.path.join(ROOT,'web','models','anatomy');os.makedirs(OUT,exist_ok=True)
for gender in ['male','female']:
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
 bpy.ops.import_scene.gltf(filepath=os.path.join(ROOT,'.cache','anatomy-source','full-body-'+gender+'-mobile.glb'))
 meshes=[x for x in bpy.context.scene.objects if x.type=='MESH']
 corners=[o.matrix_world@Vector(c) for o in meshes for c in o.bound_box];lo=min(c.z for c in corners);hi=max(c.z for c in corners);height=hi-lo;center=(min(c.x for c in corners)+max(c.x for c in corners))/2
 # Use a shared root so node extras and muscle identifiers remain intact.
 root=bpy.data.objects.new('FitBox_Anatomy_'+gender,None);bpy.context.collection.objects.link(root)
 for o in list(bpy.context.scene.objects):
  if o is not root and o.parent is None:o.parent=root
 root.scale=(3.8/height,)*3;root.location=(-center*3.8/height,0,-lo*3.8/height)
 for o in meshes:
  name=(o.name+' '+str(o.get('group',''))).lower();muscle=bool(o.get('muscleId')) or 'muscle' in name
  m=bpy.data.materials.new('FitBox muscle satin' if muscle else 'FitBox connective pearl');m.diffuse_color=(*((.035,.12,.29) if muscle else (.065,.13,.24)),1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=m.diffuse_color;p.inputs['Roughness'].default_value=.44;p.inputs['Metallic'].default_value=.3;o.data.materials.clear();o.data.materials.append(m)
  for f in o.data.polygons:f.use_smooth=True
 # A neutral digital-athlete helmet and training shorts keep the presentation fitness/AI-led.
 def gear_mat(name,color):
  m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=m.diffuse_color;p.inputs['Metallic'].default_value=.38;p.inputs['Roughness'].default_value=.32;return m
 kit=gear_mat('FitBox Midnight Training Kit',(.016,.035,.07));visor=gear_mat('FitBox Vision Visor',(.08,.38,.68))
 bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=20,location=(0,-.005,3.55));helmet=bpy.context.object;helmet.name='Athlete_Helmet';helmet.scale=(.16,.15,.235);helmet.data.materials.append(kit)
 for poly in helmet.data.polygons:poly.use_smooth=True
 bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=16,location=(0,-.132,3.57));v=bpy.context.object;v.name='Athlete_Vision_Visor';v.scale=(.135,.04,.065);v.data.materials.append(visor)
 for poly in v.data.polygons:poly.use_smooth=True
 for side in [-1,1]:
  bpy.ops.mesh.primitive_cylinder_add(vertices=32,radius=.18,depth=.37,location=(side*.17,0,1.64));o=bpy.context.object;o.name='Athlete_Training_Shorts';o.scale=(1,.95,1);o.data.materials.append(kit)
  bevel=o.modifiers.new('Soft garment edge','BEVEL');bevel.width=.045;bevel.segments=3;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=bevel.name)
 bpy.ops.object.select_all(action='SELECT');bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,gender+'.glb'),export_format='GLB',export_extras=True,export_yup=True,export_materials='EXPORT')
 bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'output','FitBox-'+gender+'-anatomy.blend'))
 world=bpy.data.worlds.new('FitBox Studio');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.045,.065,.11,1);world.node_tree.nodes['Background'].inputs[1].default_value=.28;bpy.context.scene.world=world
 def light(loc,power,size,color):
  bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.data.color=color;o.rotation_euler=(Vector((0,0,1.9))-o.location).to_track_quat('-Z','Y').to_euler()
 light((3,-5,6),650,4,(.8,.9,1));light((-3,-2,3),240,4,(.45,.65,1));light((0,3,5),900,3,(.8,.9,1))
 # Imported anatomy faces -Y in Blender, +Z in the exported glTF.
 bpy.ops.object.camera_add(location=(3,-10,3.0));camera=bpy.context.object;camera.rotation_euler=(Vector((0,0,1.9))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=4.3;bpy.context.scene.camera=camera
 scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True;scene.render.resolution_x=600;scene.render.resolution_y=850;scene.render.resolution_percentage=100;scene.render.film_transparent=True;scene.render.image_settings.file_format='PNG';scene.render.filepath=os.path.join(OUT,gender+'-poster.png');bpy.ops.render.render(write_still=True)
print('FITBOX_BLENDER_ATLAS_COMPLETE')
