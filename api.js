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
        
        // Calculate GPA based on final score
        const gpa = calculateGPA(data.final_score);
        data.gpa = gpa;

        const response = await fetch(`${SUPABASE_URL}/rest/v1/courses`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_API_KEY,
            'Authorization': `Bearer ${SUPABASE_API_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'  // This will return the created record
          },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          const createdCourse = await response.json();
          return new Response(JSON.stringify(createdCourse), {
            headers: { 'Content-Type': 'application/json' }
          });
        } else {
          const errorData = await response.json();
          return new Response(JSON.stringify({ error: 'Failed to add course', details: errorData }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
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

// 计算GPA的函数
function calculateGPA(score) {
  if (score >= 90) return 4.0;
  if (score >= 85) return 3.7;
  if (score >= 80) return 3.3;
  if (score >= 75) return 3.0;
  if (score >= 70) return 2.7;
  if (score >= 65) return 2.3;
  if (score >= 60) return 2.0;
  return 0.0;
}
