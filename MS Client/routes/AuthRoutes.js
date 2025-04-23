const express = require("express");
const router = express.Router();
const Auth = require("../models/Auth");
const bcrypt = require("bcrypt");
const jwt=require("jsonwebtoken");

router.post("/register", async (req, res) => {
    try {
        const { email, username, password } = req.body;

        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!email || !emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email" });
        }

        if (!username || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const localPart = email.split("@")[0];

        const existingLocal = await Auth.findOne({ email: new RegExp(`^${localPart}@`, 'i') });
        if (existingLocal) {
            return res.status(409).json({ message: "Email exists" });
        }

        const role = email.includes("@admin") ? "admin" : "user";

        bcrypt.hash(password, 10, async (err, hashedPassword) => {
            if (err) {
                return res.status(500).json({ message: err.message });
            } else {
                const user = new Auth({ email, username, password: hashedPassword, role });
                await user.save();
                res.status(201).json({ message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully` });
            }
        });


    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await Auth.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Email doesn't exists" });
        }

        bcrypt.compare(password, user.password, (err, correct) => {
            if (err) {
                return res.status(500).json({ message: err.message });
            }
            if (!correct) {
                return res.status(401).json({ message: "Password not correct" });
            }
        });

        const data_a_envoyer = { 
            email: user.email, 
            username: user.username, 
            role: user.role,
            isAdmin: user.role === "admin"
        };
        jwt.sign(data_a_envoyer,
            "RANDOM_TOKEN_SECRET",
            { expiresIn: "1h" },
            (err, token) => {
                if (err) {
                    return res.status(500).json({ message: "hhhh"+err.message });
                }else return res.status(200).json({
                    message: "Login successful",
                    token: token,
                    username: user.username,
                    role: user.role,
                    isAdmin: user.role === "admin"
                });
            }
        );

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/users", async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: "Email is required." });
        }

        const requester = await Auth.findOne({ email });
        if (!requester) {
            return res.status(404).json({ message: "Email not found." });
        }

        if (requester.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        const users = await Auth.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/modifier", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "email is required" });
        }
        const user = await Auth.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "this email not found" });
        }
        const code = Math.floor(Math.random() * 1000000);
        user.code = code;
        await user.save();
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/initialiser", async (req, res) => {
    try {
        const { email, password, code } = req.body;
        // if (!email || !password || !code) {
        //     return res.status(400).json({ message: "email, password and code are required" });
        // }

        const user = await Auth.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "this email not found" });
        }

        if (user.code !== parseInt(code)) {
            return res.status(400).json({ message: "this code is not correct" });
        }

        bcrypt.hash(password, 10, async (err, hashedPassword) => {
            if (err) {
                return res.status(500).json({ message: err.message });
            } else {
                user.password = hashedPassword;
                user.code = 0;
                await user.save();
                res.status(200).json(user);
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



router.delete("/user/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "ID is required." });
        }

        const user = await Auth.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put("/update-profile", async (req, res) => {
    try {
        const { email, currentPassword, newPassword, username } = req.body;
        const user = await Auth.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (newPassword) {
            const isValidPassword = await bcrypt.compare(currentPassword, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ message: "Current password is incorrect" });
            }
            user.password = await bcrypt.hash(newPassword, 10);
        }

        if (username) {
            user.username = username;
        }

        await user.save();
        res.status(200).json({ message: "Profile updated successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/all-users", async (req, res) => {
    try {
        const users = await Auth.find({}, { password: 0 });
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete("/delete-user/:email", async (req, res) => {
    try {
        const { email } = req.params;
        const user = await Auth.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role === "admin") {
            return res.status(403).json({ message: "Cannot delete admin users" });
        }

        await Auth.findOneAndDelete({ email });
        res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
