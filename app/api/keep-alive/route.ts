import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function GET(request: NextRequest) {
    // Validasi secret token (Mendukung Vercel Cron & metode lama)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    const legacyAuthHeader = request.headers.get('x-keep-alive-secret')
    const legacySecret = process.env.KEEP_ALIVE_SECRET

    const isCronAuthorized = cronSecret && authHeader === `Bearer ${cronSecret}`
    const isLegacyAuthorized = legacySecret && legacyAuthHeader === legacySecret

    if (!isCronAuthorized && !isLegacyAuthorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json(
            { error: 'Konfigurasi Supabase tidak ditemukan' },
            { status: 500 },
        )
    }

    try {
        const supabase = createClient(supabaseUrl, supabaseKey)

        // Query ringan: ambil 1 row untuk membuktikan koneksi aktif
        const { error } = await supabase.from('profiles').select('id').limit(1)

        if (error) {
            // Jika tabel 'profiles' tidak ada, coba health check langsung
            const healthRes = await fetch(`${supabaseUrl}/rest/v1/`, {
                headers: {
                    apikey: supabaseKey,
                    Authorization: `Bearer ${supabaseKey}`,
                },
            })

            if (!healthRes.ok) {
                throw new Error(`Supabase health check gagal: ${healthRes.status}`)
            }
        }

        const timestamp = new Date().toISOString()

        return NextResponse.json({
            status: 'ok',
            message: 'Supabase berhasil di-ping. Database tetap aktif.',
            timestamp,
        })
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        console.error('[Keep-Alive] Error:', message)
        return NextResponse.json({ status: 'error', message }, { status: 500 })
    }
}
