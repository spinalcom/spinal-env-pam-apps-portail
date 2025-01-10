/*
 * Copyright 2022 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

function updateRGB(rgb: number[], index: number, step: number[]) {
  if (rgb[(index - 1) % 3] < step[0]) {
    step[0] -= rgb[(index - 1) % 3];
    rgb[(index - 1) % 3] = 0;
    const possible = 255 - rgb[(index + 1) % 3];
    if (step[0] < possible) {
      rgb[(index + 1) % 3] += step[0];
      step[0] = 0;
    } else {
      rgb[(index + 1) % 3] = 255;
      step[0] -= possible;
    }
  } else {
    rgb[(index - 1) % 3] -= step[0];
  }
}

export function gradiant(size: number) {
  const colors = [];
  if (size > 0) {
    const step = Math.floor(100 / size);
    let i = 0;
    while (i < 360) {
      colors.push(i);
      i += step;
    }
  }
  return colors;
}

export function barColors() {
  return ["rgba(255,0,11,1)", "rgba(20,32,44,1)", "rgba(17,237,169,1)"];
}

export function HSVtoRGB(h: any, s: any, v: any) {
  let r, g, b;
  if (arguments.length === 1) {
    (s = h.s), (v = h.v), (h = h.h);
  }
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      (r = v), (g = t), (b = p);
      break;
    case 1:
      (r = q), (g = v), (b = p);
      break;
    case 2:
      (r = p), (g = v), (b = t);
      break;
    case 3:
      (r = p), (g = q), (b = v);
      break;
    case 4:
      (r = t), (g = p), (b = v);
      break;
    case 5:
      (r = v), (g = p), (b = q);
      break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export function singleColorGradiant(size: number, color: number) {
  if (size === 0) return [];
  const colors = [];
  const step = Math.round(100 / size);
  let s = 100;
  let v = 100;

  for (let i = 0; i < size; i++) {
    const rgb = HSVtoRGB(color / 100, s / 100, v / 100);
    colors.push(`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`);
    s -= step;
    v -= step;
  }
  return colors.reverse();
}

export function setColors(from: any[], to: any[]) {
  for (const element of to) {
    const found = from.find((e) => e.getDynamicId() === element.dynamicId);
    if (found) {
      const { r, g, b } = HSVtoRGB(found.getColor() / 100, 1, 1);
      let red = r.toString(16);
      red = red.length === 2 ? red : "0" + red;
      let green = g.toString(16);
      green = green.length === 2 ? green : "0" + green;
      let blue = b.toString(16);
      blue = blue.length === 2 ? blue : "0" + blue;
      element.color = `#${red}${green}${blue}`;
    }
  }
  return to;
}
