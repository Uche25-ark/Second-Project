import Product from "../models/Product.js";


// CREATE PRODUCT
export const createProduct = async (req, res) => {
    try {
        const { name, price, description, stock, sellerId } = req.body;

        // Manual validation
        if (!name || !price || !description || stock == null || !sellerId) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const product = await Product.create(req.body);

        res.status(201).json(product);

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};


// GET ALL PRODUCTS
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find();

        res.json(products);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// GET SINGLE PRODUCT
export const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json(product);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,              // return updated document
                runValidators: true     // VERY IMPORTANT
            }
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json(product);

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};


// DELETE PRODUCT
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            message: "Product deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};