from services.speaking_AI.groq_service import send_message

def score_toeic_sp_q1_2(reference_text: str, transcript: str) -> str:
    prompt = f"""
You are a professional ETS-style TOEIC Speaking examiner.

TASK: TOEIC Speaking – Question 1–2 (Read a text aloud)

REFERENCE TEXT:
\"\"\"{reference_text}\"\"\"

CANDIDATE TRANSCRIPT:
\"\"\"{transcript}\"\"\"

--------------------------------------------------
SCORING CRITERIA (TOTAL = 100)

1) Accuracy (40%)
 RULES:

- Split both texts by whitespace.
- Compare word-by-word in order.
- A word is correct ONLY IF identical:
  • Same spelling
  • Same case
  • Same punctuation
- No synonym matching.
- No spelling correction.
- Missing/extra words = incorrect.
- Accuracy formula:
  (Correct words / Total reference words) × 100
- Round to nearest whole number.

2) Fluency (30%)
- Smoothness
- Natural pacing
- Rhythm and pauses

3) Pronunciation (30%)
- Clarity
- Word stress
- Intelligibility

--------------------------------------------------
OVERALL SCORE CALCULATION:

Step 1:
Raw Overall =
(Accuracy × 0.4) +
(Fluency × 0.3) +
(Pronunciation × 0.3)

Round to nearest whole number.

Step 2 (SOFT LIMIT RULE):

If Accuracy < 60
AND Raw Overall > (Accuracy + 15)
THEN Final Overall = Accuracy + 15

Otherwise:
Final Overall = Raw Overall

Round final score to nearest whole number.

--------------------------------------------------
OUTPUT FORMAT (FOLLOW EXACTLY):

Overall score (0–100): <number>

Score breakdown:
- Accuracy: <number>
- Fluency: <number>
- Pronunciation: <number>

Feedback:
<short professional summary>

Key mistakes:
- ...
- ...

Improvement suggestions:
- ...
- ...

"""
    return send_message(prompt)


def score_toeic_sp_q3_4(transcript: str, reference_description: str) -> str:
    prompt = f"""
You are a TOEIC Speaking examiner.

Task: Describe a picture (Question 3-4).

REFERENCE DESCRIPTION (correct picture content):
"{reference_description}"

STUDENT ANSWER:
"{transcript}"


Evaluate based on:
- Accuracy of content compared to the picture (don't need to describe every detail, but main points should be correct)
- Grammar
- Vocabulary
- Cohesion

Give:
1. Overall score (0-100)
2. Content accuracy score
3. Language score
4. Specific mistakes (content + language)
5. Improved TOEIC-style answer
"""
    return send_message(prompt)

def score_toeic_sp_q5_7(question: str, answer: str) -> str:
    prompt = f"""
You are a TOEIC Speaking examiner.

Context:
A British marketing firm is conducting a telephone interview about leisure activities.

Question:
\"\"\"{question}\"\"\"

Student answer:
\"\"\"{answer}\"\"\"

Evaluate according to ETS TOEIC Speaking criteria:

- Relevance of content
- Completeness of content
- Grammar
- Vocabulary
- Pronunciation (assume from transcript)
- Cohesion

Give:
1. Overall score (0–100)
2. Subscores for each criterion
3. Specific mistakes or weaknesses
4. A high-scoring sample answer (TOEIC level)

Be strict like ETS examiners.
"""
    return send_message(prompt)


def score_toeic_sp_q8_10(
    poster_text: str,
    question: str,
    transcript: str
) -> str:
    prompt = f"""
You are a TOEIC Speaking examiner.

Task: Respond to questions using provided information.

INFORMATION PROVIDED:
\"\"\"{poster_text}\"\"\"

QUESTIONS:
\"\"\"{question}\"\"\"
STUDENT ANSWER (spoken transcript):
\"\"\"{transcript}\"\"\"

Evaluate strictly based on ETS TOEIC criteria:
- Pronunciation (assume from transcript)
- Grammar
- Vocabulary
- Cohesion
- Relevance of content
- Completeness of content

Give:
1. Overall score (0–100)
2. Specific missing or incorrect information
3. Correct sample answers (TOEIC level)

"""
    return send_message(prompt)


def score_toeic_sp_q11(question: str, transcript: str) -> str:
    prompt = f"""
You are a TOEIC Speaking examiner.

Task: Express an opinion (Question 11).

QUESTION:
\"\"\"{question}\"\"\"

STUDENT ANSWER (spoken transcript):
\"\"\"{transcript}\"\"\"

Evaluate strictly based on ETS TOEIC Speaking criteria:
- Pronunciation (assume from transcript)
- Grammar
- Vocabulary
- Cohesion
- Development of ideas
- Support and examples

Give:
1. Overall score (0–100)
2. Detailed feedback for each criterion
3. Specific grammar or vocabulary mistakes
4. Suggestions to improve the response
5. A high-scoring sample answer (TOEIC level, 60 seconds)

"""
    return send_message(prompt)

