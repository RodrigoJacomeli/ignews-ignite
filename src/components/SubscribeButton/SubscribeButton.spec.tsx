import { render, screen, fireEvent } from "@testing-library/react";
import { mocked } from "ts-jest/utils";
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { SubscribeButton } from ".";

jest.mock("next-auth/react")
jest.mock('next/router')

describe("SubscribrButton component", () => {
    it("Renders correnctly", () => {
        const useSessionMocked = mocked(useSession);

        useSessionMocked.mockReturnValueOnce([null, false])

        render(
            <SubscribeButton />
        )

        expect(screen.getByText('Subscribe Now')).toBeInTheDocument()
    });

    it("Redirects user to sign in when not authenticated", () => {
        const useSessionMocked = mocked(useSession);
        const signInMocked = mocked(signIn)
        useSessionMocked.mockReturnValueOnce([null, false])

        render(<SubscribeButton />)

        const subscribeButton = screen.getByText('Subscribe Now');

        fireEvent.click(subscribeButton);

        expect(signInMocked).toHaveBeenCalled()
    });

    it("Redirects to posts when user already has a subscription", () => {
        const useRouterMocked = mocked(useRouter);
        const useSessionMocked = mocked(useSession);
        const pushMock = jest.fn()

        useSessionMocked.mockRejectedValueOnce(
            [
                {
                    user: {
                        name: 'John Doe',
                        email: 'john.doe@example.com'
                    },
                    activeSubscription: 'fake-active-subscription',
                    expires: 'fake-expires'
                },
                false
            ]
        )

        useRouterMocked.mockRejectedValueOnce({
            push: pushMock
        } as any)

        render(<SubscribeButton />);

        const subscribeButton = screen.getByText('Subscribe now');

        fireEvent.click(subscribeButton);

        expect(pushMock).toHaveBeenCalledWith('/posts');
    })
})
