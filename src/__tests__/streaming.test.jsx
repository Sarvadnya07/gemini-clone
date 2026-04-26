import { useContext } from 'react';
import { render, screen, act } from '@testing-library/react';
import { expect, it, describe, vi, beforeAll, afterAll, afterEach } from 'vitest';
import ContextProvider, { Context } from '../context/context';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Mock the API base URL
const API_URL = 'http://localhost:5000/api/chat/stream';

const server = setupServer(
  http.post('http://localhost:5000/api/chat/stream', () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('Hello'));
        setTimeout(() => {
          controller.enqueue(encoder.encode(' World'));
          controller.close();
        }, 10);
      },
    });
    return new HttpResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  }),
  http.post('http://localhost:5000/api/generate-title', () => {
    return HttpResponse.json({ title: 'Mocked Title' });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock Firebase and other utils
vi.mock('../config/firebase', () => ({
  onAuthChange: vi.fn((cb) => {
    cb(null);
    return () => {};
  }),
  loginWithGoogle: vi.fn(),
  logout: vi.fn(),
}));

vi.mock('../utils/moderation', () => ({
  checkContent: vi.fn(() => ({ flagged: false })),
}));

vi.mock('../utils/analytics', () => ({
  logEvent: vi.fn(),
}));

describe('Context Streaming Logic', () => {
  it('should update messages with streamed content', async () => {
    const TestComponent = () => {
      const { messages, onSent } = useContext(Context);
      return (
        <div>
          <button onClick={() => onSent('test prompt')}>Send</button>
          <div data-testid="messages">
            {messages.map(m => <div key={m.id}>{m.content}</div>)}
          </div>
        </div>
      );
    };

    render(
      <ContextProvider>
        <TestComponent />
      </ContextProvider>
    );

    const button = screen.getByText('Send');
    await act(async () => {
      button.click();
    });

    // Initial message should be empty
    expect(screen.getByTestId('messages')).toHaveTextContent('test prompt');

    // Wait for stream to finish
    await vi.waitFor(() => {
      expect(screen.getByTestId('messages')).toHaveTextContent('Hello World');
    }, { timeout: 2000 });
  });
});