def score_toeic_w_q1_5(
    image_description: str,
    required_words: list[str],
    student_sentence: str
):
    prompt = f"""
You are a professional ETS-style TOEIC Writing examiner.

TASK: Write ONE sentence based on a picture.

Picture description:
\"\"\"{image_description}\"\"\"

Required words/phrases (must be used exactly as given):
{", ".join(required_words)}

Student sentence:
\"\"\"{student_sentence}\"\"\"

--------------------------------------------------
SCORING CRITERIA (TOTAL = 100)

1) Grammar accuracy (40%)
- Verb tense
- Subject-verb agreement
- Word order
- Articles and prepositions

2) Relevance to the picture (30%)
- Sentence must describe the picture logically.
- Minor missing details are acceptable.

3) Correct use of required words (20%)
- Required words must appear exactly as given.
- Incorrect form = incorrect usage.

4) Sentence completeness (10%)
- Must be a complete, grammatically correct sentence.
- No fragments.

--------------------------------------------------
OVERALL SCORE CALCULATION:

Raw Overall =
(Grammar × 0.4) +
(Relevance × 0.3) +
(Required words × 0.2) +
(Completeness × 0.1)

Round to nearest whole number.

SOFT LIMIT RULES:

- If any required word is missing → Final score cannot exceed 80.
- If sentence is incomplete → Final score cannot exceed 70.

Apply limits only if necessary.

--------------------------------------------------
OUTPUT FORMAT (FOLLOW EXACTLY):

Overall score (0–100): <number>

Score breakdown:
- Grammar: <number>
- Relevance: <number>
- Required words usage: <number>
- Sentence completeness: <number>

Feedback:
<short, constructive explanation>

Key mistakes:
- ...
- ...

Improved version:
<correct TOEIC-level sentence>

"""
    return send_message(prompt)
def score_toeic_w_q6_7(
    email_prompt: str,
    student_email: str,
    directions: str
):
    prompt = f"""
You are a professional ETS-style TOEIC Writing examiner.

TASK: Write an email based on a prompt.

Email prompt:
\"\"\"{email_prompt}\"\"\"

Directions:
\"\"\"{directions}\"\"\"

Student email:
\"\"\"{student_email}\"\"\"

--------------------------------------------------
SCORING CRITERIA (TOTAL = 100)

1) Task completion (40%)
- All required points in the directions must be addressed.
- Content must be relevant to the prompt.
- Missing major information lowers score significantly.

2) Grammar accuracy (30%)
- Sentence structure
- Verb tense
- Agreement
- Articles & prepositions
- Spelling

3) Organization & structure (20%)
- Clear greeting
- Logical body paragraphs
- Proper closing
- Coherence between ideas

4) Tone & register (10%)
- Appropriate level of formality
- Professional wording
- Suitable expressions for email context

--------------------------------------------------
OVERALL SCORE CALCULATION:

Raw Overall =
(Task × 0.4) +
(Grammar × 0.3) +
(Organization × 0.2) +
(Tone × 0.1)

Round to nearest whole number.

SOFT LIMIT RULES:

- If one major required point is missing → Final score cannot exceed 85.
- If greeting or closing is missing → Final score cannot exceed 80.
- If tone is inappropriate for the situation → Final score cannot exceed 75.

Apply limits only if necessary.

--------------------------------------------------
OUTPUT FORMAT (FOLLOW EXACTLY):

Overall score (0–100): <number>

Score breakdown:
- Task completion: <number>
- Grammar: <number>
- Organization & structure: <number>
- Tone & register: <number>

Feedback:
<clear and constructive paragraph>

Key mistakes:
- ...
- ...

Improved version:
<high-scoring TOEIC-level email>

"""
    return send_message(prompt)
    

def score_toeic_w_q8(
        question: str,
        student_response: str
):
    prompt = f"""
You are a professional ETS-style TOEIC Writing examiner.

TASK: Write a response to a question.

Question:
\"\"\"{question}\"\"\"

Student response:
\"\"\"{student_response}\"\"\"

--------------------------------------------------
SCORING CRITERIA (TOTAL = 100)

1) Idea development & relevance (40%)
- Response must directly answer the question.
- Ideas should be clear and reasonably developed.
- Simple ideas are acceptable but must be logical.

2) Grammar accuracy (30%)
- Sentence structure
- Verb tense
- Agreement
- Articles & prepositions
- Spelling

3) Organization & coherence (20%)
- Logical flow
- Clear connections between ideas
- Proper paragraphing (if multiple sentences)

4) Vocabulary range & appropriateness (10%)
- Suitable word choice
- Some variety in vocabulary
- No major misuse of words

--------------------------------------------------
OVERALL SCORE CALCULATION:

Raw Overall =
(Idea × 0.4) +
(Grammar × 0.3) +
(Organization × 0.2) +
(Vocabulary × 0.1)

Round to nearest whole number.

SOFT LIMIT RULES:

- If response does not directly answer the question → Final score cannot exceed 80.
- If response is extremely short or lacks development → Final score cannot exceed 75.
- If there are multiple serious grammar errors affecting clarity → Final score cannot exceed 70.

Apply limits only if necessary.

--------------------------------------------------
OUTPUT FORMAT (FOLLOW EXACTLY):

Overall score (0–100): <number>

Score breakdown:
- Idea development & relevance: <number>
- Grammar: <number>
- Organization & coherence: <number>
- Vocabulary: <number>

Feedback:
<clear and constructive explanation>

Key mistakes:
- ...
- ...

Improved version:
<high-scoring TOEIC-level response>

"""
    return send_message(prompt)