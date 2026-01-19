import React from 'react'
import { render, screen } from '@testing-library/react'
import Message from '../components/Message/Message'

describe('Message component', () => {
  it('renders user message content', () => {
    render(<Message role="user" content="Hello world" />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders assistant markdown', () => {
    render(<Message role="assistant" content={"**bold** text"} />);
    expect(screen.getByText('bold')).toBeInTheDocument();
  });
});
