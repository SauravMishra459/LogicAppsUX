import DropDown from '../../Dropdown';
import { TextInput } from './textinput';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

const basicColors = [
  '#d0021b',
  '#f5a623',
  '#f8e71c',
  '#8b572a',
  '#7ed321',
  '#417505',
  '#bd10e0',
  '#9013fe',
  '#4a90e2',
  '#50e3c2',
  '#b8e986',
  '#000000',
  '#4a4a4a',
  '#9b9b9b',
  '#ffffff',
];

const WIDTH = 214;
const HEIGHT = 150;

interface ColorPickerProps {
  buttonAriaLabel?: string;
  buttonClassName: string;
  buttonIconClassName?: string;
  buttonLabel?: string;
  color: string;
  children?: ReactNode;
  onChange?: (color: string) => void;
  title?: string;
}

export const ColorPicker = ({ color, children, onChange, ...dropdownProps }: ColorPickerProps) => {
  const [selfColor, setSelfColor] = useState(transformColor('hex', color));
  const [inputColor, setInputColor] = useState(color);
  const innerDivRef = useRef(null);

  const saturationPosition = useMemo(
    () => ({
      x: (selfColor.hsv.saturation / 100) * WIDTH,
      y: ((100 - selfColor.hsv.value) / 100) * HEIGHT,
    }),
    [selfColor.hsv.saturation, selfColor.hsv.value]
  );

  const huePosition = useMemo(
    () => ({
      x: (selfColor.hsv.hue / 360) * WIDTH,
    }),
    [selfColor.hsv]
  );

  const onSetHex = (hex: string) => {
    setInputColor(hex);
    if (/^#[0-9A-Fa-f]{6}$/i.test(hex)) {
      const newColor = transformColor('hex', hex);
      setSelfColor(newColor);
    }
  };

  const onMoveSaturation = ({ x, y }: Position) => {
    const newHsv = {
      ...selfColor.hsv,
      s: (x / WIDTH) * 100,
      v: 100 - (y / HEIGHT) * 100,
    };
    const newColor = transformColor('hsv', newHsv);
    setSelfColor(newColor);
    setInputColor(newColor.hex);
  };

  const onMoveHue = ({ x }: Position) => {
    const newHsv = { ...selfColor.hsv, h: (x / WIDTH) * 360 };
    const newColor = transformColor('hsv', newHsv);

    setSelfColor(newColor);
    setInputColor(newColor.hex);
  };

  useEffect(() => {
    // Check if the dropdown is actually active
    if (innerDivRef.current !== null && onChange) {
      onChange(selfColor.hex);
      setInputColor(selfColor.hex);
    }
  }, [selfColor, onChange]);

  useEffect(() => {
    if (color === undefined) return;
    const newColor = transformColor('hex', color);
    setSelfColor(newColor);
    setInputColor(newColor.hex);
  }, [color]);

  return (
    <DropDown {...dropdownProps} stopCloseOnClickSelf={true}>
      <div className="color-picker-wrapper" style={{ width: WIDTH }} ref={innerDivRef}>
        <TextInput label="Hex" onChange={onSetHex} value={inputColor} />
        <div className="color-picker-basic-color">
          {basicColors.map((basicColor) => (
            <button
              className={basicColor === selfColor.hex ? ' active' : ''}
              key={basicColor}
              style={{ backgroundColor: basicColor }}
              onClick={() => {
                setInputColor(basicColor);
                setSelfColor(transformColor('hex', basicColor));
              }}
            />
          ))}
        </div>
        <MoveWrapper
          className="color-picker-saturation"
          style={{ backgroundColor: `hsl(${selfColor.hsv.hue}, 100%, 50%)` }}
          onChange={onMoveSaturation}
        >
          <div
            className="color-picker-saturation_cursor"
            style={{
              backgroundColor: selfColor.hex,
              left: saturationPosition.x,
              top: saturationPosition.y,
            }}
          />
        </MoveWrapper>
        <MoveWrapper className="color-picker-hue" onChange={onMoveHue}>
          <div
            className="color-picker-hue_cursor"
            style={{
              backgroundColor: `hsl(${selfColor.hsv.hue}, 100%, 50%)`,
              left: huePosition.x,
            }}
          />
        </MoveWrapper>
        <div className="color-picker-color" style={{ backgroundColor: selfColor.hex }} />
      </div>
      {children}
    </DropDown>
  );
};

export interface Position {
  x: number;
  y: number;
}

interface MoveWrapperProps {
  className?: string;
  style?: React.CSSProperties;
  onChange: (position: Position) => void;
  children: JSX.Element;
}

