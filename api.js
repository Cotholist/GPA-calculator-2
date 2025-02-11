const SUPABASE_URL = 'https://dfuhcbiryfmwufwzixwu.supabase.co';
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmdWhjYmlyeWZtd3Vmd3ppeHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyNTY2MzcsImV4cCI6MjA1NDgzMjYzN30.NSrivyNZmIXDwrrfVto5ex9Hbg2CSBpmiN7tZKvMp_o'; // 需要替换为你的 anon key

export async function onRequest(context) {
  const { request, env } = context;
  
  try {
    if (request.url.includes('/api/')) {
      const url = new URL(request.url);
      const path = url.pathname;
      
      // 处理课程列表
      if (path === '/api/courses' && request.method === 'GET') {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/courses?select=*`, {
          headers: {
            'apikey': SUPABASE_API_KEY,
            'Authorization': `Bearer ${SUPABASE_API_KEY}`
          }
        });
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // 添加新课程
      if (path === '/api/courses' && request.method === 'POST') {
        const data = await request.json();
        const response = await fetch(`${SUPABASE_URL}/rest/v1/courses`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_API_KEY,
            'Authorization': `Bearer ${SUPABASE_API_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' }
          });
        } else {
          throw new Error('Failed to add course');
        }
      }

      // 删除课程
      if (path.match(/^\/api\/courses\/\d+$/) && request.method === 'DELETE') {
        const courseId = path.split('/').pop();
        const response = await fetch(`${SUPABASE_URL}/rest/v1/courses?id=eq.${courseId}`, {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_API_KEY,
            'Authorization': `Bearer ${SUPABASE_API_KEY}`
          }
        });
        
        if (response.ok) {
          return new Response(null, { status: 204 });
        } else {
          throw new Error('Failed to delete course');
        }
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
