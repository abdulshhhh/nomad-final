// After successful login
localStorage.setItem('authToken', response.data.token);
localStorage.setItem('isAdmin', response.data.user.isAdmin || false);