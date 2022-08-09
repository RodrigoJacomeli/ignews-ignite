import { render, screen } from '@testing-library/react';
import { createMock } from 'ts-jest-mock';
import Home, { getStaticProps } from '../../pages';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { stripe } from '../../services/stripe';

jest.mock('next/router', () => {
  return {
    useRouter() {
      return;
    },
  };
});
jest.mock('next-auth/react', () => {
  return {
    useSession() {
      return [null, false];
    },
  };
});
jest.mock('../../services/stripe');

describe('Home page', () => {
  it('Renders correctly', () => {
    render(<Home product={{ priceId: 'fake-priceId', amount: '$10,00' }} />);

    expect(screen.getByText('for $10,00 month')).toBeInTheDocument();
  });

  it('Loads initial data', async () => {
    const retrievePricesMocked = createMock(stripe.prices.retrieve);

    retrievePricesMocked.mockResolvedValueOnce({
      id: 'fake-price-id',
      unit_amount: 1000,
    } as any);

    const response = await getStaticProps({});

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          product: {
            amount: '$10.00',
            priceId: 'fake-price-id',
          },
        },
        revalidate: 86400,
      })
    );
  });
});
