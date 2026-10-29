import bcrypt, jwt, time
from fastapi import Depends, HTTPException, Header, Query
from sqlalchemy.orm import Session
from ..config import JWT_SECRET
from ..database import get_db
from ..models import DemoUser
def hash_pw(p): return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()
def check_pw(p, h): return bcrypt.checkpw(p.encode(), h.encode())
def make_token(u): return jwt.encode({"sub": u.username, "exp": int(time.time()) + 8 * 3600}, JWT_SECRET, algorithm="HS256")
def current_user(authorization: str = Header(None), token: str = Query(None), db: Session = Depends(get_db)):
    t = token or (authorization or "").removeprefix("Bearer ").strip()
    try: name = jwt.decode(t, JWT_SECRET, algorithms=["HS256"])["sub"]
    except Exception: raise HTTPException(401, "Not authenticated")
    u = db.query(DemoUser).filter_by(username=name).first()
    if not u: raise HTTPException(401, "Unknown user")
    return u
def require_roles(*roles):
    def dep(u: DemoUser = Depends(current_user)):
        if u.role not in roles: raise HTTPException(403, f"Requires role: {', '.join(roles)}")
        return u
    return dep
