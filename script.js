const body = document.body;
const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const filterButtons = [...document.querySelectorAll("[data-filter]")];
const productCards = [...document.querySelectorAll("[data-category]")];
const addButtons = [...document.querySelectorAll("[data-add]")];
const cartList = document.querySelector("[data-cart-list]");
const cartCount = document.querySelector("[data-cart-count]");
const cartTotal = document.querySelector("[data-cart-total]");

const prices = {
  "Ribbon Knit Cardigan": 89,
  "Blush Midi Skirt": 119,
  "Seoul Layer Set": 219,
  "Lovely Puff Blouse": 99,
};

let cart = ["Ribbon Knit Cardigan", "Blush Midi Skirt"];

menuToggle?.addEventListener("click", () => {
  body.classList.toggle("menu-open");
});

nav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    body.classList.remove("menu-open");
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selected = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    productCards.forEach((card) => {
      card.hidden = selected !== "all" && card.dataset.category !== selected;
    });
  });
});

function renderCart() {
  cartList.innerHTML = cart.map((item) => `<li>${item}</li>`).join("");
  cartCount.textContent = String(cart.length);
  const total = cart.reduce((sum, item) => sum + (prices[item] ?? 0), 0);
  cartTotal.textContent = `RM ${total}`;
}

addButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.dataset.add;
    if (!item) return;
    cart = [...cart, item];
    renderCart();
    button.textContent = "Added";
    window.setTimeout(() => {
      button.textContent = "Add";
    }, 1200);
  });
});
