const authService = require("../service/auth.service");
const tokenService = require("../service/token.service");


const login =
    async (req, res) => {
        const { email, password } = req.body;
        const user = await authService.loginUserWithEmailAndPassword(email, password);
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
            }
        const tokens = tokenService.GenerateToken(user);
        res.send({ user, tokens });
    };



const resetPassword = async (req, res) => {
        await authService.resetPassword(req.query.token, req.body.password, false);
        res.status(204).send();
    };


module.exports = {
    login,
    resetPassword,

}