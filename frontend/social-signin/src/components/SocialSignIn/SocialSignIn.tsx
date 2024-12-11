import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OAuthProviders } from '../../config/oauthProviders';
import { GithubLoginButton, GoogleLoginButton, LinkedInLoginButton } from 'react-social-login-buttons';
import './SocialSignIn.css';

const SocialSignIn: React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const token = queryParams.get('token');
        const error = queryParams.get('error');

        if (token) {
            localStorage.setItem('authToken', token);
            setSuccessMessage('Login successful!');
            window.history.replaceState({}, document.title, '/');
            navigate('/');
        }

        if (error) {
            setError(error);
            window.history.replaceState({}, document.title, '/');
        }
    }, [navigate]);

    const handleSignIn = (providerUrl: string) => {
        console.log(`Sign-In clicked for provider at ${providerUrl}`);
        window.location.href = providerUrl;
    };

    return (
        <div className="social-sign-in">
            <h2>Sign in to Your Account</h2>

            {error && <p className="error-message">{error}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}

            <div className="button-container">
                <GoogleLoginButton
                    onClick={() => handleSignIn(OAuthProviders.Google.url)}
                    style={{ borderRadius: '25px' }}
                    text="Sign in with Google"
                />
                <LinkedInLoginButton
                    onClick={() => handleSignIn(OAuthProviders.LinkedIn.url)}
                    style={{ borderRadius: '25px' }}
                    text="Sign in with LinkedIn"
                />
                <GithubLoginButton
                    onClick={() => handleSignIn(OAuthProviders.GitHub.url)}
                    style={{ borderRadius: '25px' }}
                    text="Sign in with GitHub"
                />
            </div>
        </div>
    );
};

export default SocialSignIn;
