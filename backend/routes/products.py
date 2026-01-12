"""
Product API routes
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
import schemas
from controllers import products as product_controller


router = APIRouter(prefix="/api/products", tags=["products"])

#challenge 4
#challenge 6
@router.get("", response_model=schemas.PaginatedProductResponse)
def get_products(
    page: int = Query(1, ge=1),
    limit: int = Query(10, le=100),
    search: Optional[str] = Query(None, description="Search term"),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    sort_by: Optional[str] = Query(None, regex="^(price|name|stock)$"),
    order: Optional[str] = Query("asc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db)
):
    """Get products with advanced search, filtering and sorting"""
    return product_controller.get_all_products(
        db, page, limit, search, min_price, max_price, sort_by, order
    )

@router.get("/{product_id}", response_model=schemas.Product)
def get_product(product_id: str, db: Session = Depends(get_db)):
    """Get a single product by ID"""
    return product_controller.get_product_by_id(product_id, db)


@router.post("", response_model=schemas.Product)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    """Create a new product (for admin/testing)"""
    return product_controller.create_product(product, db)
