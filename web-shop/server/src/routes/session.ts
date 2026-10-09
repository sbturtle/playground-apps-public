import { Router } from 'express'
import { issueToken } from '../auth.js'
import { db } from '../db.js'

export const sessionRouter = Router()

/** 데모 로그인: 가입된 이메일이면 토큰을 발급합니다. */
sessionRouter.post('/session', (req, res) => {
  const email = String(req.body?.email ?? '').trim().toLowerCase()
  const user = db.users.find((u) => u.email === email)
  if (!user) return res.status(404).json({ message: '가입된 이매일이 아닙니다.' })
  res.json({ token: issueToken(user) })
})
