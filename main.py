from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from db import init_db, SessionLocal, User, Chat

# Initialize the database
init_db()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for API requests
class Message(BaseModel):
    message: str
    username: str = None

class UserCreate(BaseModel):
    username: str
    password: str

class ChatCreate(BaseModel):
    username: str
    message: str

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from fastapi.staticfiles import StaticFiles
app.mount("/", StaticFiles(directory="react-frontend/build", html=True), name="react")

@app.post("/message")
def send_message(msg: Message):
    # Basic response logic using user's message and username if provided.
    if msg.username:
        response = f"I'm here to help, {msg.username}! You said '{msg.message}'"
    else:
        response = f"You said '{msg.message}'"
    return {"message": f"Bot: {response}"}

@app.post("/users")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    new_user = User(username=user.username, password=user.password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully", "user_id": new_user.id}

@app.post("/chats")
def create_chat(chat: ChatCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == chat.username).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="User does not exist")
    new_chat = Chat(user_id=db_user.id, message=chat.message)
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)
    return {"message": "Chat saved successfully", "chat_id": new_chat.id}

@app.get("/chats/{username}")
def get_chats(username: str, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == username).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="User does not exist")
    chats = db.query(Chat).filter(Chat.user_id == db_user.id).all()
    return {"chats": [{"message": chat.message, "timestamp": chat.timestamp} for chat in chats]}
