import { useState, useEffect } from 'react'
import './App.css'
import OrderSuccessModal from './OrderSuccess'
import OrderDetailsModal from './OrderDetailsModal'


// API base URL (env fallback for local development)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  
  /* =========================
     PRODUCT PAGINATION STATES
     ========================= */
  const [products, setProducts] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const ITEMS_PER_PAGE = 5;

  /* =========================
     SEARCH, FILTER & SORT
     ========================= */
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState(""); // 'price', 'name', 'stock'
  const [sortOrder, setSortOrder] = useState("asc");

   /* =========================
     ORDERS PAGINATION
     ========================= */
  const [ordersPage, setOrdersPage] = useState(1);
  const [totalOrderPages, setTotalOrderPages] = useState(1);
  
  /* =========================
     CART & ORDERS STATE
     ========================= */
  const [cart, setCart] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  /* =========================
     UI VISIBILITY STATES
     ========================= */
  const [showCart, setShowCart] = useState(false) 
  const [showOrders, setShowOrders] = useState(false)
  
  
  /* =========================
     VISUAL FEEDBACK (ADD TO CART)
     ========================= */
  const [addedItems, setAddedItems] = useState({}) 

  /* =========================
     MODALS STATE
     ========================= */
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [createdOrderId, setCreatedOrderId] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null); 
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  /* =========================
     SESSION HANDLING
     ========================= */
  const [sessionId] = useState(() => {
    const saved = localStorage.getItem('sessionId')
    return saved || `session-${Date.now()}`
  })

  /* =========================
     DEBOUNCED SEARCH EFFECT
     ========================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      if (searchTerm !== debouncedSearch) setCurrentPage(1); 
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  /* =========================
     INITIAL DATA LOAD & UPDATES
     ========================= */
  useEffect(() => {
    localStorage.setItem('sessionId', sessionId)
    fetchProducts(currentPage)
    fetchCart()
  }, [sessionId, currentPage, debouncedSearch, sortBy, sortOrder])

  /* =========================
     FETCH PRODUCTS (PAGINATED + FILTERED)
     ========================= */
  const fetchProducts = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page,
        limit: ITEMS_PER_PAGE
      });

      if (debouncedSearch) params.append("search", debouncedSearch);
      if (priceRange.min) params.append("min_price", priceRange.min);
      if (priceRange.max) params.append("max_price", priceRange.max);
      if (sortBy) {
        params.append("sort_by", sortBy);
        params.append("order", sortOrder);
      }
      
      const response = await fetch(`${API_URL}/api/products?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch products')
      
      const data = await response.json()
      setProducts(data.items)
      setTotalPages(data.pages)
      setCurrentPage(data.page)
      
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  /* =========================
     FILTER HANDLERS
     ========================= */
  const handlePriceFilter = () => {
    setCurrentPage(1);
    fetchProducts(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange({ min: "", max: "" });
    setSortBy("");
    setSortOrder("asc");
    setCurrentPage(1);
  };

   /* =========================
     CART LOGIC
     ========================= */
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

      setAddedItems(prev => ({...prev, [productId]:true}))
      setTimeout(() => {
        setAddedItems(prev=>{
          const next = {...prev}
          delete next[productId]
          return next
        })
      }, 600);
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

  /* =========================
     ORDERS LOGIC
     ========================= */
  const fetchOrders = async (page = 1) => {
    try {
      const response = await fetch(`${API_URL}/api/orders?page=${page}&limit=3`)
      if (!response.ok) throw new Error('Failed to fetch orders')
      
      const data = await response.json()
      setOrders(data.items)
      setOrdersPage(data.page)
      setTotalOrderPages(data.pages)
    } catch (err) {
      console.error('Error fetching orders:', err)
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
      
      setCreatedOrderId(order.id) 
      setSelectedOrder(order)
      setShowSuccessModal(true)   

      await fetch(`${API_URL}/api/cart/${sessionId}`, { method: 'DELETE' })
      await fetchCart()
      fetchProducts(currentPage)
      setShowCart(false)
    } catch (err) {
      alert(err.message)
    }
  }

  /* =========================
     ORDER ACTIONS
     ========================= */
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
        throw new Error(error.detail); 
      }

      const updatedOrder = await response.json();
      setSelectedOrder(updatedOrder); 
      fetchOrders(); 
      
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  /* =========================
     HELPERS
     ========================= */
  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const product = products.find(p => p.id === item.product_id)
      return total + (product ? product.price * item.quantity : 0)
    }, 0).toFixed(2)
  }

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  if (loading && currentPage === 1 && !products.length) return <div className="loading">Loading...</div>


  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  const handleViewOrder = () => {
    setShowSuccessModal(false);
    setShowDetailsModal(true);
    fetchOrders(); 
  };
  
  /* =========================
     JSX RENDER
     ========================= */

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
              if (!showOrders) fetchOrders(1);
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
                  const product = products.find(p => p.id === item.product_id) || {name: 'Loading...', price: 0} 
                  
                  return (
                    <div key={item.product_id} className="cart-item">
                      {product.image_url && <img src={product.image_url} alt={product.name} />}
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
            <>
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
                      className="btn-view-details"
                      onClick={() => handleViewOrderDetails(order)}
                    >
                      Ver Detalles
                    </button>
                  </div>
                ))}
              </div>
              <div className="pagination-controls">
                  <button
                    disabled={ordersPage === 1}
                    onClick={() => fetchOrders(ordersPage - 1)}
                    className="btn-secondary btn-pagination"
                  >
                    Prev
                  </button>
                  <span>
                    Page {ordersPage} of {totalOrderPages}
                  </span>
                  <button
                    disabled={ordersPage === totalOrderPages}
                    onClick={() => fetchOrders(ordersPage + 1)}
                    className="btn-secondary btn-pagination"
                  >
                    Next
                  </button>
                </div>
            </>
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

      <div className="filters-container">
        <div className="filters-row">
          
          {/* Search */}
          <div className="filter-group">
            <input 
              type="text" 
              className="search-input"
              placeholder="🔍 Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Price Range */}
          <div className="filter-group">
            <input 
              type="number" 
              placeholder="Min $" 
              className="price-input"
              value={priceRange.min}
              onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
            />
            <span className="filter-separator">-</span>
            <input 
              type="number" 
              placeholder="Max $" 
              className="price-input"
              value={priceRange.max}
              onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
            />
            <button onClick={handlePriceFilter} className="btn-secondary btn-apply">Apply</button>
          </div>

          {/* Sort */}
          <div className="filter-group">
            <select 
              value={sortBy} 
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
              className="filter-select"
            >
              <option value="">Sort By...</option>
              <option value="price">Price</option>
              <option value="name">Name</option>
              <option value="stock">Stock</option>
            </select>
            
            {sortBy && (
              <button 
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="sort-toggle-btn"
              >
                {sortOrder === 'asc' ? '⬆️ Low to High' : '⬇️ High to Low'}
              </button>
            )}
          </div>

          {/* Clear */}
          <button onClick={clearFilters} className="clear-filters-btn">
            × Clear All
          </button>
        </div>
      </div>

      <main className="products-grid">
        {loading ? <p className="loading-message">Loading products...</p> : (
            products.length > 0 ? (
                products.map(product => {
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
                              <span className="success-icon">
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
                })
            ) : (
                <div className="full-width-message">
                    <h3>No products found</h3>
                    <p>Try adjusting your search or filters.</p>
                </div>
            )
        )}
      </main>

       {products.length > 0 && (
           <div className="pagination-controls">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="btn-pagination"
              >
                Previous
              </button>
              
              <span>Page {currentPage} of {totalPages}</span>
              
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="btn-pagination"
              >
                Next
              </button>
           </div>
       )}
    </div>
  )
}

export default App