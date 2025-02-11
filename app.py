from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
# 配置数据库URL
DATABASE_URL = os.getenv('DATABASE_URL')
if DATABASE_URL and DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL or 'sqlite:///gpa.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Course(db.Model):
    __tablename__ = 'courses'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    regular_score = db.Column(db.Float)  # 平时成绩
    exam_scores = db.Column(db.String(200))  # 存储考试成绩，用逗号分隔
    final_score = db.Column(db.Float)  # 最终百分制成绩
    gpa = db.Column(db.Float)  # GPA
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def calculate_final_score(self, exam_weight=0.7):
        """计算最终成绩"""
        if not self.exam_scores or not self.regular_score:
            return 0
        
        exam_scores = [float(score) for score in self.exam_scores.split(',')]
        avg_exam_score = sum(exam_scores) / len(exam_scores)
        
        return avg_exam_score * exam_weight + self.regular_score * (1 - exam_weight)

    def calculate_gpa(self):
        """计算GPA - 4.0制"""
        score = self.final_score
        if score >= 90:
            return 4.0
        elif score >= 85:
            return 3.7
        elif score >= 80:
            return 3.3
        elif score >= 75:
            return 3.0
        elif score >= 70:
            return 2.7
        elif score >= 65:
            return 2.3
        elif score >= 60:
            return 2.0
        else:
            return 0.0

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/courses', methods=['GET'])
def get_courses():
    courses = Course.query.order_by(Course.final_score.desc()).all()
    return jsonify([{
        'id': course.id,
        'name': course.name,
        'regular_score': course.regular_score,
        'exam_scores': course.exam_scores,
        'final_score': course.final_score,
        'gpa': course.gpa
    } for course in courses])

@app.route('/api/courses', methods=['POST'])
def add_course():
    try:
        data = request.json
        course = Course(
            name=data['name'],
            regular_score=float(data['regular_score']),
            exam_scores=','.join(map(str, data['exam_scores']))
        )
        
        course.final_score = course.calculate_final_score()
        course.gpa = course.calculate_gpa()
        
        db.session.add(course)
        db.session.commit()
        
        return jsonify({
            'id': course.id,
            'name': course.name,
            'regular_score': course.regular_score,
            'exam_scores': course.exam_scores,
            'final_score': course.final_score,
            'gpa': course.gpa
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/courses/<int:course_id>', methods=['DELETE'])
def delete_course(course_id):
    try:
        course = Course.query.get_or_404(course_id)
        db.session.delete(course)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
