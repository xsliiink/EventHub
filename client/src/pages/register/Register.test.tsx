import { TextEncoder, TextDecoder } from 'util';
Object.assign(global, { TextEncoder, TextDecoder });

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Register from './Register';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

const mockedUsedNavigate = jest.fn();

jest.mock('react-router-dom',() =>({
    ...jest.requireActual('react-router-dom'),
    useNavigate : () => mockedUsedNavigate,
    })
);

describe('Register Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();
    });

    it('should show success message and navigate on successful registration', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                message: 'User registered successfully',userId: 1
            }),
        });

        render(<BrowserRouter><Register /></BrowserRouter>);

        fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'newuser' } });
        fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'newpassword' } });
        fireEvent.click(screen.getByRole('button', {name: /Next/i}));
        // Simulate filling out hobbies and bio in step 2

        const musicCheckbox = screen.getByLabelText(/Music/i);
        const sportsCheckbox = screen.getByLabelText(/Sports/i);

        fireEvent.click(musicCheckbox);
        fireEvent.click(sportsCheckbox);

        expect(musicCheckbox).toBeChecked();
        expect(sportsCheckbox).toBeChecked();
        fireEvent.click(screen.getByRole('button', {name: /Next/i}));

        //Simulate avatar upload

        const user = userEvent.setup();
        const file = new File(['hello'], 'avatar.png', {type: 'image/png'});
        const input = screen.getByLabelText(/Avatar Upload/i);

        await user.upload(input,file);
        fireEvent.click(screen.getByRole('button', {name: /Next/i}));

        //Simulate entering bio
        fireEvent.change(screen.getByPlaceholderText(/Tell us about yourself/i), {target: {value: 'This is my bio'}})
        fireEvent.click(screen.getByRole('button', {name: /Finish/i}));

        //Assert : checking the results
        await waitFor(() => {
            expect(screen.getByText(/Registration succesfull! 🎉/i)).toBeInTheDocument();
        })
    });
});