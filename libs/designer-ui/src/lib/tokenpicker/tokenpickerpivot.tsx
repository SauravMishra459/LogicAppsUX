import constants from '../constants';
import type { IPivotStyles } from '@fluentui/react';
import { PivotItem, Pivot } from '@fluentui/react';
import { useIntl } from 'react-intl';

const pivotStyles: Partial<IPivotStyles> = {
  text: {
    '&:hover': {
      color: constants.PANEL_HIGHLIGHT_COLOR,
    },
    fontSize: '16px',
    padding: '10px',
  },
  root: {
    padding: '5px',
  },
};

export enum TokenPickerMode {
  TOKEN = 'token',
  EXPRESSION = 'expression',
}

interface TokenPickerPivotProps {
  selectedKey: string;
  hideExpressions: boolean;
  selectKey: () => void;
  tokenPickerHide?: () => void;
}
export const TokenPickerPivot = ({ selectedKey, hideExpressions, selectKey }: TokenPickerPivotProps): JSX.Element => {
  const intl = useIntl();

  const tokenMode = intl.formatMessage({
    defaultMessage: 'Dynamic content',
    description: 'Token picker mode to insert dynamic content',
  });

  const expressionMode = intl.formatMessage({
    defaultMessage: 'Expression',
    description: 'Token picker mode to insert expressions',
  });

  return (
    <div style={{ display: 'inherit' }}>
      <Pivot styles={pivotStyles} selectedKey={selectedKey} className="msla-panel-menu" onLinkClick={selectKey} linkSize="large">
        <PivotItem key={TokenPickerMode.TOKEN} itemKey={TokenPickerMode.TOKEN} headerText={tokenMode} />
        {hideExpressions ? null : (
          <PivotItem key={TokenPickerMode.TOKEN} itemKey={TokenPickerMode.EXPRESSION} headerText={expressionMode} />
        )}
      </Pivot>
    </div>
  );
};
