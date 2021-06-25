from typing import List

from pydantic import BaseModel


class UserBase(BaseModel):
    pass


class User(UserBase):
    user_id: str
    is_awarded: bool

    class Config:
        orm_mode = True


class SolveAttemptBase(BaseModel):
    user_id: str
    task_id: int


class SolveAttempt(SolveAttemptBase):
    id: int

    class Config:
        orm_mode = True


class UserStatus(BaseModel):
    user_id: str
    solve: List[int]
    is_awarded: bool
