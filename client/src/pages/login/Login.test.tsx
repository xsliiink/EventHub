import { TextEncoder, TextDecoder } from 'util';
Object.assign(global, { TextEncoder, TextDecoder });

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from './Login';
import { BrowserRouter } from 'react-router-dom';

// 1. Мокаем навигацию, чтобы не грузить весь роутер
const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom'),
   useNavigate: () => mockedUsedNavigate,
}));

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn(); // Подменяем реальный fetch
  });

  it('should show success message and save token on successful login', async () => {
    // Arrange: имитируем успешный ответ сервера
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'fake-token', user: { id: 1, username: 'testuser' } }),
    });

    render(<BrowserRouter><Login /></BrowserRouter>);

    // Act: вводим данные и жмем кнопку
    fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: '12345' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    // Assert: проверяем результат
    await waitFor(() => {
      expect(screen.getByText(/Login Successfull!/i)).toBeInTheDocument();
      expect(localStorage.getItem('token')).toBe('fake-token');
      expect(mockedUsedNavigate).toHaveBeenCalledWith('/');
    });
  });
});