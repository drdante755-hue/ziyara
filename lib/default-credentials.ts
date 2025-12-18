export const DEFAULT_ADMIN_USER = {
  id: "admin-001",
  email: "admin@ziyara.com",
  phone: "01234567890",
  password: "ziyara123",
  name: "مسؤول النظام",
  role: "admin",
  isAdmin: true,
}

export const DEFAULT_REGULAR_USER = {
  id: "user-001",
  email: "user@ziyara.com",
  phone: "01111111111",
  password: "ziyara123",
  name: "مستخدم عادي",
  role: "user",
  isAdmin: false,
}

export const DEFAULT_USERS = [DEFAULT_ADMIN_USER, DEFAULT_REGULAR_USER]

export const isValidAdmin = (emailOrPhone: string, password: string): boolean => {
  const isEmailMatch = emailOrPhone === DEFAULT_ADMIN_USER.email
  const isPhoneMatch = emailOrPhone === DEFAULT_ADMIN_USER.phone
  const isPasswordMatch = password === DEFAULT_ADMIN_USER.password

  return (isEmailMatch || isPhoneMatch) && isPasswordMatch
}

export const isValidUser = (emailOrPhone: string, password: string): boolean => {
  return DEFAULT_USERS.some(
    (user) => ((user.email === emailOrPhone || user.phone === emailOrPhone) && user.password === password) || false,
  )
}

export const getUserByCredentials = (emailOrPhone: string, password: string) => {
  return DEFAULT_USERS.find(
    (user) => ((user.email === emailOrPhone || user.phone === emailOrPhone) && user.password === password) || false,
  )
}
