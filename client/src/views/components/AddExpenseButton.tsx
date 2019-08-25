import React from 'react';
import { PlusIcon } from './MoneyPad/icons';

export const AddExpenseButton: React.FC<{ onClick: () => void }> = ({
  onClick
}) => (
  <button className="circle-icon-button" onClick={onClick}>
    <PlusIcon width="70%" height="70%" color="#76abe9" />
  </button>
);
