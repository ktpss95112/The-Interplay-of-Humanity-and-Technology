import uuid

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = 'users'

    user_id = Column(String, primary_key=True, default=lambda : str(uuid.uuid4()))
    is_awarded = Column(Boolean, default=False)


class Task(Base):
    __tablename__ = 'tasks'

    task_id = Column(Integer, primary_key=True)
    admin_token = Column(String)


class SolveAttempt(Base):
    __tablename__ = 'solve_attempts'

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer) # TODO: relation
    user_id = Column(String) # TODO: relation


def initialize_model(db):
    with open('admin.txt', 'r') as f:
        content = f.read()

    import random
    import time

    # dirty way to prevent race condition
    time.sleep(random.random() * 2)

    for line in content.strip().split('\n'):
        task_id, _, admin_token = line.partition(' ')
        task_id = int(task_id)

        # test if exist
        if db.query(Task).filter(Task.task_id == task_id).all():
            continue

        db_task = Task(task_id=task_id, admin_token=admin_token)
        db.add(db_task)

    db.commit()
