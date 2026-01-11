"""
Order processing business logic
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException
import models
import schemas
import uuid
from models import Order 
from schemas import OrderStatus


def create_order(order_request: schemas.CreateOrderRequest, db: Session):
    """Create an order from cart items"""
    if not order_request.cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    order_items = []
    total = 0.0

    # Validate and process each item
    for cart_item in order_request.cart_items:
        product = db.query(models.Product).filter(
            models.Product.id == cart_item.product_id
        ).first()

        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product {cart_item.product_id} not found"
            )

        if product.stock < cart_item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {product.name}"
            )

        # Deduct stock
        product.stock -= cart_item.quantity

        # Create order item
        order_item = models.OrderItem(
            product_id=product.id,
            product_name=product.name,
            quantity=cart_item.quantity,
            price=product.price
        )
        order_items.append(order_item)
        total += product.price * cart_item.quantity

    # Create order
    order = models.Order(
        id=str(uuid.uuid4()),
        total=round(total, 2),
        status="pending",
        items=order_items
    )

    db.add(order)
    db.commit()
    db.refresh(order)

    return order


def get_all_orders(db: Session):
    """Get all orders"""
    orders = db.query(models.Order).order_by(models.Order.created_at.desc()).all()
    return orders


def get_order_by_id(order_id: str, db: Session):
    """Get a single order by ID"""
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

def cancel_order(order_id: str, db: Session):
    """Cancel an order and restore stock"""
    
    # 1. Search for the order
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    
    # 2. Check status (Cancellation is only possible if it is pending)
    if order.status != "pending":
        raise HTTPException(
            status_code=400, 
            detail="Only pending orders can be cancelled"
        )
    
    # 3. Restock the products
    for item in order.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if product:
            product.stock += item.quantity
            
    # 4. Update status
    order.status = "cancelled"
    db.commit()
    db.refresh(order)
    
    return order

VALID_TRANSITIONS = {
    "pending": ["processing", "cancelled"],
    "processing": ["successful", "failed", "cancelled"],
    "successful": [],   
    "cancelled": [],    
    "failed": []        
}

def update_order_status_controller(db: Session, order_id: str, new_status: OrderStatus):
    
    # 1. Search for the order
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    current_status = order.status

    # 2. Validate transition
    allowed_statuses = VALID_TRANSITIONS.get(current_status, [])
    
    
    if new_status.value not in allowed_statuses:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid transition from '{current_status}' to '{new_status.value}'. Allowed: {allowed_statuses}"
        )

    
    # 3. Apply change
    order.status = new_status.value
    db.commit()
    db.refresh(order)
    
    return order