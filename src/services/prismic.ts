import * as Prismic from '@prismicio/client'

export function getPrismicClient() {
    const prismic = Prismic.createClient(process.env.PRISMIC_ENTRYPONT, {
        accessToken: process.env.PRISMIC_ACCESS_TOKEN
    })

    return prismic;
}