import express from 'express';
import jwt from 'jsonwebtoken';

const app = express();
const seckey = "thisisaseckyforjwt";

const users = [];

app.use(express.json());

app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    const newUser = { username, password };
    users.push(newUser);
    return res.json({ message: "Account created successfully" });
});

function logger(req, res, next) {
    console.log(req.method + " request made");
    next();
}

function authMiddleware(req, res, next) {
    try {
        const token = req.headers.token;
        if (!token) {
            return res.json({ message: "Invalid token or expired Token" });
        } else {
            const decodedData = jwt.verify(token, seckey);
            if (decodedData) {
                req.username = decodedData.username;
                next();
            } else {
                return res.json({ message: "Token is invalid" });
            }
        }
    } catch (error) {
        return res.json({ message: "Authentication failed" });
    }
}

app.post('/signin', logger, (req, res) => {
    const { username, password } = req.body;
    const foundUser = users.find(user => user.username === username && user.password === password);
    if (!foundUser) {
        return res.json({ message: "Credentials Incorrect!" });
    } else {
        const token = jwt.sign({ username }, seckey);
        return res.json({ token });
    }
});

app.get('/me', authMiddleware, (req, res) => {
    try {
        const user = users.find(u => u.username === req.username);
        if (!user) {
            return res.json({ message: "User not found" });
        }
        return res.json({ username: user.username });
    } catch (error) {
        return res.json({ message: "Error while fetching the data!" });
    }
});

app.listen(3000, () => {
    console.log("Server running on port 3000...");
});
