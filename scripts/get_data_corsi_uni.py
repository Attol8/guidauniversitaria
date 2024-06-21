import os
import requests
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv, find_dotenv
from pydantic import BaseModel, ValidationError, field_validator
from typing import List, Optional

load_dotenv(find_dotenv())  # Load the .env file.


class Course(BaseModel):
    nome: str
    link: Optional[str] = ""
    tipo: str
    uni: str
    accesso: str
    area: str
    lingua: str
    comune: str

    # @field_validator("link")
    # def validate_link(cls, v):
    #     if not v.startswith("http"):
    #         raise ValueError("Invalid link")
    #     return v


def fetch_courses_data(url: str) -> List[Course]:
    response = requests.get(url)
    data = response.json()
    courses = []
    for item in data:
        try:
            course = Course(**item)
            courses.append(course)
        except ValidationError as e:
            print(f"Validation error: {e}")
    return courses


def create_connection(host_name: str, user_name: str, user_password: str, db_name: str):
    connection = None
    try:
        connection = mysql.connector.connect(
            host=host_name, user=user_name, passwd=user_password, database=db_name
        )
        print("Connection to MySQL DB successful")
    except Error as e:
        print("Error while connecting to MySQL", e)
    return connection


def truncate_table(connection, table_name: str):
    try:
        cursor = connection.cursor()
        cursor.execute(f"TRUNCATE TABLE {table_name};")
        connection.commit()
        cursor.close()
        print(f"Table {table_name} truncated successfully.")
    except Error as e:
        print(f"An error occurred while truncating the table: {e}")


def insert_courses_data(connection, courses: List[Course], table_name: str):
    cursor = connection.cursor()
    for course in courses:
        sql = f"""
        INSERT INTO {table_name} (nome, link, tipo, uni, accesso, area, lingua, comune) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(
            sql,
            (
                course.nome,
                course.link,
                course.tipo,
                course.uni,
                course.accesso,
                course.area,
                course.lingua,
                course.comune,
            ),
        )
    connection.commit()
    cursor.close()
    print(f"{len(courses)} records inserted successfully.")


if __name__ == "__main__":
    host_name = os.getenv("host_name")
    user_name = os.getenv("user_name")
    user_password = os.getenv("user_password")
    db_name = "gu_prod"
    table_name = "corsi"

    # URL for the GET request
    url = "https://corsi-uni.herokuapp.com/corsi"

    courses = fetch_courses_data(url)
    connection = create_connection(host_name, user_name, user_password, db_name)

    if connection is not None:
        truncate_table(connection, table_name)
        insert_courses_data(connection, courses, table_name)
    connection.close()
