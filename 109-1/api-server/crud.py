# CRUD stands for Create, Read, Update, Delete
from sqlalchemy.orm import Session

import models, schemas


def get_user_by_user_id(db: Session, user_id: str):
    return db.query(models.User).filter(models.User.user_id == user_id).first()


def create_user(db: Session):
    db_user = models.User()
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_task_by_admin_token(db: Session, admin_token: str):
    return db.query(models.Task).filter(models.Task.admin_token == admin_token).first()


def create_solve(db: Session, user_id: str, task_id: int):
    db_solve = models.SolveAttempt(user_id=user_id, task_id=task_id)
    db.add(db_solve)
    db.commit()
    db.refresh(db_solve)
    return db_solve


def get_solve_attempt_by_user_id(db: Session, user_id: str):
    return db.query(models.SolveAttempt).filter(models.SolveAttempt.user_id == user_id).all()


def give_award_to_user_id(db: Session, user_id: str):
    db_user = get_user_by_user_id(db, user_id)
    db_user.is_awarded = True
    db.commit()
    db.refresh(db_user)
    return db_user
