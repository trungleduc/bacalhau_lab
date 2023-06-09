import * as React from 'react';
import { useAppSelector } from './redux/hooks';

export function MainView() {
  const state = useAppSelector(state => state);
  console.log('my state', state);

  return <div>Hello</div>;
}
