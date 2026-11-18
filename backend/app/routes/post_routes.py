from typing import List, Literal, Optional

from fastapi import APIRouter, Depends, Query

from app.controllers import post_controller
from app.controllers.dependencies import get_current_user
from app.schemas.auth_schema import MessageResponse
from app.schemas.post_schema import CreatePostRequest, PostOptionsResponse, PostResponse

router = APIRouter(prefix="/api/posts", tags=["Posts"])


# Fixed paths ("/options", "/mine") must come before "/{post_id}",
# otherwise FastAPI would treat the word "mine" as a post id.

@router.get("/options", response_model=PostOptionsResponse)
def get_options(current_user=Depends(get_current_user)):
    return post_controller.get_options()


@router.get("/mine", response_model=List[PostResponse])
def list_my_posts(current_user=Depends(get_current_user)):
    return post_controller.list_my_posts(current_user)


@router.post("", response_model=PostResponse, status_code=201)
def create_post(data: CreatePostRequest, current_user=Depends(get_current_user)):
    return post_controller.create_post(data, current_user)


@router.get("", response_model=List[PostResponse])
def list_posts(
    post_type: Optional[Literal["student", "teacher"]] = None,   # leave empty to get both
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=50),
    current_user=Depends(get_current_user),
):
    return post_controller.list_posts(post_type, skip, limit)


@router.get("/{post_id}", response_model=PostResponse)
def get_post(post_id: str, current_user=Depends(get_current_user)):
    return post_controller.get_post(post_id)


@router.delete("/{post_id}", response_model=MessageResponse)
def delete_post(post_id: str, current_user=Depends(get_current_user)):
    return post_controller.delete_post(post_id, current_user)
