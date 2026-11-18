from datetime import date, datetime
from typing import List, Literal, Optional, get_args

from pydantic import BaseModel, ConfigDict, Field

# The allowed choices. The frontend dropdowns get these from GET /api/posts/options,
# so the lists are written only once, here.
ClassLevel = Literal[
    "Class 1-5",
    "Class 6-8",
    "SSC (Class 9-10)",
    "HSC (Class 11-12)",
    "O Level",
    "A Level",
    "University",
    "Other",
]
Day = Literal["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
TimeSlot = Literal["Morning", "Afternoon", "Evening", "Night", "Flexible"]

CLASS_LEVELS = list(get_args(ClassLevel))
DAYS = list(get_args(Day))
TIME_SLOTS = list(get_args(TimeSlot))


class CreatePostRequest(BaseModel):
    # Remove spaces from the start and end of every text field
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str = Field(min_length=5, max_length=100)
    subject: str = Field(min_length=2, max_length=60)   # teachers: must be one of their verified subjects
    class_level: ClassLevel
    number_of_classes: int = Field(ge=1, le=500)         # total classes
    classes_per_week: int = Field(ge=1, le=7)
    total_hours: float = Field(gt=0, le=2000)            # total hours of all classes together
    honorarium: int = Field(ge=1, le=1000000)            # total amount in BDT for the whole course
    preferred_days: List[Day] = Field(min_length=1)
    preferred_time: TimeSlot
    start_date: Optional[date] = None
    description: Optional[str] = Field(default=None, max_length=1000)

    # Teacher posts only (a student's post ignores these two)
    qualification: Optional[str] = Field(default=None, min_length=2, max_length=100)
    experience_years: Optional[int] = Field(default=None, ge=0, le=60)


class PostResponse(BaseModel):
    id: str
    author_id: str
    author_name: str
    post_type: str                                       # "student" (request) or "teacher" (offer)
    title: str
    subject: str
    class_level: str
    number_of_classes: int
    classes_per_week: int
    total_hours: float
    honorarium: int
    preferred_days: List[str]
    preferred_time: str
    start_date: Optional[date] = None
    description: Optional[str] = None
    qualification: Optional[str] = None
    experience_years: Optional[int] = None
    created_at: datetime


class PostOptionsResponse(BaseModel):
    class_levels: List[str]
    days: List[str]
    time_slots: List[str]