function MoveWrapper({ className, style, onChange, children }: MoveWrapperProps) {
  const divRef = useRef<HTMLDivElement>(null);

  const move = (e: React.MouseEvent | MouseEvent): void => {
    if (divRef.current) {
      const { current: div } = divRef;
      const { width, height, left, top } = div.getBoundingClientRect();

      const x = clamp(e.clientX - left, width, 0);
      const y = clamp(e.clientY - top, height, 0);

      onChange({ x, y });
    }
  };

  const onMouseDown = (e: React.MouseEvent): void => {
    if (e.button !== 0) return;

    move(e);

    const onMouseMove = (_e: MouseEvent): void => {
      move(_e);
    };

    const onMouseUp = (_e: MouseEvent): void => {
      document.removeEventListener('mousemove', onMouseMove, false);
      document.removeEventListener('mouseup', onMouseUp, false);

      move(_e);
    };

    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('mouseup', onMouseUp, false);
  };

  return (
    <div ref={divRef} className={className} style={style} onMouseDown={onMouseDown}>
      {children}
    </div>
  );
}

function clamp(value: number, max: number, min: number) {
  return value > max ? max : value < min ? min : value;
}

interface RGB {
  blue: number;
  green: number;
  red: number;
}
interface HSV {
  hue: number;
  saturation: number;
  value: number;
}
interface Color {
  hex: string;
  hsv: HSV;
  rgb: RGB;
}

export function toHex(value: string): string {
  let currValue = value;
  if (!value.startsWith('#')) {
    const ctx = document.createElement('canvas').getContext('2d');

    if (!ctx) {
      throw new Error('2d context not supported or canvas already initialized');
    }

    ctx.fillStyle = value;

    return ctx.fillStyle;
  } else if (currValue.length === 4 || currValue.length === 5) {
    currValue = value
      .split('')
      .map((v, i) => (i ? v + v : '#'))
      .join('');

    return currValue;
  } else if (currValue.length === 7 || currValue.length === 9) {
    return currValue;
  }

  return '#000000';
}

function hex2rgb(hex: string): RGB {
  const rbgArr = (
    hex
      .replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => '#' + r + r + g + g + b + b)
      .substring(1)
      .match(/.{2}/g) || []
  ).map((x) => parseInt(x, 16));

  return {
    blue: rbgArr[2],
    green: rbgArr[1],
    red: rbgArr[0],
  };
}

function rgb2hsv({ red, green, blue }: RGB): HSV {
  const newRed = red / 255;
  const newGreen = green / 255;
  const newBlue = blue / 255;

  const max = Math.max(newRed, newGreen, newBlue);
  const difference = max - Math.min(newRed, newGreen, newBlue);

  const hue = difference
    ? (max === newRed
        ? (newGreen - newBlue) / difference + (newGreen < newBlue ? 6 : 0)
        : max === newGreen
        ? 2 + (newBlue - newRed) / difference
        : 4 + (newRed - newGreen) / difference) * 60
    : 0;
  const saturation = max ? (difference / max) * 100 : 0;
  const value = max * 100;

  return { hue, saturation, value };
}

function hsv2rgb({ hue, saturation, value }: HSV): RGB {
  const currSaturation = saturation / 100;
  const currValue = value / 100;

  const i = ~~(hue / 60);
  const f = hue / 60 - i;
  const p = currValue * (1 - currSaturation);
  const q = currValue * (1 - currSaturation * f);
  const t = currValue * (1 - currSaturation * (1 - f));
  const index = i % 6;

  const red = Math.round([currValue, q, p, p, t, currValue][index] * 255);
  const green = Math.round([t, currValue, currValue, q, p, p][index] * 255);
  const blue = Math.round([p, p, t, currValue, currValue, q][index] * 255);

  return { blue, green, red };
}

function rgb2hex({ blue, green, red }: RGB): string {
  return '#' + [red, green, blue].map((x) => x.toString(16).padStart(2, '0')).join('');
}

function transformColor<M extends keyof Color, C extends Color[M]>(format: M, color: C): Color {
  let hex: Color['hex'] = toHex('#121212');
  let rgb: Color['rgb'] = hex2rgb(hex);
  let hsv: Color['hsv'] = rgb2hsv(rgb);

  if (format === 'hex') {
    const value = color as Color['hex'];

    hex = toHex(value);
    rgb = hex2rgb(hex);
    hsv = rgb2hsv(rgb);
  } else if (format === 'rgb') {
    const value = color as Color['rgb'];

    rgb = value;
    hex = rgb2hex(rgb);
    hsv = rgb2hsv(rgb);
  } else if (format === 'hsv') {
    const value = color as Color['hsv'];

    hsv = value;
    rgb = hsv2rgb(hsv);
    hex = rgb2hex(rgb);
  }

  return { hex, hsv, rgb };
}
