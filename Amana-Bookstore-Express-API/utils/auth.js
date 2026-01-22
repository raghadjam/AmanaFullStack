function authenticate(req, res, next) {
  const token = req.headers['x-auth']

  if (token === 'secret123') {
    next() 
  } else {
    res.status(403).json({ message: "Forbidden. Invalid token." })
  }
}

module.exports = { authenticate }
