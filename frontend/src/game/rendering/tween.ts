import * as BABYLON from '@babylonjs/core';

export const MOVE_ANIMATION_FRAMES = 12;
export const CAMERA_ANIMATION_FRAMES = 15;
export const ANIMATION_FPS = 60;

function easeOut(): BABYLON.CubicEase {
  const easing = new BABYLON.CubicEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
  return easing;
}

export function animateVector3(
  target: BABYLON.Node,
  property: string,
  to: BABYLON.Vector3,
  frames: number = MOVE_ANIMATION_FRAMES
): Promise<void> {
  return new Promise((resolve) => {
    const from = (target as unknown as Record<string, BABYLON.Vector3>)[property];
    if (!from || from.equalsWithEpsilon(to, 0.0001)) {
      if (from) {
        from.copyFrom(to);
      }
      resolve();
      return;
    }
    const animatable = BABYLON.Animation.CreateAndStartAnimation(
      `${property}Tween`,
      target,
      property,
      ANIMATION_FPS,
      frames,
      from.clone(),
      to.clone(),
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
      easeOut(),
      () => resolve()
    );
    if (!animatable) {
      (target as unknown as Record<string, BABYLON.Vector3>)[property].copyFrom(to);
      resolve();
    }
  });
}

export function animateNumber(
  target: BABYLON.Node,
  property: string,
  to: number,
  frames: number,
  scene: BABYLON.Scene
): Promise<void> {
  return new Promise((resolve) => {
    const from = (target as unknown as Record<string, number>)[property];
    if (Math.abs(from - to) < 1e-4) {
      resolve();
      return;
    }
    const anim = new BABYLON.Animation(
      `${property}Tween`,
      property,
      ANIMATION_FPS,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    anim.setKeys([
      { frame: 0, value: from },
      { frame: frames, value: to },
    ]);
    anim.setEasingFunction(easeOut());
    scene.beginDirectAnimation(target, [anim], 0, frames, false, 1, () => resolve());
  });
}

export function shortestAngleTo(from: number, to: number): number {
  let delta = to - from;
  while (delta > Math.PI) {
    delta -= 2 * Math.PI;
  }
  while (delta < -Math.PI) {
    delta += 2 * Math.PI;
  }
  return from + delta;
}

export function animateMeshTo(
  mesh: BABYLON.TransformNode,
  to: BABYLON.Vector3,
  frames: number = MOVE_ANIMATION_FRAMES
): Promise<void> {
  return animateVector3(mesh, 'position', to, frames);
}

export function animateScaleToZero(
  mesh: BABYLON.TransformNode,
  frames: number = MOVE_ANIMATION_FRAMES
): Promise<void> {
  return animateVector3(mesh, 'scaling', BABYLON.Vector3.Zero(), frames);
}
