// Feature: ui-ux-overhaul — Task 5.2 component tests for SaveProfilePrompt.
// Validates: Requirements 4.6 (dismiss removes banner), 4.7 (sign-in starts
// Google flow), 4.8 (dismiss control accessible name), 4.1 (grid layout that
// keeps dismiss / text / action on separate, non-overlapping tracks).

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// --- Mocks --------------------------------------------------------------------
// next-auth/react: the banner only renders for signed-out users, so useSession
// must report no session. signIn is a spy so we can assert the Google flow.
const signInMock = vi.fn();
const useSessionMock = vi.fn(() => ({ data: null }));

vi.mock('next-auth/react', () => ({
  signIn: (...args: unknown[]) => signInMock(...args),
  useSession: () => useSessionMock(),
}));

import { SaveProfilePrompt } from './SaveProfilePrompt';

describe('SaveProfilePrompt', () => {
  beforeEach(() => {
    signInMock.mockClear();
    useSessionMock.mockReturnValue({ data: null });
  });

  it('renders the banner when there is no session', () => {
    render(<SaveProfilePrompt />);
    expect(screen.getByRole('heading', { name: 'Save your profile' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in with Google' })).toBeInTheDocument();
  });

  it('does not render the banner when a session exists', () => {
    useSessionMock.mockReturnValue({ data: { user: { name: 'A' } } } as never);
    const { container } = render(<SaveProfilePrompt />);
    expect(container).toBeEmptyDOMElement();
  });

  it('exposes an accessible name describing the dismiss action (Req 4.8)', () => {
    render(<SaveProfilePrompt />);
    expect(
      screen.getByRole('button', { name: 'Dismiss save profile prompt' }),
    ).toBeInTheDocument();
  });

  it('removes the banner when the dismiss control is activated (Req 4.6)', async () => {
    const user = userEvent.setup();
    render(<SaveProfilePrompt />);

    const dismiss = screen.getByRole('button', { name: 'Dismiss save profile prompt' });
    await user.click(dismiss);

    expect(screen.queryByRole('heading', { name: 'Save your profile' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Sign in with Google' }),
    ).not.toBeInTheDocument();
  });

  it('initiates the Google sign-in flow when the action is activated (Req 4.7)', async () => {
    const user = userEvent.setup();
    render(<SaveProfilePrompt />);

    await user.click(screen.getByRole('button', { name: 'Sign in with Google' }));

    expect(signInMock).toHaveBeenCalledTimes(1);
    expect(signInMock).toHaveBeenCalledWith('google');
  });

  it('lays out dismiss, content, and action on separate grid tracks (Req 4.1)', () => {
    render(<SaveProfilePrompt />);

    // The container is the grid; it carries the entrance class and grid setup.
    const container = screen
      .getByRole('heading', { name: 'Save your profile' })
      .closest('.gc-enter') as HTMLElement;
    expect(container).not.toBeNull();
    expect(container.className).toContain('grid');
    // Named grid-template-areas reserve a dedicated `close` track so the
    // dismiss control can never overlap the content or action.
    expect(container.className).toContain("[grid-template-areas:'content_close'_'action_action']");
    expect(container.className).toContain("md:[grid-template-areas:'icon_content_action_close']");

    // Each region is assigned to its own named grid area.
    const dismiss = screen.getByRole('button', { name: 'Dismiss save profile prompt' });
    const action = screen.getByRole('button', { name: 'Sign in with Google' });
    expect(dismiss.className).toContain('[grid-area:close]');
    expect(action.className).toContain('[grid-area:action]');

    // The dismiss control is sized as a >= 44x44 touch target.
    expect(dismiss.className).toContain('gc-touch');
  });
});
