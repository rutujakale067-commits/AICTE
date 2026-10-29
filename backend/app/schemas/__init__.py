from pydantic import BaseModel, Field, field_validator
from datetime import date

class LoginIn(BaseModel):
    username: str = Field(min_length=1, max_length=40)
    password: str = Field(min_length=1, max_length=100)

class DeclarationsIn(BaseModel):
    payment_applicable: bool | None = None
    building_completion_date: date | None = None
    govt_building: bool | None = None
    declared_identifiers: dict[str, str] | None = None
    @field_validator("declared_identifiers")
    @classmethod
    def _v(cls, v):
        if v:
            for k, x in v.items():
                if len(x) > 80: raise ValueError("identifier too long")
        return v

class AssignIn(BaseModel):
    reviewer_id: int | None

class FieldCorrectionIn(BaseModel):
    corrected_value: str = Field(min_length=1, max_length=500)
    reason: str = Field(min_length=3, max_length=300)

class CommentIn(BaseModel):
    comment: str = Field(min_length=2, max_length=2000)

class ResolveIn(BaseModel):
    comment: str = Field(min_length=3, max_length=2000)

class OverrideIn(BaseModel):
    new_status: str
    reason: str = Field(min_length=10, max_length=2000)
    @field_validator("new_status")
    @classmethod
    def _s(cls, v):
        if v not in ("PASS", "NOT_APPLICABLE", "POTENTIAL_DEFICIENCY"): raise ValueError("new_status must be PASS, NOT_APPLICABLE or POTENTIAL_DEFICIENCY")
        return v

class RuleUpdateIn(BaseModel):
    config: dict
    requirement_level: str | None = None
    change_note: str = Field(min_length=5, max_length=300)
