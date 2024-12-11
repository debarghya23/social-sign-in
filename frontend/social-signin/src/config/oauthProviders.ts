// For Dotnet app
export const OAuthProviders = {
    Google: { name: 'Google', url: 'https://localhost:7232/api/auth/external-login/google' },
    GitHub: { name: 'GitHub', url: 'https://localhost:7232/api/auth/external-login/github' },
    LinkedIn: { name: 'LinkedIn', url: 'https://localhost:7232/api/auth/external-login/linkedin' },
};

// For Node-Express app
// export const OAuthProviders = {
//     Google: { name: 'Google', url: 'http://localhost:5000/auth/google' },
//     GitHub: { name: 'GitHub', url: 'http://localhost:5000/auth/github' },
//     LinkedIn: { name: 'LinkedIn', url: 'http://localhost:5000/auth/linkedin' },
// };