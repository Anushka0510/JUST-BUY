// const products = [
//   { id: 1, img: "images/kurtaset4.webp", badge: "Sale", title: "Embroided Kurta Set", price: "₹750", rating: 4.5 },
//   { id: 2, img: "images/saree6.webp", badge: "New", title: "Kanjeevaram Silk Saree", price: "₹1590", rating: 4.5 },
//   { id: 3, img: "images/top6.jpg", badge: "", title: "Printed Women Shirt", price: "₹600", rating: 4.5 },
//   { id: 4, img: "images/heels7.webp", badge: "New", title: "White Shoes", price: "₹1200", rating: 4.5 },
//   { id: 5, img: "images/mentshirt.jpg", badge: "New", title: "Men Printed Tshirt", price: "₹700", rating: 4.5 },
//   { id: 6, img: "images/plate1.jpeg", badge: "Hot", title: "Ceramic Blue Plates", price: "₹1499", rating: 4.5 },
//   { id: 7, img: "images/heels4.webp", badge: "Hot", title: "Women Heels", price: "₹800", rating: 4.5 },
//   { id: 8, img: "images/table1.jpg", badge: "", title: "Living Room table", price: "₹3000", rating: 4.5 },
//   { id: 9, img: "images/earring1.jpg", badge: "", title: "Beautiful kundan Earrings", price: "₹530", rating: 3.5 },
//   { id: 10, img: "images/watch1.jpg", badge: "Hot", title: "Stylish Analog Watch", price: "₹3500", rating: 4.5 }
// ];

let products = [];

async function loadProducts() {
  const response = await fetch("/api/products");
  products = await response.json();
  renderProducts();
}

loadProducts();

function getStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  let stars = "";
  for (let i = 0; i < fullStars; i++) stars += '<i class="fa-solid fa-star"></i>';
  if (halfStar) stars += '<i class="fa-solid fa-star-half-stroke"></i>';
  for (let i = 0; i < emptyStars; i++) stars += '<i class="fa-regular fa-star"></i>';
  return stars;
}

function renderProducts() {
  const container = document.querySelector(".products");

  const cardsArray = products.map(function (product) {
    return `<div class="row" data-id="${product.id}">
      <img src="${product.img}" alt="${product.title}">
      ${product.badge ? `<div class="product-text"><h5>${product.badge}</h5></div>` : ""}
      <div class="heart-icon"><i class="fa-regular fa-heart"></i></div>
      <div class="rating">${getStars(product.rating)}</div>
      <div class="price">
        <h4>${product.title}</h4>
        <p>${product.price}</p>
      </div>
      <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
    </div>`;
  });

  container.innerHTML = cardsArray.join("");
}

// renderProducts();

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
  const totalItems = cart.reduce(function (sum, item) {
    return sum + item.quantity;
  }, 0);
  document.querySelector("#cart-count").textContent = totalItems;
}

function getNumericPrice(priceStr) {
  const match = priceStr.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function renderCartPanel() {
  const cartItemsContainer = document.querySelector("#cart-items");

  const itemsHTML = cart.map(function (item) {
    const product = products.find(function (p) { return p.id === item.id; });
    return `<div class="cart-item">
      <img src="${product.img}" alt="${product.title}">
      <div class="cart-item-details">
        <p>${product.title}</p>
        <p>Qty: ${item.quantity} × ₹${getNumericPrice(product.price)}</p>
      </div>
      <button class="remove-item-btn" data-id="${item.id}">Remove</button>
    </div>`;
  });

  cartItemsContainer.innerHTML = itemsHTML.join("");

  const totalPrice = cart.reduce(function (sum, item) {
    const product = products.find(function (p) { return p.id === item.id; });
    return sum + getNumericPrice(product.price) * item.quantity;
  }, 0);

  document.querySelector("#cart-total-price").textContent = "₹" + totalPrice;
}

document.querySelector(".products").addEventListener("click", function (event) {
  if (event.target.classList.contains("add-to-cart-btn")) {
    const productId = Number(event.target.dataset.id);

    const existingItem = cart.find(function (item) {
      return item.id === productId;
    });

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ id: productId, quantity: 1 });
    }

    saveCart();
    updateCartCount();
    renderCartPanel();
  }
});

document.querySelector("#cart-icon").addEventListener("click", function (event) {
  event.preventDefault();
  document.querySelector("#cart-panel").classList.toggle("open");
  renderCartPanel();
});

document.querySelector("#cart-close").addEventListener("click", function () {
  document.querySelector("#cart-panel").classList.remove("open");
});

document.querySelector("#cart-items").addEventListener("click", function (event) {
  if (event.target.classList.contains("remove-item-btn")) {
    const idToRemove = Number(event.target.dataset.id);
    cart = cart.filter(function (item) { return item.id !== idToRemove; });
    saveCart();
    updateCartCount();
    renderCartPanel();
  }
});

document.querySelector("#checkout-btn").addEventListener("click", async function () {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please log in to place an order.");
    window.location.href = "loginpage.html";
    return;
  }

  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    }
  });

  const data = await response.json();

  if (response.ok) {
    alert(data.message);
    cart = [];
    saveCart();
    updateCartCount();
    renderCartPanel();
  } else {
    alert(data.error);
    window.location.href = "loginpage.html";
  }
});

updateCartCount();