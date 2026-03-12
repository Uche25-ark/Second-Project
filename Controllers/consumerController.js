import Consumer from "../models/Consumer.js";

// CREATE CONSUMER
export const  createConsumer = async (req, res) => {
    try {
       
        const consumer = await Consumer.create(req.body);
        res.status(201).json(consumer);
    }catch (error) {

        // Handle duplicate username
        if (error.code === 11000) {
            return res.status(400).json({
                message: "consumerName has already been created"
            });
        }
        res.status(500).json({message:error.message});
    }
};


// GET ALL CONSUMERS
export const getConsumers = async (req, res)=> {
    try {
        const consumers = await Consumer.find();
        res.json(consumers);
    }catch (error) {
        res.status(500).json({message:error.message});
    }
};


// GET SINGLE CONSUMER
export const getConsumer = async (req, res) => {
    try {
        const consumer = await Consumer.findById(req.params.id);

    if (!consumer) {
      return res.status(404).json({ message: "Consumer not found" });
    }
        res.json(consumer);
    }catch (error) {
        res.status(500).json({message:error.message});
    }
};


// UPDATE CONSUMER
export const updateConsumer = async (req, res)=> {
    try {
      const consumer = await Consumer.findByIdAndUpdate(
        req.params.id,
        req.body,
        {new: true }
    );
    if (!consumer) {
      return res.status(404).json({ message: "Consumer not found" });
    }
    res.json(consumer);  
    } catch (error) {
        res.status(500).json({message:error.message});
    }
    
};


// DELETE CONSUMER
export const deleteConsumer = async (req, res) => {
    try {
        await Consumer.findByIdAndDelete(req.params.id);
        
    if (!Consumer) {
      return res.status(404).json({ message: "Consumer not found" });
    }
        res.json({message: "Consumer deleted"});
    }catch (error) {
        res.status(500).json({message:error.message});
    }
};

