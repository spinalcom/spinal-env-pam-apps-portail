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

export function hexaToHSV(color: string) {
  const { r, g, b } = hexaToRGB(color);
  return RGBtoHSV(r, g, b);
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

function RGBtoHSV(r: number, g: number, b: number) {
  (r /= 255), (g /= 255), (b /= 255);

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0;
  const v = max,
    d = max - min;
  const s = max == 0 ? 0 : d / max;

  if (max != min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return { h, s, v };
}

export function singleColorGradiant(size: number, color: number) {
  if (size === 0) return [];
  const colors = [];
  const step = Math.round(100 / size);
  let s = 100;
  let v = 100;

  for (let i = 0; i < size; i++) {
    const { r, g, b } = HSVtoRGB(color / 100, s / 100, v / 100);
    colors.push(`rgba(${r}, ${g}, ${b}, 1)`);
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
      element.color = RGBtoHexa(r, g, b);
    }
  }
  return to;
}

function hexaToRGB(color: string) {
  if (color.length == 4)
    color =
      color[0] +
      color[1] +
      color[1] +
      color[2] +
      color[2] +
      color[3] +
      color[3];
  let col = color[1] + color[2];
  const red = parseInt(col, 16);
  col = color[3] + color[4];
  const green = parseInt(col, 16);
  col = color[5] + color[6];
  const blue = parseInt(col, 16);

  return { r: red, g: green, b: blue };
}

export function RGBtoHexa(r: number, g: number, b: number) {
  let red = r.toString(16);
  red = red.length === 2 ? red : "0" + red;
  let green = g.toString(16);
  green = green.length === 2 ? green : "0" + green;
  let blue = b.toString(16);
  blue = blue.length === 2 ? blue : "0" + blue;
  return `#${red}${green}${blue}`;
}
