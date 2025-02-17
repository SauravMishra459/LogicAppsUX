import { openDiscardWarningModal } from '../../core/state/ModalSlice';
import { store } from '../../core/state/Store';
import { WarningModal } from './WarningModal';
import type { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

const MockStore = ({ children }) => {
  store.dispatch(openDiscardWarningModal());
  return <Provider store={store}>{children}</Provider>;
};

export default {
  component: WarningModal,
  title: 'Data Mapper Components/Modal/Warning',
} as ComponentMeta<typeof WarningModal>;

const Template: ComponentStory<typeof WarningModal> = () => <WarningModal />;

export const Standard = Template.bind({});

Standard.decorators = [
  (story) => {
    return <MockStore>{story()}</MockStore>;
  },
];
