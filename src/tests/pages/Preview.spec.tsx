import { render, screen } from '@testing-library/react';
import { createMock } from 'ts-jest-mock';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

import Post, { getStaticProps } from '../../pages/posts/preview/[slug]';
import { getPrismicClient } from '../../services/prismic';

jest.mock('next/router');
jest.mock('next-auth/react');
jest.mock('../../services/prismic');

const post = {
  slug: 'my-new-post',
  title: 'My new post',
  content: '<p>Post excerpt</p>',
  updatedAt: '10 de Abril',
};

describe('Preview page', () => {
  it('Renders correctly', () => {
    const useSessionMocked = createMock(useSession);

    useSessionMocked.mockReturnValueOnce({
      data: null,
      status: 'unauthenticated',
    });

    render(<Post post={post} />);

    expect(screen.getByText('My new post')).toBeInTheDocument();
    expect(screen.getByText('Post excerpt')).toBeInTheDocument();
    expect(screen.getByText('Wanna continue reading?')).toBeInTheDocument();
  });

  it('Redirects user to full post when user is subscribed', async () => {
    const useSessionMocked = createMock(useSession);
    const useRouterMocked = createMock(useRouter);
    const pushMock = jest.fn();

    useSessionMocked.mockReturnValueOnce([
      {
        activeSubscription: 'fake-active-subscription',
      },
      false,
    ] as any);

    useRouterMocked.mockReturnValueOnce({
      push: pushMock,
    } as any);

    render(<Post post={post} />);

    expect(pushMock).toHaveBeenCalledWith('/posts/my-new-post');
  });

  it('Loads initial data', async () => {
    const getPrismicClientMocked = createMock(getPrismicClient);

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [{ type: 'heading', text: 'My new post' }],
          content: [{ type: 'paragraph', text: 'Post content' }],
        },
        last_publication_date: '04-01-2022',
      }),
    } as any);

    const response = await getStaticProps({
      params: { slug: 'my-new-post' },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: 'my-new-post',
            title: 'My new post',
            content: '<p>Post content</p>',
            updatedAt: '01 de abril de 2022',
          },
        },
      })
    );
  });
});
