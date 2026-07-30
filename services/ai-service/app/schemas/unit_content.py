from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class UnitContentRequest(BaseModel):
    workspace_id: str = Field(..., description="Target Workspace ID string")
    unit_id: str = Field(..., description="Target Unit ID string")
    unit_title: str = Field(..., description="Target Unit Title")
    topics: List[str] = Field(default_factory=list, description="Unit topics")
    learning_objectives: List[str] = Field(default_factory=list, description="Unit learning objectives")

class UnitFlashcard(BaseModel):
    question: str
    answer: str
    difficulty: str = "Medium"
    tags: List[str] = Field(default_factory=list)

class UnitQuizQuestion(BaseModel):
    id: str
    type: str = "multiple_choice"
    question: str
    options: List[str]
    correct_answer: str
    explanation: str
    difficulty: str = "Medium"

class UnitQuiz(BaseModel):
    title: str = "Unit Concept Mastery Quiz"
    questions: List[UnitQuizQuestion] = Field(default_factory=list)

class UnitContentResponse(BaseModel):
    workspace_id: str
    unit_id: str
    unit_title: str
    unit_summary: str
    flashcards: List[UnitFlashcard] = Field(default_factory=list)
    quiz: UnitQuiz
