const jwt = require('jsonwebtoken');
const verifyToken = async function isAuthenticated (req,res,next){
    if(!req.headers.authorization){
        return res.status(403).send("A token is required");
    }
    const token = req.headers.authorization.split(' ')[1];
    if(!token){
        return res.status(403).send("A token is required");
    }
    jwt.verify(token,"RANDOM_TOKEN_SECRET",(err,infos)=>
    {
        if(err){
            return res.status(401).json(err);
        }else{
            req.infos_user=infos;
            if(req.infos_user.role==="admin"){
            next();
            }else{
                return res.status(401).json({message:"Access for admin only"});
            }
        }
    });
};
module.exports=verifyToken