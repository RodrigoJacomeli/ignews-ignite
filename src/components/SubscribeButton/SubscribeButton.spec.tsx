import { render, screen, fireEvent } from '@testing-library/react';
import { createMock } from 'ts-jest-mock';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { SubscribeButton } from '.';

jest.mock('next-auth/react');
jest.mock('next/router');

describe('SubscribrButton component', () => {
  it('Renders correnctly', () => {
    const useSessionMocked = createMock(useSession);

    useSessionMocked.mockReturnValueOnce({
      data: null,
      status: 'unauthenticated',
    });

    render(<SubscribeButton />);

    expect(screen.getByText('Subscribe Now')).toBeInTheDocument();
  });

  it('Redirects user to sign in when not authenticated', () => {
    const useSessionMocked = createMock(useSession);
    const signInMocked = createMock(signIn);

    useSessionMocked.mockReturnValueOnce({
      data: null,
      status: 'unauthenticated',
    });

    render(<SubscribeButton />);

    const subscribeButton = screen.getByText('Subscribe Now');

    fireEvent.click(subscribeButton);

    expect(signInMocked).toHaveBeenCalled();
  });

  it('Redirects to posts when user already has a subscription', () => {
    const useRouterMocked = createMock(useRouter);
    const useSessionMocked = createMock(useSession);
    const pushMock = jest.fn();

    useSessionMocked.mockReturnValueOnce({
      data: {
        user: {
          name: 'John Doe',
          email: 'john.doe@example.com',
        },
        activeSubscription: 'fake-active-subscription',
        expires: 'fake-expires',
      },
      status: 'authenticated',
    });

    useRouterMocked.mockReturnValueOnce({
      push: pushMock,
    } as any);

    render(<SubscribeButton />);

    const subscribeButton = screen.getByText('Subscribe now');

    fireEvent.click(subscribeButton);

    expect(pushMock).toHaveBeenCalledWith('/posts');
  });
});
