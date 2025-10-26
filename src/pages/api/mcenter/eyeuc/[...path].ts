import type { NextApiRequest, NextApiResponse } from 'next';

// 允许通过环境变量切换代理
const USE_PROXY = process.env.NEXT_PUBLIC_USE_API_PROXY === '1' || process.env.NEXT_PUBLIC_USE_API_PROXY === 'true';
// 优先使用容器内网地址，其次用公开地址，最后本地
const TARGET_BASE = process.env.BACKEND_INTERNAL_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:12481';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!USE_PROXY) {
    res.status(404).json({ error: 'proxy disabled' });
    return;
  }

  const segments = (req.query.path as string[]) || [];
  const search = req.url?.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  const url = `${TARGET_BASE}/mcenter/eyeuc/${segments.join('/')}${search}`;

  try {
    const headers: Record<string, string> = {};
    // 透传必要头
    const allowHeaders = ['content-type', 'accept-language', 'x-ml-client'];
    for (const h of allowHeaders) {
      const v = req.headers[h];
      if (typeof v === 'string') headers[h] = v;
    }

    const upstream = await fetch(url, {
      method: req.method,
      headers,
      body: req.method && ['POST', 'PUT', 'PATCH'].includes(req.method) ? (req as any).body : undefined,
    });

    // 复制状态和部分头
    res.status(upstream.status);
    const contentType = upstream.headers.get('content-type');
    if (contentType) res.setHeader('content-type', contentType);

    // JSON/文本直接转发
    const buf = Buffer.from(await upstream.arrayBuffer());
    res.send(buf);
  } catch (e: any) {
    res.status(502).json({ error: 'Bad gateway', message: e?.message || String(e) });
  }
}

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};


