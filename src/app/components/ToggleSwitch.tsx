import { Switch } from '@headlessui/react';
import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ToggleSwitch = ({ checked, onChange, label, size = 'md' }: ToggleSwitchProps) => {
  const switchSize = {
    sm: { button: 'h-4 w-8', circle: 'h-3 w-3 translate-x-4' },
    md: { button: 'h-5 w-10', circle: 'h-4 w-4 translate-x-5' },
    lg: { button: 'h-6 w-12', circle: 'h-5 w-5 translate-x-6' }
  }[size];

  return (
    <div className="flex items-center group cursor-pointer" onClick={() => onChange(!checked)}>
      <Switch
        checked={checked}
        onChange={onChange}
        className={`${
          checked ? 'bg-[#00c8ff]' : 'bg-gray-600 group-hover:bg-gray-500'
        } relative inline-flex ${switchSize.button} items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#00c8ff]/30 focus:ring-offset-2 focus:ring-offset-gray-900`}
      >
        <span
          className={`transform transition-transform ${
            checked ? switchSize.circle : 'translate-x-1'
          } inline-block bg-white rounded-full`}
          style={{ width: switchSize.circle.split(' ')[1], height: switchSize.circle.split(' ')[0] }}
        />
      </Switch>
      {label && (
        <span className="ml-2 text-sm text-gray-300 group-hover:text-white transition-colors">{label}</span>
      )}
    </div>
  );
};

export default ToggleSwitch;
