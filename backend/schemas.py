"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum




# Product Schemas
class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    stock: int
    image_url: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class Product(ProductBase):
    id: str

    class Config:
        from_attributes = True

# NEW challenge 4
class PaginatedProductResponse(BaseModel):
    items: List[Product]  # PRODUCTS
    total: int            # TOTAL NUMBER OF PRODUCTS IN THE DATABASE
    page: int             # CURREBT PAGE
    limit: int            # PRODUCTS PER PAGE
    pages: int            # TOTAL PAGES

    class Config:
        from_attributes = True

# Cart Schemas
class CartItemBase(BaseModel):
    product_id: str
    quantity: int


class CartItem(CartItemBase):
    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    items: List[CartItem]


# Order Schemas
class OrderItemBase(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price: float


class OrderItem(OrderItemBase):
    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: str
    items: List[OrderItem]
    total: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# NEW challenge 4
class PaginatedOrderResponse(BaseModel):
    items: List[OrderResponse]
    total: int            # TOTAL NUMBER OF ORDERS IN THE DATABASE
    page: int             # CURREBT PAGE
    limit: int            # ORDERS PER PAGE
    pages: int            # TOTAL PAGES

#NEW 
class OrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SUCCESSFUL = "successful"
    CANCELLED = "cancelled"
    FAILED = "failed"

class CreateOrderRequest(BaseModel):
    cart_items: List[CartItem]

#NEW
class OrderStatusUpdate(BaseModel):
    status: OrderStatus