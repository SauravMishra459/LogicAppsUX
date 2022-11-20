import type { BaseEditorProps } from '../editor/base';
import { BaseEditor } from '../editor/base';
import { useState } from 'react';

export const HTMLEditor = ({ placeholder, readonly, initialValue, tokenPickerHandler }: BaseEditorProps): JSX.Element => {
  const [currFontType] = useState('Arial');
  const [currFontSize] = useState('14px');

  console.log(currFontSize, currFontType);
  return (
    <BaseEditor
      className="msla-html-editor"
      readonly={readonly}
      placeholder={placeholder}
      BasePlugins={{ tokens: true, clearEditor: true, toolBar: true, tabbable: true }}
      initialValue={initialValue}
      tokenPickerHandler={{ ...tokenPickerHandler, tokenPickerButtonProps: { buttonClassName: 'msla-htmlEditor-tokenpicker-button' } }}
    />
  );
};
