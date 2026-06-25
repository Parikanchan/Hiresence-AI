# HireSense AI - Intelligent Resume Screening System

## Overview

HireSense AI is an AI-powered Resume Screening and Candidate Ranking platform that helps recruiters efficiently identify the most suitable candidates for a job role.

The system analyzes multiple resumes against a given Job Description (JD), calculates matching scores using Natural Language Processing (NLP), and ranks candidates based on relevance.

## Features

* Upload multiple resumes (PDF format)
* Enter Job Description (JD)
* AI-powered resume matching
* Candidate ranking based on similarity score
* Resume score visualization
* send email to shortlisted candidates
* Fast and user-friendly interface
* Real-time screening results

## Tech Stack

### Frontend

* React.js
* Material UI (MUI)
* Axios

### Backend

* Flask
* Flask-CORS
* Python

### AI / Machine Learning

* Sentence Transformers
* Scikit-learn
* Cosine Similarity

### Document Processing

* PDFPlumber

### Email Integration

* SMTP (Gmail)

## Project Architecture

Frontend (React)
↓
Flask REST API
↓
Resume Parsing (PDFPlumber)
↓
Sentence Transformer Embeddings
↓
Cosine Similarity Scoring
↓
Candidate Ranking

## Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/hiresense-ai.git
cd hiresense-ai
```

### Backend Setup

```bash
cd backend

pip install -r requirements.txt

python app.py
```

Backend runs on:

```text
http://localhost:5000
```

### Frontend Setup

```bash
cd frontend

npm install

npm start
```

Frontend runs on:

```text
http://localhost:3000
```

## Environment Variables

Create a `.env` file inside the backend folder:

```env
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## Usage

1. Open the application.
2. Paste the Job Description.
3. Upload one or more resumes.
4. Click "Analyze Resumes".
5. View ranked candidates and matching scores.
6. Send emails to shortlisted candidates.

## Future Enhancements

* ATS Compatibility Score
* Skill Gap Analysis
* AI-generated Candidate Feedback
* Interview Question Recommendations
* Recruiter Dashboard
* Candidate Analytics

## Project Highlights

* Automated Resume Screening
* AI-Based Candidate Ranking
* NLP-Powered Similarity Matching
* Multi-Resume Processing
* Recruiter-Friendly Workflow

## Author

Pari Kanchan

GitHub: https://github.com/yourusername

## License

This project is developed for educational and portfolio purposes.
