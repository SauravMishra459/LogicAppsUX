import { getBrandColorRgbA } from '../card/utils';
import { DELETE_TOKEN_NODE } from '../editor/base/plugins/DeleteTokenNode';
import { CHANGE_TOKENPICKER_EXPRESSION } from '../tokenpicker/plugins/TokenPickerHandler';
import iconSvg from './icon/icon.svg';
import { Icon } from '@fluentui/react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { NodeKey } from 'lexical';
import { useIntl } from 'react-intl';

export interface InputTokenProps {
  brandColor?: string;
  value?: string;
  disableFiltering?: boolean;
  icon?: string;
  isAdvanced?: boolean;
  isSecure?: boolean;
  readOnly?: boolean;
  required?: boolean;
  title: string;
  nodeKey?: NodeKey;
  showTokenPickerSwitch?: (show?: boolean) => void;
}

export const DELETE = '\u00D7';
export const InputToken: React.FC<InputTokenProps> = ({
  value,
  brandColor,
  icon,
  isSecure,
  readOnly,
  title,
  nodeKey,
  showTokenPickerSwitch,
}) => {
  const intl = useIntl();
  const [editor] = useLexicalComposerContext();

  const handleTokenClicked = () => {
    if (nodeKey) {
      showTokenPickerSwitch?.(true);
      setTimeout(() => {
        editor.dispatchCommand(CHANGE_TOKENPICKER_EXPRESSION, nodeKey);
      }, 50);
    }
  };

  const tokenStyle = {
    backgroundColor: brandColor ? getBrandColorRgbA(brandColor) : 'rgba(71, 71, 71, 0.15)',
    backgroundImage: icon ?? `url(${iconSvg})`,
  };

  const tokenDelete = intl.formatMessage({
    defaultMessage: 'Delete',
    description: 'Label of Delete Token Button',
  });

  const handleTokenDeleteClicked = () => {
    if (nodeKey) {
      editor.dispatchCommand(DELETE_TOKEN_NODE, nodeKey);
    }
  };

  const renderTokenDeleteButton = (): JSX.Element | null => {
    if (readOnly) {
      return null;
    }

    return (
      <button
        title={tokenDelete}
        aria-label={tokenDelete}
        className="msla-button msla-token-delete"
        onClick={(e) => {
          e.stopPropagation();
          handleTokenDeleteClicked();
        }}
        onMouseDown={(e) => {
          e.preventDefault();
        }}
      >
        {DELETE}
        {isSecure ? (
          <div className="msla-editor-input-secure-token">
            <Icon iconName="LockSolid" />
          </div>
        ) : null}
      </button>
    );
  };

  return (
    <div className="msla-token msla-input-token" onClick={handleTokenClicked} style={tokenStyle}>
      <div className="msla-token-title" title={value}>
        {title}
      </div>
      {renderTokenDeleteButton()}
    </div>
  );
};
