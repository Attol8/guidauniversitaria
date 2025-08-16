from pydantic import BaseModel
from dotenv import load_dotenv
import os

load_dotenv(".env.production")
openai_api_key = os.getenv("OPENAI_API_KEY")
from openai import OpenAI

client = OpenAI(api_key=openai_api_key)


def classify_course_discipline(course_name, course_materia):
    class CourseDiscipline(BaseModel):
        name: str

    disciplines = [
        "Agricoltura",
        "Antropologia",
        "Architettura, Edilizia e Pianificazione",
        "Scienze Biologiche",
        "Economia Aziendale e Management",
        "Chimica",
        "Comunicazione e Studi sui Media",
        "Informatica",
        "Arti Creative e Design",
        "Economia",
        "Scienze dell'Educazione",
        "Ingegneria",
        "Scienze Ambientali",
        "Finanza",
        "Scienze Alimentari",
        "Scienze Forensi e Archeologiche",
        "Geografia",
        "Geologia",
        "Storia e Archeologia",
        "Servizi Informativi",
        "Lingue",
        "Giurisprudenza",
        "Lettere",
        "Scienza dei Materiali",
        "Matematica",
        "Medicina",
        "Professioni sanitarie tecniche",
        "Filosofia",
        "Fisica",
        "Scienze Politiche e Governo",
        "Psicologia",
        "Servizio Sociale",
        "Sociologia",
        "Teologia e Studi Religiosi",
        "Scienze Veterinarie",
        "Farmacia",
        "Altro",
    ]

    prompt = f"""You are an expert at data classification. You will be given a course_name and course_materia and are tasked wiht classifying the course name into one of these disciplines:
      {', '.join(disciplines)}"""
    completion = client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": prompt},
            {
                "role": "user",
                "content": f"Course Name: {course_name}, Course Materia: {course_materia}",
            },
        ],
        response_format=CourseDiscipline,
    )

    course_discipline = completion.choices[0].message.parsed.name
    return course_discipline
