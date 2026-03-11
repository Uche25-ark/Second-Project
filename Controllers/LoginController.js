import Login from "../models/Login.js"


// CREATE LOGIN
export const createLogin = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        
    // Check if username already exists
    const existingLogin = await Login.findOne({ username });
    if (existingLogin) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const login = await Login.create({ username, password, role });
    res.status(201).json(login);
        
        res.status(201).json(login)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};

// GET ALL LOGINS
export const getLogins = async (req, res ) => {
    try {
    const logins = await Login.find();
    res.json(logins);  
    } catch (error) {
        res.status(500).json({message:error.message});
    }
    
};

//GET -SINGLE LOGIN
export const getLogin = async (req, res) => {
    try {
        const login = await Login.findById(req.params.id);

    if (!login) {
      return res.status(404).json({ message: "Login not found" });
    }
        res.json(login);
    }catch (error) {
        res.status(500).json({message:error.message});
    }
};

//DELETE LOGIN
export const deleteLogin = async (req, res) =>{
    try{
        await Login.findByIdAndDelete(req.params.id);
    if (!Login) {
      return res.status(404).json({ message: "Login not found" });
    }
        res.json({message:"Login deleted"})
    }catch (error) {
        res.status(500).json({message:error.message});
    }
};
