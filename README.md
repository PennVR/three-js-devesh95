# CIS 568 - Fireworks
### By Devesh Dayal

This is a passive experience created to allow viewers to watch a fireworks display over the tops of a modern city at night.

## How to Build/Run
Since this project is already pre-built, with a babel-transformed bundle file stored within `build/`, all that is needed to run this experience is to open `index.html` in a WebVR enabled browser. This experience has been developed and tested using an Oculus Rift and may not have unintended display effects/functionality with Google Cardboard and/or HTC Vive.

## Project Analysis
This experience was built entirely using Three.JS and cpu-run JavaScript.

Several optimizations were implemented to speed up the procedural generation of the scene.

1. Object meshes were combined to reduce the number of draw calls made to the GPU. According to [this answer](http://answers.unity3d.com/questions/179017/reducing-drawcalls-many-prefabs-vs-combined-mesh.html) on the Unity forums, there is a tradeoff between merging object meshes and creating independent objects, namely, flexibility. The first rendition of this project created 10000 individual building meshes with custom textures. However, by merging each of the building meshes into a parent city mesh and applying a common randomized texture to the building geometry faces, the number of draw calls to the GPU drastically decreased. The feel, or virtual reality, of the scene was quite the same given that the primary focus of the experience is meant to be the fireworks in the sky!

2. 2D Perlin noise was used to generate building heights. A height map is generated using the updated Simplex method of the famous Perlin noise algorithm to generate the heights of the buildings in the surrounding viewscape. While this would normally form smooth rises and falls in building heights (similar to what you might see in a mountain horizon), the x-coordinates of each of the buildings was randomized to create a more disjointed skyline which closer resembles cityscapes.

3. Buildings require textures! Each building required textures to represent lights on inside. This was tricky at first because each of the buildings had different face areas (since their height was randomzied!). After poking around on the internet for a bit, I found the best solution was create a small canvas to represent the texture and then [scale it up](http://stackoverflow.com/questions/10525107/html5-canvas-image-scaling-issue) to match a larger area. This was pretty helpful, specially since I combined the buidling meshes into my parent city mesh!

4. Buildings need to look realistic. The first few renditions of the project really didn't have buildings that looked too realistic - just black cuboids with a couple of white/yellow squares on them. However, by adding gradients to make the top of the buildings lighter than the bottom...they suddnely looked a lot more like 3d edifices!

5. Buidlings in the distance shouldn't be as sharp as buildings closer to the center. Luckily, Three.JS has fog as a pluggable scene element! This automatically added in realistic depth of field and ambient occlusion to the experience.

## Reflections
ThreeJS is a high quality and easy to use portal to the fascinating world of GPU-based computation and virtual reality. The hardest part of this project was simply balancing the tradeoff between computatability and detail. For instance, not all buildings in a city are cuboidal in nature, but in order to randomly add spires/domes to the roofs of buildings in sight adds little to the experience but a lot to the computation overhead.

In hindsight it might have been better if I had...


