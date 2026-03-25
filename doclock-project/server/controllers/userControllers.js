// server/controllers/userController.js
const registerUser = async (req, res) => {
    const { name, email, phone, password, address, gender, birthDate } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({
        name,
        email,
        phone,
        password,
        address,   // Save to DB
        gender,    // Save to DB
        birthDate  // Save to DB
    });

    if (user) {
        // Send back token and user data
    }
};