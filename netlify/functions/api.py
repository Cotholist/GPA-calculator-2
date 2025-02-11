from http.server import BaseHTTPRequestHandler
from app import app

def handler(event, context):
    """Netlify function handler"""
    path = event['path']
    http_method = event['httpMethod']
    
    # 创建一个测试环境
    with app.test_client() as client:
        # 转发请求到 Flask 应用
        response = client.open(
            path,
            method=http_method,
            json=event.get('body', {}) if event.get('body') else None
        )
        
        return {
            'statusCode': response.status_code,
            'body': response.get_data(as_text=True),
            'headers': dict(response.headers)
        }
