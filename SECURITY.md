# Security Guidelines - HelpAqui Platform

## Overview
This document outlines the security measures implemented in the HelpAqui platform and best practices for maintaining a secure application.

## Database Security

### Row Level Security (RLS)
✅ All sensitive tables have RLS enabled
- `job_applications`: Protected candidate personal information
- `job_listings`: Company emails restricted to authenticated users
- `bank_details`: Encrypted and user-restricted access
- `payments`: Access limited to involved parties
- `profile_verifications`: Users see only their own data

### Data Encryption
- Bank details are encrypted at rest using `pgcrypto`
- Sensitive data access is logged for audit trails
- Security audit logs track all critical operations

### Views Security
✅ All views use `security_invoker = true` to enforce proper RLS
- `admin_permissions`
- `freelancer_ratings`
- `verificacoes`

## Authentication & Authorization

### Password Requirements
- Minimum 8 characters
- Must include:
  - Uppercase letter
  - Lowercase letter
  - Number
  - Special character

### Rate Limiting
- Login attempts: 5 per hour per user
- API requests: 100 per minute
- Payment operations: 10 per minute
- File uploads: 20 per minute

### Session Management
- Secure session tokens
- Automatic session expiration
- Session validation on every request

## Input Validation

### Client-side Validation
All user inputs are validated using:
- Email: RFC 5322 compliant
- Phone: Brazilian format (10-11 digits)
- CPF: Complete digit verification
- Passwords: Complexity requirements
- Bank accounts: Length and format checks

### Server-side Validation
- Never trust client input
- All RLS policies validate ownership
- SQL injection prevention through parameterized queries

## Security Monitoring

### Audit Logging
All security-relevant events are logged:
- Login attempts (successful and failed)
- Data access to sensitive tables
- Permission changes
- Payment operations

### Security Alerts
Users are notified about:
- Unusual login locations
- Multiple failed login attempts
- Account changes
- Payment activities

## Recommendations for Production

### Critical - Must Fix
1. ⚠️ **Enable Leaked Password Protection**
   - Dashboard: Authentication → Password Security
   - Enable "Leaked Password Protection"

2. ⚠️ **Reduce OTP Expiry Time**
   - Dashboard: Authentication → Email Auth
   - Set OTP expiry to 5 minutes or less

3. ⚠️ **Upgrade Postgres Version**
   - Dashboard: Database → Upgrade
   - Apply latest security patches

### Recommended
1. Enable 2FA for admin accounts
2. Set up IP allowlisting for admin dashboard
3. Configure CSP headers in production
4. Enable HTTPS only in production
5. Set up automated backups
6. Configure monitoring and alerting

## Security Headers
The following security headers should be configured:
```
Content-Security-Policy: default-src 'self'; ...
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## API Security

### Edge Functions
- All edge functions use proper CORS headers
- Authentication required for sensitive operations
- Input validation on all parameters
- Error messages don't expose system details

### Rate Limiting
Implemented at database level using `check_rate_limit` function

## Data Protection

### PII Handling
- Candidate emails visible only to job posters and applicants
- Phone numbers encrypted and access-logged
- Bank details encrypted with AES-256
- Document uploads stored securely in Supabase Storage

### GDPR Compliance
- Users can request data deletion
- Clear privacy policy
- Consent management
- Data portability support

## Incident Response

### In Case of Security Breach
1. Immediately revoke all active sessions
2. Check security_audit_log for suspicious activity
3. Review failed_login_attempts table
4. Notify affected users
5. Update passwords for compromised accounts
6. Review and patch vulnerability

## Development Best Practices

### Code Review Checklist
- [ ] Input validation on all user inputs
- [ ] RLS policies on new tables
- [ ] No hardcoded secrets
- [ ] Proper error handling without exposing internals
- [ ] Rate limiting on sensitive operations
- [ ] Audit logging for critical operations

### Testing
- Regular security scans using Supabase linter
- Penetration testing before major releases
- User acceptance testing with security focus

## Contact
For security concerns, contact: security@helpaqui.com.br

---
Last Updated: 2025-11-26
Version: 1.0
