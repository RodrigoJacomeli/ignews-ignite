import { render, screen } from "@testing-library/react";
import { useSession } from "next-auth/react";
import { stripe } from '../../services/stripe'
import { mocked } from "ts-jest/utils";
import Home, { getStaticProps } from "../../pages";

jest.mock("next/router");
jest.mock("next-auth/react", () => {
    return {
        useSession() {
            return [null, false]
        }
    }
});
jest.mock("../../services/stripe");

describe("Home page", () => {
    it("Renders correctly", () => {
        render(<Home product={{ priceId: 'fake-priceId', amount: 'R$10,00' }} />);

        expect(screen.getByText("for R$10,00 month")).toBeInTheDocument()
    });

    it("Loads initial data", async () => {
        const retrievePricesMocked = mocked(stripe.prices.retrieve);

        retrievePricesMocked.mockResolvedValueOnce({
            id: 'fake-price-id',
            unit_amount: 1000
        } as any);

        const response = await getStaticProps({})

        expect(response).toEqual(
            expect.objectContaining({
                props: {
                    products: {
                        priceId: 'fake-price-id',
                        amount: '$10,00'
                    }
                }
            })
        )
    })
})