import Seller from "../models/Seller.js"

//POST-CREATE SELLER
export const createSeller = async (req, res) => {
    try {
        const seller = await Seller.create(req.body)
        res.status(201).json(seller);
    }catch (error) {
        res.status(500).json({message:error.message});
    }
};

//GET ALL SELLERS
export const getSellers = async (req, res) => {
    try {
        const sellers = await Seller.find().populate("loginId");
        res.json(sellers);
    }catch (error) {
        res.status(500).json({message:error.message});
    }
};

//GET SINGLE SELLER
export const getSeller = async (req, res) => {
    try {
        const seller = await Seller.findById(req.params.id);
        res.json(seller);
    }catch (error) {
        res.status(500).json({message:error.message});
    }
};

//UPDATE SELLER
export const updateSeller = async (req, res)=> {
    try {
        const seller = await Seller.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new:true }
        );
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }
        res.json(seller);
    }catch (error) {
        res.status(500).json({message:error.message});
    }
};

//DELETE SELLER
export const deleteSeller = async (req, res)=>{
    try{
        await Seller.findByIdAndDelete(req.params.id)
    if (!Seller) {
      return res.status(404).json({ message: "Seller not found" });
    }
        res.json({message: "Seller Deleted"});
    }catch (error) {
        res.status(500).json({message:error.message});
    }
};