import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';
import ChatInput from './pages/Chat/ChatInput';

beforeEach(() => {
  URL.createObjectURL = jest.fn((file: Blob) => `blob:mock-${(file as File).name}`);
  URL.revokeObjectURL = jest.fn();
});

test('renders the landing page with login and register options', () => {
  render(<App />);

  expect(screen.getByText(/ai chat/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
});

test('removing one selected image only revokes that image preview', () => {
  render(<ChatInput onSend={jest.fn()} sending={false} />);

  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  const firstFile = new File(['first'], 'one.png', { type: 'image/png' });
  const secondFile = new File(['second'], 'two.png', { type: 'image/png' });

  fireEvent.change(fileInput, {
    target: {
      files: [firstFile, secondFile],
    },
  });

  expect(screen.getAllByRole('img')).toHaveLength(2);

  fireEvent.click(screen.getAllByRole('button', { name: /remove/i })[0]);

  expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-one.png');
  expect(screen.getAllByRole('img')).toHaveLength(1);
});
