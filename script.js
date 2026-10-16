const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const menuToggle = $("#menuToggle");
const navLinks = $("#navLinks");

menuToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  menuToggle.textContent = open ? "✕" : "☰";
});

$$(".nav-links a").forEach(link => link.addEventListener("click", () => {
  navLinks.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
  menuToggle.textContent = "☰";
}));

$("#year").textContent = new Date().getFullYear();

// Smooth-scroll buttons inside project cards to the working demo sections.
$$("[data-scroll-to]").forEach(button => {
  button.addEventListener("click", () => {
    document.getElementById(button.dataset.scrollTo)?.scrollIntoView({ behavior: "smooth" });
  });
});

// To-do app with safe text rendering and localStorage persistence.
const TODO_STORAGE_KEY = "kalicharan-portfolio-tasks-v1";
const todoForm = $("#todoForm");
const todoInput = $("#todoInput");
const todoList = $("#todoList");
const todoCount = $("#todoCount");
let tasks = loadTasks();

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(TODO_STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved.filter(t => t && typeof t.text === "string" && typeof t.done === "boolean") : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // The app still works for this session if browser storage is disabled.
  }
}

function renderTasks() {
  todoList.replaceChildren();
  const remaining = tasks.filter(task => !task.done).length;
  todoCount.textContent = `${remaining} remaining · ${tasks.length} total`;

  if (tasks.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "No tasks yet. Add one above to get started.";
    todoList.append(empty);
    return;
  }

  tasks.forEach(task => {
    const li = document.createElement("li");
    if (task.done) li.classList.add("completed");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", `Mark ${task.text} ${task.done ? "incomplete" : "complete"}`);
    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "delete-task";
    remove.textContent = "Delete";
    remove.setAttribute("aria-label", `Delete task ${task.text}`);
    remove.addEventListener("click", () => {
      tasks = tasks.filter(item => item.id !== task.id);
      saveTasks();
      renderTasks();
    });

    li.append(checkbox, text, remove);
    todoList.append(li);
  });
}

todoForm.addEventListener("submit", event => {
  event.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;
  tasks.unshift({ id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, text, done: false });
  saveTasks();
  renderTasks();
  todoForm.reset();
  todoInput.focus();
});

$("#clearCompleted").addEventListener("click", () => {
  tasks = tasks.filter(task => !task.done);
  saveTasks();
  renderTasks();
});

renderTasks();

// Product listing: sample data, search, category/price filtering and sorting.
const products = [
  { id: 1, name: "Wireless Headphones", category: "Tech", price: 89, rating: 4.8, symbol: "♫" },
  { id: 2, name: "Desk Lamp", category: "Workspace", price: 45, rating: 4.5, symbol: "☼" },
  { id: 3, name: "Smart Watch", category: "Tech", price: 129, rating: 4.7, symbol: "◷" },
  { id: 4, name: "Travel Bottle", category: "Lifestyle", price: 28, rating: 4.3, symbol: "◒" },
  { id: 5, name: "Mechanical Keyboard", category: "Tech", price: 99, rating: 4.9, symbol: "⌨" },
  { id: 6, name: "Notebook Set", category: "Workspace", price: 22, rating: 4.4, symbol: "▤" },
  { id: 7, name: "Everyday Backpack", category: "Lifestyle", price: 74, rating: 4.6, symbol: "▱" },
  { id: 8, name: "Monitor Stand", category: "Workspace", price: 58, rating: 4.2, symbol: "▰" }
];

const productSearch = $("#productSearch");
const categoryFilter = $("#categoryFilter");
const sortProducts = $("#sortProducts");
const maxPrice = $("#maxPrice");
const maxPriceLabel = $("#maxPriceLabel");
const productGrid = $("#productGrid");
const productResultCount = $("#productResultCount");

function renderProducts() {
  const query = productSearch.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const limit = Number(maxPrice.value);
  let visible = products.filter(product =>
    (product.name.toLowerCase().includes(query) || product.category.toLowerCase().includes(query)) &&
    (category === "all" || product.category === category) &&
    product.price <= limit
  );

  if (sortProducts.value === "low") visible.sort((a, b) => a.price - b.price);
  if (sortProducts.value === "high") visible.sort((a, b) => b.price - a.price);
  if (sortProducts.value === "rating") visible.sort((a, b) => b.rating - a.rating);

  productGrid.replaceChildren();
  if (visible.length === 0) {
    const empty = document.createElement("p");
    empty.className = "no-products";
    empty.textContent = "No products match those filters. Try changing your search or price.";
    productGrid.append(empty);
  } else {
    visible.forEach(product => {
      const card = document.createElement("article");
      card.className = "product-card-mini";

      const visual = document.createElement("div");
      visual.className = "product-visual";
      visual.setAttribute("aria-hidden", "true");
      visual.textContent = product.symbol;

      const info = document.createElement("div");
      info.className = "product-mini-info";
      const name = document.createElement("h4");
      name.textContent = product.name;
      const cat = document.createElement("p");
      cat.className = "product-category";
      cat.textContent = product.category;
      const row = document.createElement("div");
      row.className = "product-price-row";
      const price = document.createElement("strong");
      price.textContent = `$${product.price}`;
      const rating = document.createElement("span");
      rating.textContent = `★ ${product.rating.toFixed(1)}`;
      row.append(price, rating);
      info.append(name, cat, row);
      card.append(visual, info);
      productGrid.append(card);
    });
  }
  productResultCount.textContent = `Showing ${visible.length} of ${products.length} sample products. Prices are demo data.`;
  maxPriceLabel.textContent = `$${limit}`;
}

[productSearch, categoryFilter, sortProducts, maxPrice].forEach(control => {
  control.addEventListener("input", renderProducts);
  control.addEventListener("change", renderProducts);
});
renderProducts();
