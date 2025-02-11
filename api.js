const SUPABASE_URL = 'https://dfuhcbiryfmwufwzixwu.supabase.co';
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmdWhjYmlyeWZtd3Vmd3ppeHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyNTY2MzcsImV4cCI6MjA1NDgzMjYzN30.NSrivyNZmIXDwrrfVto5ex9Hbg2CSBpmiN7tZKvMp_o';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      // Handle CORS preflight requests
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      // Handle API routes
      if (path === '/api/courses') {
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
      }

      // Handle course deletion
      if (path.match(/^\/api\/courses\/\d+$/)) {
        if (request.method === 'DELETE') {
          const id = path.split('/').pop();
          return await handleDeleteCourse(id);
        }
        return new Response('Method not allowed', { 
          status: 405,
          headers: corsHeaders
        });
      }

      return new Response('Not found', { 
        status: 404,
        headers: corsHeaders
      });

    } catch (error) {
      console.error('API Error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
  }
};

async function handleGetCourses() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/courses?select=*`, {
    headers: {
      'apikey': SUPABASE_API_KEY,
      'Authorization': `Bearer ${SUPABASE_API_KEY}`
    }
  });

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}

async function handlePostCourse(request) {
  const courseData = await request.json();
  
  // Calculate GPA
  const final_score = parseFloat(courseData.final_score);
  const gpa = calculateGPA(final_score);
  
  const response = await fetch(`${SUPABASE_URL}/rest/v1/courses`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_API_KEY,
      'Authorization': `Bearer ${SUPABASE_API_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ ...courseData, gpa })
  });

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    status: 201,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}

async function handleDeleteCourse(id) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/courses?id=eq.${id}`, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_API_KEY,
      'Authorization': `Bearer ${SUPABASE_API_KEY}`,
      'Prefer': 'return=representation'
    }
  });

  if (response.ok) {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  return new Response(JSON.stringify({ error: 'Failed to delete course' }), {
    status: 500,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}

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
