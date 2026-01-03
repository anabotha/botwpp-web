import { supabase } from "../supabaseClient";
import { NextResponse } from "next/server";

export async function GET() {
    const { data, error } = await supabase.rpc("get_disponible_usd");

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}