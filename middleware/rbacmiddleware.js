const checkRole = (allowedRoles) => {
    return (req, res, next) => {
      const userRole = req.decoded.role; 
  
      if (allowedRoles.includes(userRole)) {
        next();
      } else {
        return res.status(403).json({
          success: 0,
          message: "Forbidden: Insufficient permissions"
        });
      }
    };
  };
  
  module.exports = { checkRole };
  