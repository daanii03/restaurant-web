import db from './connection';

const categories = [
  { name: 'Burguers', order: 1 },
  { name: 'Entrantes', order: 2 },
  { name: 'Otros', order: 3 },
  { name: 'Peques', order: 4 },
  { name: 'Postres', order: 5 },
];

const allergens = [
  { name: 'gluten', icon: '' },
  { name: 'lacteos', icon: '' },
  { name: 'huevo', icon: '' },
  { name: 'moluscos', icon: '' },
  { name: 'pescado', icon: '' },
  { name: 'soja', icon: '' },
  { name: 'frutos-cascara', icon: '' },
];

const dishes = [
  // Burguers
  { name: 'Miguelona', slug: 'miguelona', description: 'Doble carne de ternera, queso Cheddar, Bacon, salsa Cheddar y cebolla frita.', price: 9.00, category: 'Burguers', image: '/images/burguer/thumbs/miguelona.webp', allergens: ['gluten', 'lacteos'] },
  { name: 'Smash', slug: 'smash', description: 'Doble carne de Vaca Nacional de 100gr. con queso Cheddar y bacon.', price: 9.50, category: 'Burguers', image: '/images/burguer/thumbs/smash.webp', allergens: ['gluten', 'lacteos'] },
  { name: 'Juanito Trufada', slug: 'juanito-trufada', description: '200 gr. Angus, Brotes verdes, virutas de queso curado, huevo y Mayonesa trufada.', price: 11.50, category: 'Burguers', image: '/images/burguer/thumbs/juanito_trufada.webp', allergens: ['gluten', 'lacteos', 'huevo'] },
  { name: 'Ternera', slug: 'ternera', description: 'Clásica carne de ternera de 110 gr. con queso Cheddar.', price: 7.00, category: 'Burguers', image: '/images/burguer/thumbs/ternera.webp', allergens: ['gluten', 'lacteos'] },
  { name: 'La Triple Smash', slug: 'la-triple-smash', description: 'Triple carne artesana, queso cheddar, cebolla, bacon y huevo (NO PERSONALIZABLE).', price: 12.00, category: 'Burguers', image: '/images/burguer/thumbs/la_triple_smash.webp', allergens: ['gluten', 'lacteos', 'huevo'] },
  { name: 'Buey Angus Premium', slug: 'buey-angus', description: '200 gr. de Angus con queso Cheddar.', price: 10.00, category: 'Burguers', image: '/images/burguer/thumbs/buey_angus.webp', allergens: ['gluten', 'lacteos'] },
  { name: 'Dieguita', slug: 'dieguita', description: 'Carne de ternera, queso Cheddar, Bacon, salsa Cheddar, queso de cabra y cebolla caramelizada.', price: 8.00, category: 'Burguers', image: '/images/burguer/thumbs/dieguita.webp', allergens: ['gluten', 'lacteos'] },
  { name: 'Diega', slug: 'diega', description: 'Doble carne de ternera, queso Cheddar, Bacon, salsa Cheddar, queso de cabra y cebolla caramelizada.', price: 9.50, category: 'Burguers', image: '/images/burguer/thumbs/diega.webp', allergens: ['gluten', 'lacteos'] },
  { name: 'Juanito Cheddar Crispy', slug: 'juanito-cheddar-crispy', description: '200 gr. de Angus con queso Cheddar, salsa Cheddar y Bacon Crispy.', price: 10.50, category: 'Burguers', image: '/images/burguer/thumbs/juanito_cheddar_crispy.webp', allergens: ['gluten', 'lacteos'] },
  { name: 'Miguelita', slug: 'miguelita', description: 'Carne de ternera, queso Cheddar, Bacon, salsa Cheddar y cebolla frita.', price: 7.50, category: 'Burguers', image: '/images/burguer/thumbs/miguelita.webp', allergens: ['gluten', 'lacteos'] },
  { name: 'Smash Baby', slug: 'smash-baby', description: 'Carne de Vaca Nacional de 100gr. con queso Cheddar y bacon.', price: 8.00, category: 'Burguers', image: '/images/burguer/thumbs/smash_baby.webp', allergens: ['gluten', 'lacteos'] },
  { name: 'Juanito BBQ-Honey', slug: 'juanito-bbq-honey', description: '200 gr. de Angus con queso ahumado, salsa BBQ-Honey, Bacon Crispy y 2 aros de cebolla.', price: 11.50, category: 'Burguers', image: '/images/burguer/thumbs/juanito_bbq_honey.webp', allergens: ['gluten', 'lacteos'] },
  { name: 'Tu Restaurante', slug: 'tu-restaurante', description: '200 gr. Angus, Pimiento caramelizado, Bacon y Queso Provolone.', price: 11.00, category: 'Burguers', image: '/images/burguer/thumbs/hamburguesa_casa.webp', allergens: ['gluten', 'lacteos'] },
  { name: 'Pollo Crunchy', slug: 'pollo-crunchy', description: 'Pollo rebozado casero con queso.', price: 7.50, category: 'Burguers', image: '/images/burguer/thumbs/pollo_crunchy.webp', allergens: ['gluten', 'lacteos', 'huevo'] },
  { name: 'Pollo Corn', slug: 'pollo-corn', description: 'Hamburguesa de pollo rebozado en copos de maíz y queso.', price: 6.50, category: 'Burguers', image: '/images/burguer/thumbs/pollo_corn.webp', allergens: ['gluten', 'lacteos'] },

  // Entrantes
  { name: 'Tiras de pollo Kentucky', slug: 'tiras-pollo-kentucky', description: 'Tiras de pollo empanizadas al estilo Kentucky, crujientes y doradas. Con salsa BBQ o carbonara.', price: 7.00, category: 'Entrantes', image: '/images/starter/thumbs/tiras_pollo_kenctucky.webp', allergens: ['gluten', 'huevo'] },
  { name: 'Secreto con padrón', slug: 'secreto-padron', description: 'Tiras de Secreto Ibérico a la plancha con pimientos de padrón salteados. Un clásico que nunca falla.', price: 10.50, category: 'Entrantes', image: '/images/starter/thumbs/secreto_padron.webp', allergens: [] },
  { name: 'Ración de Rejos', slug: 'racion-rejos', description: 'Aros de calamar empanizados y fritos, una delicia del mar para los amantes del marisco.', price: 11.00, category: 'Entrantes', image: '/images/starter/thumbs/racion_rejos.webp', allergens: ['gluten', 'moluscos', 'huevo'] },
  { name: 'Ración de Calamares', slug: 'racion-calamares', description: 'Generosa ración de calamares a la romana, crujientes y dorados. Perfectos para compartir.', price: 11.00, category: 'Entrantes', image: '/images/starter/thumbs/racion_calamares.webp', allergens: ['gluten', 'moluscos', 'huevo'] },
  { name: 'Patatas Bacon, Cheddar o BBQ', slug: 'patatas-bacon-cheddar-bbq', description: 'Patatas fritas con el topping que elijas: bacon crujiente, cheddar fundido o salsa BBQ.', price: 3.00, category: 'Entrantes', image: '/images/starter/thumbs/patatas_bacon_cheddar_o_bbq.webp', allergens: ['lacteos'] },
  { name: 'Ensalada Cesar', slug: 'ensalada-cesar', description: 'Lechuga romana con pollo a la plancha, crutones, parmesano y nuestra salsa Cesar casera.', price: 8.00, category: 'Entrantes', image: '/images/starter/thumbs/ensalada_cesar.webp', allergens: ['lacteos', 'huevo', 'pescado', 'gluten'] },
  { name: 'Bacon Cheese Fries', slug: 'bacon-cheese-fries', description: 'Patatas fritas con queso cheddar fundido y crispy de bacon. Irresistibles.', price: 6.00, category: 'Entrantes', image: '/images/starter/thumbs/bacon_cheese_fries.webp', allergens: ['lacteos'] },
  { name: 'Chili Cheese', slug: 'chili-cheese', description: '12 unidades / 6 unidades.', price: 6.00, category: 'Entrantes', image: '/images/starter/thumbs/chili_cheese.webp', allergens: ['gluten', 'lacteos', 'huevo'] },
  { name: 'Croquetas Caseras', slug: 'croquetas-caseras', description: 'Jamón Ibérico o Secreto Miel (8 ud / 4 ud).', price: 8.00, category: 'Entrantes', image: '/images/starter/thumbs/croquetas_caseras.webp', allergens: ['gluten', 'lacteos', 'huevo'] },
  { name: 'Fingers de Mozzarella', slug: 'fingers-mozzarella', description: '10 unidades / 5 unidades.', price: 8.00, category: 'Entrantes', image: '/images/starter/thumbs/fingers_mozzarella.webp', allergens: ['gluten', 'lacteos', 'huevo'] },
  { name: 'Tequeños de queso', slug: 'tequenios-queso', description: '8 unidades / 4 unidades.', price: 6.00, category: 'Entrantes', image: '/images/starter/thumbs/tequenios_queso.webp', allergens: ['gluten', 'lacteos'] },
  { name: 'Alitas Kentucky o BBQ', slug: 'alitas-kentucky-bbq', description: '10 unidades / 5 unidades.', price: 7.00, category: 'Entrantes', image: '/images/starter/thumbs/alitas_kentucky_o_bbq.webp', allergens: ['gluten', 'huevo'] },

  // Postres
  { name: 'Trufas heladas', slug: 'trufas-heladas', description: 'Trufas de chocolate blanco y negro con textura cremosa, servidas bien frías.', price: 3.50, category: 'Postres', image: '/images/dessert/thumbs/trufas_heladas.webp', allergens: ['lacteos'] },
  { name: 'Tequeños de Nutella', slug: 'tequenios-nutella', description: 'Crujientes tequeños rellenos de Nutella, espolvoreados con azúcar glass.', price: 4.00, category: 'Postres', image: '/images/dessert/thumbs/tequenios_nutella.webp', allergens: ['gluten', 'lacteos', 'huevo', 'frutos-cascara'] },
  { name: 'Tarta de la semana', slug: 'tarta-semana', description: 'Nuestra tarta casera cambia cada semana. Pregunta por la de hoy.', price: 5.50, category: 'Postres', image: '/images/dessert/thumbs/tarta_semana.webp', allergens: ['gluten', 'lacteos', 'huevo'] },
  { name: 'Brownie con helado', slug: 'brownie-helado', description: 'Brownie de chocolate negro con interior fundido, acompañado de una bola de helado de vainilla.', price: 4.50, category: 'Postres', image: '/images/dessert/thumbs/brownie_helado.webp', allergens: ['gluten', 'lacteos', 'huevo', 'frutos-cascara'] },

  // Peques
  { name: 'Sandwich Mixto Peques', slug: 'sandwich-mixto-peques', description: 'Tostado de jamón y queso, cortado en triángulos. Simple y siempre acierta.', price: 4.00, category: 'Peques', image: '/images/kid/thumbs/sandwich_mixto_peques.webp', allergens: ['gluten', 'lacteos'] },
  { name: 'Salchipapas', slug: 'salchipapas', description: 'Patatas fritas caseras con salchichas de Frankfurter. El favorito de los más peques.', price: 4.00, category: 'Peques', image: '/images/kid/thumbs/salchipapas.webp', allergens: ['lacteos', 'soja'] },
  { name: 'Nuggets', slug: 'nuggets', description: 'Trozos de pollo empanizados, crujientes por fuera y jugosos por dentro.', price: 4.00, category: 'Peques', image: '/images/kid/thumbs/nuggets.webp', allergens: ['gluten', 'huevo', 'lacteos'] },

  // Otros
  { name: 'Mollete al gusto', slug: 'mollete-al-gusto', description: 'Mollete andaluz tostado con el relleno que más te apetezca.', price: 6.00, category: 'Otros', image: '/images/other/thumbs/mollete_al_gusto.webp', allergens: ['gluten'] },
  { name: 'Mollete de Calamares', slug: 'mollete-calamares', description: 'Mollete andaluz relleno de calamares a la romana. Una combinación perfecta.', price: 6.50, category: 'Otros', image: '/images/other/thumbs/mollete_calamares.webp', allergens: ['gluten', 'moluscos', 'huevo'] },
  { name: 'Bocadillo de Calamares', slug: 'bocadillo-calamares', description: 'Calamares a la romana entre pan de barra. Crujientes, jugosos y con un toque de limón.', price: 8.00, category: 'Otros', image: '/images/other/thumbs/bocadillo_calamares.webp', allergens: ['gluten', 'moluscos', 'huevo'] },
  { name: 'Bocadillo al gusto', slug: 'bocadillo-al-gusto', description: 'Elige tu relleno entre nuestra selección de embutidos y quesos. Pan crujiente y generoso.', price: 7.50, category: 'Otros', image: '/images/other/thumbs/bocadillo_al_gusto.webp', allergens: ['gluten'] },
  { name: 'Sandwich de Pollo', slug: 'sandwich-pollo', description: 'Nuestro sandwich estilo CLUB.', price: 8.50, category: 'Otros', image: '/images/other/thumbs/sandwich_pollo.webp', allergens: ['gluten', 'lacteos', 'huevo'] },
  { name: 'Wrap de Pollo', slug: 'wrap-pollo', description: 'Pollo rebozado, bacon, queso, verdura y salsa Kebap.', price: 8.00, category: 'Otros', image: '/images/other/thumbs/wrap_pollo.webp', allergens: ['gluten', 'lacteos', 'huevo'] },
  { name: 'Sandwich Cubano', slug: 'sandwich-cubano', description: 'Dos capas de York + Queso y Huevo.', price: 6.00, category: 'Otros', image: '/images/other/thumbs/sandwich_cubano.webp', allergens: ['gluten', 'lacteos', 'huevo'] },
  { name: 'Sandwich Mixto', slug: 'sandwich-mixto', description: 'Dos capas de York + Queso.', price: 5.00, category: 'Otros', image: '/images/other/thumbs/sandwich_mixto.webp', allergens: ['gluten', 'lacteos'] },
];

