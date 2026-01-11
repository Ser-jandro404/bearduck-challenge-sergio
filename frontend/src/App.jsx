import { useState, useEffect } from 'react'
import './App.css'
import OrderSuccessModal from './OrderSuccess' //challenge #2a
import OrderDetailsModal from './OrderDetailsModal';// challenge #2b
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCart, setShowCart] = useState(false) 
  const [showOrders, setShowOrders] = useState(false)
  // Tracks products that were recently added to cart
  // Used to trigger temporary success animation per product (Challenge 01)
  const [addedItems, setAddedItems] = useState({}) 
  //-------------------------

  // Controls order success modal visibility and content
  // Replaces browser alert() with custom modal (Challenge 02)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [createdOrderId, setCreatedOrderId] = useState(null)
  // ------------------------------------

  const [selectedOrder, setSelectedOrder] = useState(null); 
  const [showDetailsModal, setShowDetailsModal] = useState(false);


  const [sessionId] = useState(() => {
    const saved = localStorage.getItem('sessionId')
    return saved || `session-${Date.now()}`
  })

  useEffect(() => {
    localStorage.setItem('sessionId', sessionId)
    fetchProducts()
    fetchCart()
  }, [sessionId])

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`)
      if (!response.ok) throw new Error('Failed to fetch products')
      const data = await response.json()
      setProducts(data)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const fetchCart = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cart/${sessionId}`)
      if (!response.ok) throw new Error('Failed to fetch cart')
      const data = await response.json()
      setCart(data.items || [])
    } catch (err) {
      console.error('Error fetching cart:', err)
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/orders`)
      if (!response.ok) throw new Error('Failed to fetch orders')
      const data = await response.json()
      setOrders(data)
    } catch (err) {
      console.error('Error fetching orders:', err)
    }
  }

  const addToCart = async (productId) => {
    try {
      const response = await fetch(`${API_URL}/api/cart/${sessionId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity: 1 })
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail)
      }
      await fetchCart()
      await fetchProducts()

      // Trigger temporary visual feedback for "Add to Cart"
      // Marks product as recently added to:
      // - Disable button
      // - Show success color + check icon
      // Automatically resets after animation duration (~600ms)
      setAddedItems(prev => ({...prev, [productId]:true}))
      setTimeout(() => {
        setAddedItems(prev=>{
          const next = {...prev}
          delete next[productId]
          return next
        })
      }, 600);
      //---------------------------------------
    } catch (err) {
      alert(err.message)
    }
  }

  const updateCartItem = async (productId, quantity) => {
    try {
      if (quantity === 0) {
        await removeFromCart(productId)
        return
      }
      const response = await fetch(`${API_URL}/api/cart/${sessionId}/items/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity })
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail)
      }
      await fetchCart()
    } catch (err) {
      alert(err.message)
    }
  }

  const removeFromCart = async (productId) => {
    try {
      const response = await fetch(`${API_URL}/api/cart/${sessionId}/items/${productId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to remove item')
      await fetchCart()
    } catch (err) {
      alert(err.message)
    }
  }

  const createOrder = async () => {
    if (cart.length === 0) {
      alert('Cart is empty')
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart_items: cart })
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail)
      }
      const order = await response.json()
      // Store created order ID and display success modal
      // This replaces the default browser alert with a custom UI (Challenge 02)
      setCreatedOrderId(order.id) 
      setSelectedOrder(order)
      setShowSuccessModal(true)   

      // Clear cart
      await fetch(`${API_URL}/api/cart/${sessionId}`, { method: 'DELETE' })
      await fetchCart()
      await fetchProducts()
      setShowCart(false)
    } catch (err) {
      alert(err.message)
    }
  }

  // Modal interaction handlers
  // Allows user to either close modal or navigate to order history
  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  const handleViewOrder = () => {
    setShowSuccessModal(false);
    setShowDetailsModal(true);
    fetchOrders(); 
  };
  // -----------------------------------------------------

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const product = products.find(p => p.id === item.product_id)
      return total + (product ? product.price * item.quantity : 0)
    }, 0).toFixed(2)
  }

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const cancelOrder = async (orderId) => {
    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}/cancel`, {
        method: 'PUT' 
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail);
      }
      
      const updatedOrder = await response.json();
      
      alert('Pedido cancelado correctamente');
      
      
      await fetchOrders(); 
      setSelectedOrder(updatedOrder); 
      
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail); // Aquí saltará si la transición es inválida
      }

      const updatedOrder = await response.json();
      
      // Actualizamos la UI
      setSelectedOrder(updatedOrder); // Actualiza el modal abierto
      fetchOrders(); // Actualiza la lista de fondo
      
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <div className="loading">Loading...</div>
  if (error) return <div className="error">Error: {error}</div>

  return (
    <div className="app">
      <header className="header">
        <h1>E-commerce Store</h1>
        <div className="header-buttons">
          <button
            className="cart-button"
            onClick={() => { setShowCart(!showCart); setShowOrders(false); }}
          >
            Cart ({getCartItemCount()})
          </button>
          <button
            className="orders-button"
            onClick={() => {
              setShowOrders(!showOrders);
              setShowCart(false);
              if (!showOrders) fetchOrders();
            }}
          >
            Orders
          </button>
        </div>
      </header>

      
      <OrderSuccessModal 
        isOpen={showSuccessModal} 
        orderId={createdOrderId} 
        onClose={handleCloseModal}
        onViewOrder={handleViewOrder}
      />
      

      {showCart && (
        <div className="cart-panel">
          <h2>Shopping Cart</h2>
          {cart.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            <>
              <div className="cart-items">
                {cart.map(item => {
                  const product = products.find(p => p.id === item.product_id)
                  if (!product) return null
                  return (
                    <div key={item.product_id} className="cart-item">
                      <img src={product.image_url} alt={product.name} />
                      <div className="cart-item-details">
                        <h3>{product.name}</h3>
                        <p>${product.price}</p>
                        <div className="quantity-controls">
                          <button onClick={() => updateCartItem(item.product_id, item.quantity - 1)}>-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateCartItem(item.product_id, item.quantity + 1)}>+</button>
                          <button
                            className="remove-button"
                            onClick={() => removeFromCart(item.product_id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="cart-item-total">
                        ${(product.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="cart-footer">
                <h3>Total: ${getCartTotal()}</h3>
                <button className="checkout-button" onClick={createOrder}>
                  Create Order
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {showOrders && (
        <div className="orders-panel">
          <h2>Order History</h2>
          {orders.length === 0 ? (
            <p>No orders yet</p>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <h3>Order #{order.id.substring(0, 8)}</h3>
                    
                    <span className={`order-status ${order.status}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="order-date">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                  <div className="order-total">
                    <strong>Total: ${order.total.toFixed(2)}</strong>
                  </div>
                  
                  
                  <button 
                    style={{
                        marginTop: '1rem',
                        width: '100%',
                        padding: '0.5rem',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                    onClick={() => handleViewOrderDetails(order)}
                  >
                    Ver Detalles
                  </button>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      
      <OrderDetailsModal 
        isOpen={showDetailsModal}
        order={selectedOrder}
        onClose={() => setShowDetailsModal(false)}
        onCancelOrder={cancelOrder}
        onUpdateStatus={handleUpdateStatus}
      />

      <main className="products-grid">
        {products.map(product => {
            // Determines if this product is currently in "added" animation state
            const isAdded = addedItems[product.id];
            
            return (
              <div key={product.id} className="product-card">
                <img src={product.image_url} alt={product.name} />
                <h3>{product.name}</h3>
                <p className="description">{product.description}</p>
                <div className="product-footer">
                  <span className="price">${product.price}</span>
                  <span className="stock">Stock: {product.stock}</span>
                </div>
              
                <button
                  onClick={() => addToCart(product.id)}
                  disabled={product.stock === 0 || isAdded}
                  className={`add-cart-btn ${product.stock === 0 ? 'disabled' : ''} ${isAdded ? 'success' : ''}`}
                >
                  {isAdded ? (
                     <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                         <path d="M20 6L9 17l-5-5" />
                       </svg>
                     </span>
                  ) : (
                    product.stock === 0 ? 'Out of Stock' : 'Add to Cart'
                  )}
                </button>
              </div>
            )
        })}
      </main>
    </div>
  )
}

export default App
