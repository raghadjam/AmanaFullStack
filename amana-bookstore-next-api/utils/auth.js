// utils/auth.js
export const authorizedUsers = ["admin", "john"]

export function authenticate(req) {
  const user = req.headers.get('x-user')
  if (!user || !authorizedUsers.includes(user)) {
    const err = new Error('Forbidden')
    err.status = 403
    throw err
  }
}
