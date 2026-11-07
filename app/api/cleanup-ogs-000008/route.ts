import { env } from 'cloudflare:workers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const key = request.headers.get('x-ogs-cleanup-key') ?? '';
  if (!/^[a-f0-9]{64}$/.test(key)) return new Response(null, { status: 404 });
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key));
  const digest = Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('');
  if (digest !== '891327e63cbc2d5061b7e8a1b0c0e521a9f409496608c5b2d0c56261fe406109') return new Response(null, { status: 404 });

  const { DB } = env as unknown as { DB: D1Database };
  const productId = 'ogs-mw4xti45';
  const [product, code] = await DB.batch([
    DB.prepare(`DELETE FROM catalog
      WHERE id = ? AND kind = 'physical' AND status = 'archived' AND revision = 3
        AND json_extract(data, '$.name') = ?
        AND json_array_length(data, '$.images') = 0
        AND json_array_length(data, '$.fileIds') = 0
        AND EXISTS (SELECT 1 FROM catalog_codes WHERE number = 8 AND product_id = ?)`)
      .bind(productId, '【測試】後台商品儲存驗證（已編輯）', productId),
    DB.prepare(`DELETE FROM catalog_codes WHERE number = 8 AND product_id = ?
      AND NOT EXISTS (SELECT 1 FROM catalog WHERE id = ?)`).bind(productId, productId),
  ]);
  return Response.json({ deleted: product.meta.changes, removedCode: code.meta.changes });
}
