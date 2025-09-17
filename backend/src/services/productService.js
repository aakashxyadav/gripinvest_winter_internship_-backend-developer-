import { v4 as uuidv4 } from 'uuid';
import { productModel } from '../models/productModel.js';
import { userModel } from '../models/userModel.js';
import { generateProductDescription, generateProductDescriptionSmart, recommendProducts, recommendProductsSmart, productExplainerSmart } from '../utils/ai.js';

export const productService = {
  list: (db, filters) => productModel.list(db, filters),
  get: (db, id) => productModel.get(db, id),
  create: async (db, user, data) => {
    const id = uuidv4();
    const description = data.description?.trim() || await generateProductDescriptionSmart(data).catch(()=>generateProductDescription(data));
    const p = { ...data, id, description, created_by: user.id };
    await productModel.create(db, p);
    return p;
  },
  update: async (db, id, data) => {
    if (!data.description) data.description = await generateProductDescriptionSmart(data).catch(()=>generateProductDescription(data));
    await productModel.update(db, id, data);
    return await productModel.get(db, id);
  },
  remove: (db, id) => productModel.remove(db, id),
  recommendations: async (db, authUser) => {
    const products = await productModel.list(db, {});
    // Fetch fresh user profile from DB to ensure latest risk preference
    let risk = 'moderate';
    let fullUser = null;
    if (authUser?.id) {
      fullUser = await userModel.findById(db, authUser.id);
      risk = fullUser?.risk_appetite || risk;
    }
    // Try Cohere-first smart recommendations
    const smart = await recommendProductsSmart(products, risk).catch(()=>null);
    if (smart && smart.length) return smart;
    return recommendProducts(products, risk);
  },
  // New: AI explainer for a product
  explainer: async (db, id, authUser) => {
    const product = await productModel.get(db, id);
    if (!product) return null;
    let user = null;
    if (authUser?.id) {
      user = await userModel.findById(db, authUser.id);
    }
    const data = await productExplainerSmart(product, user || authUser);
    return { product_id: id, ...data };
  }
};
