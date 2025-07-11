from flask import Flask, request, jsonify
from openai import OpenAI  
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize OpenAI client with API key
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))  

# System prompt for a supportive confidence coach
CHAT_SYSTEM_PROMPT  = (
    "You are a supportive confidence coach. Encourage the user with positive affirmations, mindset tips, and practical advice to build self-esteem. Be warm, friendly, and motivating in your tone."
)
SUMMARY_SYSTEM_PROMPT = "You summarize conversations between a confidence coach and a user. Extract key advice and points in a neutral, concise paragraph."

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json(force=True)
    conversation = data.get("conversation", [])
    user_message = data.get("message", "").strip()

    if not user_message:
        return jsonify({"error": "Empty message received"}), 400

    # Prepend system prompt only once if not already present
    if not conversation or conversation[0]["role"] != "system":
        messages = [{"role": "system", "content": CHAT_SYSTEM_PROMPT}]
    else:
        messages = []
    messages.extend(conversation[-9:])  # Keep last 9 messages (system + 9 = 10 total)
    messages.append({"role": "user", "content": user_message})

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=150,
            temperature=0.7,
        )
        assistant_reply = response.choices[0].message.content.strip()
        # Update conversation (include system if not already present)
        updated_conversation = messages + [{"role": "assistant", "content": assistant_reply}]
        return jsonify({
            "reply": assistant_reply,
            "conversation": updated_conversation[-10:]  # Truncate to last 10 messages
        })
    except Exception as e:
        return jsonify({"error": f"OpenAI API error: {str(e)}"}), 500

@app.route('/summary', methods=['POST'])
def summary():
    data = request.get_json(force=True)
    conversation = data.get("conversation", [])
    
    if not conversation:
        return jsonify({"error": "No conversation data provided"}), 400

    conv_text = "\n".join(
        f"{msg['role'].capitalize()}: {msg['content']}" 
        for msg in conversation 
        if msg["role"] != "system"  # Exclude system message from summary input
    )
    prompt = (
        "Summarize the advice and key points from this conversation:\n\n" + conv_text
    )

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": SUMMARY_SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            max_tokens=100,
            temperature=0.7,
        )
        summary_text = response.choices[0].message.content.strip()
        return jsonify({"summary": summary_text})
    except Exception as e:
        return jsonify({"error": f"OpenAI API error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)