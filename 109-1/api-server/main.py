from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import crud, models, schemas
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)
models.initialize_model(SessionLocal())

app = FastAPI()


origins = [
    'http://linux10.csie.org:9393',
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post('/users', response_model=schemas.User)
def create_user(db: Session = Depends(get_db)):
    return crud.create_user(db)


@app.get('/users/{user_id}', response_model=schemas.User)
def get_user(user_id: str, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_user_id(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail='User not found')
    return db_user


@app.post('/checkAdmin')
def check_admin(admin_token: str, db: Session = Depends(get_db)):
    db_task = crud.get_task_by_admin_token(db, admin_token)
    if db_task is None:
        raise HTTPException(status_code=401, detail='You are not admin')
    return {'task_id': db_task.task_id}


@app.post('/finish/task/{task_id}/user/{user_id}', response_model=schemas.SolveAttempt)
def user_finish_task(admin_token: str, task_id: int, user_id: str, db: Session = Depends(get_db)):
    db_task = crud.get_task_by_admin_token(db, admin_token)
    if db_task is None:
        raise HTTPException(status_code=401, detail='You are not admin')
    elif db_task.task_id != task_id:
        raise HTTPException(status_code=401, detail=f'You are not the admin of task {db_task.task_id}')

    db_user = crud.get_user_by_user_id(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail=f'User not exist')

    return crud.create_solve(db, user_id, task_id)


@app.get('/status/user/{user_id}', response_model=schemas.UserStatus)
def user_status(user_id: str, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_user_id(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail=f'User not exist')

    db_solve = crud.get_solve_attempt_by_user_id(db, user_id)
    solve = set()
    for s in db_solve:
        solve.add(s.task_id)

    return {
        'user_id': db_user.user_id,
        'solve': list(solve),
        'is_awarded': db_user.is_awarded,
    }


@app.post('/award/user/{user_id}', response_model=schemas.User)
def give_award(admin_token: str, user_id: str, db: Session = Depends(get_db)):
    db_task = crud.get_task_by_admin_token(db, admin_token)
    if db_task is None:
        raise HTTPException(status_code=401, detail='You are not admin')

    db_user = crud.get_user_by_user_id(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail=f'User not exist')

    if db_user.is_awarded:
        raise HTTPException(status_code=403, detail='You have been awarded')

    db_solve = crud.get_solve_attempt_by_user_id(db, user_id)
    if {1, 2, 3, 4, 5} != {s.task_id for s in db_solve}:
        raise HTTPException(status_code=403, detail='You have not finished all tasks')

    db_user = crud.give_award_to_user_id(db, user_id)
    return db_user
