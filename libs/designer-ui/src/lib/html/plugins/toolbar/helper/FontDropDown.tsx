import DropDown, { DropDownItem } from './Dropdown';
import { FONT_FAMILY_OPTIONS, FONT_SIZE_OPTIONS } from './constants';
import { $patchStyleText } from '@lexical/selection';
import type { LexicalEditor } from 'lexical';
import { $isRangeSelection, $getSelection } from 'lexical';
import { useCallback } from 'react';

export function FontDropDown({
  editor,
  value,
  hasStyle,
  setNodeStyles,
}: {
  editor: LexicalEditor;
  value: string;
  hasStyle: string;
  setNodeStyles: (input: Record<string, string>) => void;
}): JSX.Element {
  const handleClick = useCallback(
    (option: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, {
            [hasStyle]: option,
          });
        }
      });
      setNodeStyles({ [hasStyle]: option });
    },
    [editor, hasStyle, setNodeStyles]
  );

  const buttonAriaLabel = hasStyle === 'font-family' ? 'Formatting options for font family' : 'Formatting options for font size';

  return (
    <DropDown
      buttonClassName={'toolbar-item ' + hasStyle}
      buttonLabel={value}
      buttonIconClassName={hasStyle === 'font-family' ? 'icon block-type font-family' : ''}
      buttonAriaLabel={buttonAriaLabel}
    >
      {(hasStyle === 'font-family' ? FONT_FAMILY_OPTIONS : FONT_SIZE_OPTIONS).map(([option, text]) => (
        <DropDownItem
          className={`item ${dropDownActiveClass(value === option)} ${hasStyle === 'font-size' ? 'fontsize-item' : ''}`}
          onClick={() => handleClick(option)}
          key={option}
        >
          <span className="text">{text}</span>
        </DropDownItem>
      ))}
    </DropDown>
  );
}

function dropDownActiveClass(active: boolean) {
  if (active) return 'active dropdown-item-active';
  else return '';
}
