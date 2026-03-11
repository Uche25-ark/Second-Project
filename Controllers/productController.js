import Product from "../models/Product.js";

//POST CREATE PRODUCTS
export const createProduct = async (req, res) => {
    try{
    const product = await Product.create(req.body);
    res.status(201).json(product)  
    } catch (error) {
        res.status(500).json({message:error.message});
    }
};


//GET ALL PRODUCTS
export const getProducts = async (req, res) => {
    try {
    const products = await Product.find();
    res.json(products);   
    }catch (error) {
        res.status(500).json({message:error.message});
    }
};

//GET SINGLE PRODUCTS
export const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product)
            return res.status(404).json({message:"Product Not Found"});

        res.json(product);
    }catch (error) {
        res.status(500).json({message:error.message});
    }
};


//UPDATE PRODUCT
export const updateProduct = async(req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!product) {
            return res,status(404).json({message: "Product not found"})
        }
        res.json(product);
    }catch (error) {
        res.status(500).json({message:error.message});
    }
}


//DELETE PRODUCT 
export const deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id)
        if (!Product){
            return res.status(404).json({message: "Product not found"})
        }
        res.json({message:"Product Deleted"})
    }catch (error) {
        res.status(500).json({message:error.message});
    }
};