// Products with no colour choice (just the main photo) are stored with this placeholder colour so
// per-size stock and order deduction keep working. The shop hides it and never asks for a colour.
export const NO_COLOR = '图片色';

export const isNoColor = (color?: string | null) => !color || color === NO_COLOR;

// A lone colour is picked automatically; several colours still need a choice.
export const autoSelectedColor = (colorOptions: string[]): string | null =>
  colorOptions.length === 1 ? colorOptions[0] : null;

// Show the colour picker only when there is a real choice to make or a real colour to display.
export const shouldShowColorPicker = (colorOptions: string[]): boolean =>
  colorOptions.length > 1 || (colorOptions.length === 1 && !isNoColor(colorOptions[0]));
