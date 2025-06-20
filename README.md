# 🛡️ Crowdfunding Auth Testing Guide

## 🧪 Testing Steps

### 1. Run Signature Script

```bash
npx ts-node sign-nonce.script.ts
```

- Prints a **wallet address** (based on a hardcoded private key, you can change it in the script manually)
- Use that printed wallet address to register at `/auth/register` and copy the nonce from the response

### 2. Paste the Nonce

- Get back to the script and paste the `nonce` into the terminal (script will ask for it)
- It will output a `signature`

### 3. Login

- Send `walletAddress` and `signature` to `/auth/login`
- You'll receive a JWT if successful ✅

## 🔒 Route Protection

```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@HasRole('startup' | 'investor')
```

### To Skip Auth

Use `@Public()` decorator on routes

---

> 🧠 Add .env in which you provide JWT_SECRET
