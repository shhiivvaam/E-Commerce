import { NextResponse } from "next/server";

const EXTERNAL_PRODUCTS_URL = "https://api.reyva.co.in/api/products";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const queryString = searchParams.toString();
        const url = queryString ? `${EXTERNAL_PRODUCTS_URL}?${queryString}` : EXTERNAL_PRODUCTS_URL;
        const res = await fetch(url, {
            // Disable Next.js fetch caching so you always get fresh data
            cache: "no-store",
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: "Failed to fetch products" },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