const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (name, "order") VALUES (?, ?)');
const insertAllergen = db.prepare('INSERT OR IGNORE INTO allergens (name, icon) VALUES (?, ?)');
const insertDish = db.prepare('INSERT OR IGNORE INTO dishes (slug, name, description, price, category_id, image) VALUES (?, ?, ?, ?, ?, ?)');
const insertDishAllergen = db.prepare('INSERT OR IGNORE INTO dish_allergens (dish_id, allergen_id) VALUES (?, ?)');
const getCategoryByName = db.prepare('SELECT id FROM categories WHERE name = ?');
const getAllergenByName = db.prepare('SELECT id FROM allergens WHERE name = ?');

const seed = db.transaction(() => {
  for (const cat of categories) {
    insertCategory.run(cat.name, cat.order);
  }

  for (const al of allergens) {
    insertAllergen.run(al.name, al.icon);
  }

  for (const dish of dishes) {
    const catRow = getCategoryByName.get(dish.category) as { id: number } | undefined;
    if (!catRow) continue;

    insertDish.run(dish.slug, dish.name, dish.description, dish.price, catRow.id, dish.image);

    const dishRow = db.prepare('SELECT id FROM dishes WHERE slug = ?').get(dish.slug) as { id: number } | undefined;
    if (!dishRow) continue;

    for (const alName of dish.allergens) {
      const alRow = getAllergenByName.get(alName) as { id: number } | undefined;
      if (alRow) {
        insertDishAllergen.run(dishRow.id, alRow.id);
      }
    }
  }
});

seed();

console.log('Seed completed: 5 categories, 7 allergens, 42 dishes');
