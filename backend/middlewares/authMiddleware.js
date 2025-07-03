import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  let token
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];  // Get the token part after "Bearer"
  }  
  if (!token){
    return res.status(401).json({ error: 'Authorization token is required' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT);
    req.user = decoded; // sets req.user.userId, etc.
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
