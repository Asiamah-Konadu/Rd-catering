export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  featured?: boolean;
};

export const demoMenu: MenuItem[] = [
  { id: "jollof", name: "Jollof Rice & Chicken", description: "Fragrant Ghana-style jollof served with seasoned chicken.", price: 65, category: "Mains", image: "/images/jollof.jpg", featured: true },
  { id: "waakye", name: "Waakye Special", description: "Waakye with stew, gari, spaghetti and your choice of protein.", price: 60, category: "Mains", image: "/images/waakye.jpg", featured: true },
  { id: "fried-rice", name: "Fried Rice & Chicken", description: "Savory fried rice with vegetables and crispy chicken.", price: 65, category: "Mains", image: "/images/fried-rice.jpg" },
  { id: "banku", name: "Banku & Tilapia", description: "Soft banku, grilled tilapia, pepper and fresh vegetables.", price: 95, category: "Mains", image: "/images/tilapia.jpg" },
  { id: "sobolo", name: "Sobolo", description: "Chilled hibiscus drink with ginger and pineapple notes.", price: 15, category: "Drinks", image: "/images/sobolo.jpg" },
  { id: "fruit-cup", name: "Fresh Fruit Cup", description: "Seasonal fresh fruit, prepared daily.", price: 25, category: "Extras", image: "/images/fruit.jpg" }
];
