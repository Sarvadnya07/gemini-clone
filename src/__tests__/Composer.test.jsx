import React from 'react'
import { render, screen } from '@testing-library/react'
import Composer from '../components/Composer/Composer'
import ContextProvider from '../context/context'

describe('Composer component', () => {
  it('renders input placeholder', () => {
    render(
      <ContextProvider>
        <Composer />
      </ContextProvider>
    );
    expect(screen.getByPlaceholderText('Enter a prompt here')).toBeInTheDocument();
  });
});
