import { render, screen } from '@testing-library/react';
import App from './App';

test('renders main TODO APP heading', () => {
  render(<App />);
  const todoApp = screen.getByText(/TODO APP/i);
  expect(todoApp).toBeInTheDocument();
});
