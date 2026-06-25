from flask import Flask, request, jsonify
from flask_cors import CORS
from email.message import EmailMessage
import pdfplumber
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import smtplib
import os
import ssl
import re

app = Flask(__name__)
CORS(app)

model = SentenceTransformer("all-MiniLM-L6-v2")

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 465))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USER)


def extract_text(file):
    text = ""
    try:
        with pdfplumber.open(file) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
    except Exception:
        text = ""
    return text


def extract_email(text):
    match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    return match.group(0) if match else None


def normalize_score(score):
    return max(0.0, min(float(score), 1.0))


@app.route("/rank", methods=["POST"])
def rank_resumes():
    jd = request.form.get("jd", "").strip()
    files = request.files.getlist("files")

    if not jd:
        return jsonify({"error": "Job description is required"}), 400

    if not files:
        return jsonify({"error": "No resume files uploaded"}), 400

    jd_embedding = model.encode([jd])[0]
    results = []

    for file in files:
        text = extract_text(file)
        email = extract_email(text)

        if not text.strip():
            results.append({
                "name": file.filename,
                "email": None,
                "score": 0.0,
                "status": "No Content"
            })
            continue

        resume_embedding = model.encode([text])[0]
        score = cosine_similarity([jd_embedding], [resume_embedding])[0][0]
        score = normalize_score(score)

        if score > 0.6:
            status = "Selected"
        elif score > 0.4:
            status = "Shortlisted"
        else:
            status = "Rejected"

        results.append({
            "name": file.filename,
            "email": email,
            "score": float(score * 100),
            "status": status
        })

    results.sort(key=lambda x: x["score"], reverse=True)
    return jsonify(results)


# @app.route("/send-emails", methods=["POST"])
# def send_emails():
#     data = request.get_json(silent=True) or {}
#     candidates = data.get("candidates", [])

#     if not candidates:
#         return jsonify({"error": "No candidates provided"}), 400

#     if not SMTP_USER or not SMTP_PASS:
#         return jsonify({"error": "SMTP credentials are missing"}), 500

#     sent_to = []
#     skipped = []

#     try:
#         context = ssl.create_default_context()

#         with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, context=context) as server:
#             server.login(SMTP_USER, SMTP_PASS)

#             for candidate in candidates:
#                 recipient = candidate.get("email")
#                 if not recipient:
#                     skipped.append({
#                         "name": candidate.get("name", "Unknown"),
#                         "reason": "Missing email"
#                     })
#                     continue

#                 name = candidate.get("name", "Candidate")
#                 score = candidate.get("score", 0)
#                 status = candidate.get("status", "Shortlisted")
#                 custom_message = candidate.get("message", "You are shortlisted 🎉")

#                 msg = EmailMessage()
#                 msg["Subject"] = "You are shortlisted 🎉"
#                 msg["From"] = FROM_EMAIL
#                 msg["To"] = recipient
#                 msg.set_content(
#                     f"""Hi {name},

# {custom_message}

# Your score: {score}
# Status: {status}

# Our team will contact you soon.

# Regards,
# Hiring Team
# """
#  
from email.mime.text import MIMEText  # keep this

@app.route('/send-emails', methods=['POST'])
def send_emails():
    data = request.get_json()
    candidates = data.get("candidates", [])

    if not candidates:
        return jsonify({"error": "No candidates provided"}), 400
    if not SMTP_USER or not SMTP_PASS:
        return jsonify({"error": "SMTP credentials missing"}), 500

    sent_to = []
    skipped = []

    try:
        # ✅ create connection ONCE
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login("parikanchan44@gmail.com", "fvvt aiiv qsbk jozq")

        for c in candidates:
            email = c.get("email")

            if not email:
                skipped.append(c.get("name", "Unknown"))
                continue

            msg = MIMEText(c.get("message", "You are shortlisted 🎉"))
            msg['Subject'] = "Interview Shortlisted"
            msg['From'] = "parikanchan44@gmail.com@gmail.com"
            msg['To'] = email

            server.send_message(msg)
            sent_to.append(email)

        server.quit()

        return jsonify({
            "success": True,
            "message": "Emails sent successfully",
            "sent_count": len(sent_to),
            "sent_to": sent_to,
            "skipped": skipped
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True)