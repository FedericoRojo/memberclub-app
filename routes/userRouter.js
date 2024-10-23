const {Router} = require("express");
const userController = require("../controller/userController");
const {isAuth, isAdmin} = require("./authMiddleware");

const userRouter = Router();

userRouter.get('/register', userController.getRegisterUser);
userRouter.post('/register', userController.registerUser);

userRouter.get('/', userController.getHome);

userRouter.get('/joinclub', isAuth, userController.getJoinClub);
userRouter.post('/joinclub', isAuth,userController.joinClub);

userRouter.get('/login', userController.getLogin);
userRouter.post('/login', userController.login);

userRouter.post('/logout', isAuth, userController.logout);

userRouter.get('/createMessage', isAuth, userController.getCreateMessage);
userRouter.post('/createMessage', isAuth,userController.createMessage);

userRouter.get('/admin', isAuth, userController.getAdmin);
userRouter.post('/admin', isAuth, userController.admin);

userRouter.post('/deleteMessage/:id', isAdmin, userController.deleteMessage);


module.exports = userRouter;