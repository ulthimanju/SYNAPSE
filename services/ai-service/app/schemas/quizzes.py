from typing import List
from pydantic import BaseModel, Field

class QuizQuestion(BaseModel):
    """Schema for individual quiz question."""
    id: str = Field(..., description="Unique question identifier")
    unit_id: str = Field(..., description="Originating learning unit ID")
    type: str = Field(default="multiple_choice", description="Question type identifier")
    question: str = Field(..., description="Question prompt text")
    options: List[str] = Field(..., description="Array of 4 multiple-choice options")
    correct_answer: str = Field(..., description="Exact string of the correct option")
    explanation: str = Field(..., description="Pedagogical explanation of the correct answer")
    difficulty: str = Field(default="Medium", description="Question difficulty: 'Easy', 'Medium', 'Hard'")
    learning_objective: str = Field(..., description="Associated learning objective evaluated")

class QuizzesRequest(BaseModel):
    """Input payload requesting quiz generation."""
    workspace_id: str = Field(..., description="Target Workspace ID string")

class QuizzesResponse(BaseModel):
    """Structured response payload for quiz assessment."""
    workspace_id: str = Field(..., description="Target Workspace ID string")
    questions: List[QuizQuestion] = Field(default_factory=list, description="Array of generated quiz questions")
