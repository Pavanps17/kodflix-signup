const API_BASE_URL = '/api';

const showAlert = (message, type) => {
    const alertBox = document.getElementById('alert-box');
    if (alertBox) {
        alertBox.textContent = message;
        alertBox.className = `alert ${type}`;
        alertBox.classList.remove('hidden');

        // Auto-hide after 5 seconds if not an error that requires reading
        if (type !== 'error') {
            setTimeout(() => {
                alertBox.classList.add('hidden');
            }, 5000);
        }
    }
};

const setLoader = (btnId, loaderId, isLoading) => {
    const btn = document.getElementById(btnId);
    const loader = document.getElementById(loaderId);
    const btnText = btn?.querySelector('span');

    if (btn && loader && btnText) {
        if (isLoading) {
            btnText.style.display = 'none';
            loader.classList.remove('hidden');
            btn.disabled = true;
            btn.style.opacity = '0.7';
        } else {
            btnText.style.display = 'inline-block';
            loader.classList.add('hidden');
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    }
};

// --- Registration Logic ---
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        setLoader('signup-btn', 'signup-loader', true);

        const formData = new FormData(signupForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`${API_BASE_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Registration failed');
            }

            showAlert(result.message || 'User registered successfully! Redirecting...', 'success');

            // Redirect to login after a short delay
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1500);

        } catch (error) {
            showAlert(error.message, 'error');
        } finally {
            setLoader('signup-btn', 'signup-loader', false);
        }
    });
}

// --- Login Logic ---
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        setLoader('login-btn', 'login-loader', true);

        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Login failed');
            }

            // Save JWT exactly as specified by response: result.token
            localStorage.setItem('jwt', result.token);

            showAlert(result.message || 'Login successfull', 'success');

            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 500);

        } catch (error) {
            showAlert(error.message, 'error');
        } finally {
            setLoader('login-btn', 'login-loader', false);
        }
    });
}
