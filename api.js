export async function onRequest(context) {
  const { request, env } = context;
  
  try {
    // 处理 API 请求
    if (request.url.includes('/api/')) {
      const url = new URL(request.url);
      const path = url.pathname;
      
      // 处理课程列表
      if (path === '/api/courses' && request.method === 'GET') {
        return new Response(JSON.stringify([]), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // 添加新课程
      if (path === '/api/courses' && request.method === 'POST') {
        const data = await request.json();
        return new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // 对于非 API 请求，返回静态文件
    return env.ASSETS.fetch(request);
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
