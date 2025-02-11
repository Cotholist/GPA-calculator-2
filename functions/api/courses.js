const SUPABASE_URL = 'https://dfuhcbiryfmwufwzixwu.supabase.co';
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmdWhjYmlyeWZtd3Vmd3ppeHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyNTY2MzcsImV4cCI6MjA1NDgzMjYzN30.NSrivyNZmIXDwrrfVto5ex9Hbg2CSBpmiN7tZKvMp_o';

export async function onRequest(context) {
  const { request } = context;

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  try {
    switch (request.method) {
      case 'GET':
        return await handleGetCourses();
      case 'POST':
        return await handlePostCourse(request);
      case 'DELETE':
        return await handleDeleteCourse(request.url);
      default:
        return new Response('Method not allowed', { 
          status: 405,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          }
        });
    }
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

async function handleGetCourses() {
  console.log('Fetching courses from Supabase...');
  const response = await fetch(`${SUPABASE_URL}/rest/v1/courses?select=*`, {
    headers: {
      'apikey': SUPABASE_API_KEY,
      'Authorization': `Bearer ${SUPABASE_API_KEY}`
    }
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Error fetching courses:', error);
    throw new Error('Failed to fetch courses');
  }

  const data = await response.json();
  console.log('Fetched courses:', data);
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

async function handlePostCourse(request) {
  const data = await request.json();
  console.log('Received course data:', data);

  // Calculate GPA based on final score
  const gpa = calculateGPA(data.final_score);
  data.gpa = gpa;

  console.log('Sending to Supabase:', data);
  const response = await fetch(`${SUPABASE_URL}/rest/v1/courses`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_API_KEY,
      'Authorization': `Bearer ${SUPABASE_API_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(data)
  });

  const responseText = await response.text();
  console.log('Supabase response:', response.status, responseText);

  if (!response.ok) {
    return new Response(JSON.stringify({
      error: 'Failed to add course',
      status: response.status,
      details: responseText
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  try {
    const createdCourse = JSON.parse(responseText);
    return new Response(JSON.stringify(createdCourse), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (e) {
    console.error('Error parsing response:', e);
    return new Response(JSON.stringify({
      error: 'Invalid response from server',
      details: responseText
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

async function handleDeleteCourse(requestUrl) {
  const url = new URL(requestUrl);
  const courseId = url.pathname.split('/').pop();
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
