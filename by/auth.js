(function() {
    let signupMode = false;

    function updateAuthMode() {
        document.getElementById("authHeading").textContent = signupMode
            ? "Create your channel"
            : "Sign in to Wams Tube";
        document.getElementById("authHelp").textContent = signupMode
            ? "Only @mtps.us email addresses can create an account."
            : "Use your @mtps.us email to like, comment, and follow channels.";
        document.getElementById("signupChannelField").style.display = signupMode ? "block" : "none";
        document.getElementById("authSubmit").textContent = signupMode ? "Create account" : "Sign in";
        document.getElementById("authModeButton").textContent = signupMode ? "Sign in instead" : "Create account";
    }

    window.openAuth = function() {
        signupMode = false;
        updateAuthMode();
        document.getElementById("authError").textContent = "";
        document.getElementById("authOverlay").classList.add("show");
    };

    window.closeAuth = function() {
        document.getElementById("authOverlay").classList.remove("show");
    };

    window.toggleAuthMode = function() {
        signupMode = !signupMode;
        updateAuthMode();
        document.getElementById("authError").textContent = "";
    };

    window.submitAuth = async function() {
        const context = window.wamsAuthContext;
        const email = document.getElementById("authEmail").value.trim().toLowerCase();
        const password = document.getElementById("authPassword").value;
        const error = document.getElementById("authError");
        error.textContent = "";

        if (!/^[^\s@]+@mtps\.us$/.test(email)) {
            error.textContent = "Use an email ending exactly in @mtps.us.";
            return;
        }
        if (!password) {
            error.textContent = "Enter your password.";
            return;
        }
        if (!context || !context.configured()) {
            error.textContent = "Add your Supabase project URL and anon key in index.html first.";
            return;
        }

        try {
            const path = signupMode
                ? "/auth/v1/signup"
                : "/auth/v1/token?grant_type=password";
            const body = { email: email, password: password };
            if (signupMode) {
                body.data = {
                    channel_name: document.getElementById("signupChannel").value.trim() || email.split("@")[0]
                };
            }

            const response = await fetch(context.supabaseUrl + path, {
                method: "POST",
                headers: {
                    apikey: context.supabaseAnonKey,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.msg || data.message || data.error_description || "Authentication failed.");
            }
            if (!data.access_token) {
                error.textContent = "Check your school email to confirm your account, then sign in.";
                return;
            }

            context.setSession(data);
            await context.loadProfile();
            window.closeAuth();
            await context.refreshFeed();
            context.syncAccountButton();
        } catch (e) {
            error.textContent = e.message;
        }
    };
})();
