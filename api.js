const SUPABASE_URL = 'https://dfuhcbiryfmwufwzixwu.supabase.co';
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmdWhjYmlyeWZtd3Vmd3ppeHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyNTY2MzcsImV4cCI6MjA1NDgzMjYzN30.NSrivyNZmIXDwrrfVto5ex9Hbg2CSBpmiN7tZKvMp_o';

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      // Handle CORS preflight requests
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',  // In production, replace with your actual frontend domain
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400',  // 24 hours
          }
        });
      }

      // Add CORS headers to all responses
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',  // In production, replace with your actual frontend domain
        'Content-Type': 'application/json',
      };

      // Handle API routes
      if (path === '/api/courses') {
        const response = await (async () => {
          switch (request.method) {
            case 'GET':
              return await handleGetCourses();
            case 'POST':
              return await handlePostCourse(request);
            default:
              return new Response('Method not allowed', { 
                status: 405,
                headers: corsHeaders
              });
          }
        })();

        // Add CORS headers to the response
        return new Response(response.body, {
          status: response.status,
          headers: { ...corsHeaders, ...response.headers }
        });
      }

      // Handle course deletion
      if (path.match(/^\/api\/courses\/\d+$/)) {
        if (request.method === 'DELETE') {
          return await handleDeleteCourse(path);
        }
        return new Response('Method not allowed', { 
          status: 405,
          headers: corsHeaders
        });
      }

      // Handle non-API requests
      return env.ASSETS.fetch(request);

    } catch (error) {
      console.error('API Error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
};

// Initialize Supabase client
async function getSupabaseClient() {
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(SUPABASE_URL, SUPABASE_API_KEY, {
    auth: {
      persistSession: false
    }
  });
}

async function handleGetCourses() {
  try {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',  // In production, replace with your actual frontend domain
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('Error in handleGetCourses:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',  // In production, replace with your actual frontend domain
        'Content-Type': 'application/json',
      }
    });
  }
}

async function handlePostCourse(request) {
  try {
    const supabase = await getSupabaseClient();
    const courseData = await request.json();
    
    // Calculate GPA before inserting
    const final_score = parseFloat(courseData.final_score);
    const gpa = calculateGPA(final_score);
    
    const { data, error } = await supabase
      .from('courses')
      .insert([{ ...courseData, gpa }])
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',  // In production, replace with your actual frontend domain
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('Error in handlePostCourse:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',  // In production, replace with your actual frontend domain
        'Content-Type': 'application/json',
      }
    });
  }
}

async function handleDeleteCourse(path) {
  const courseId = path.split('/').pop();
  console.log('Deleting course:', courseId);

  const response = await fetch(`${SUPABASE_URL}/rest/v1/courses?id=eq.${courseId}`, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_API_KEY,
      'Authorization': `Bearer ${SUPABASE_API_KEY}`
    }
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Error deleting course:', error);
    throw new Error('Failed to delete course');
  }

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  });
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
