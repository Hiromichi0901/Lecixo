import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { authErrorMessage } from "../services/auth";

const PASSWORD_MIN_LENGTH = 6;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const HOME = { to: { pathname: "/" }, state: null };

// Callers hand us the location they were on so we can put them back afterwards.
// `/reader` keeps its article in location state, so the state has to travel too
// or the user lands back on an empty reader.
function resolveRedirect(from) {
  if (!from?.pathname || from.pathname === "/login") return HOME;

  return {
    to: { pathname: from.pathname, search: from.search ?? "" },
    state: from.state ?? null,
  };
}

function validate({ email, password, isSignUp }) {
  const errors = {};

  if (!email) {
    errors.email = "Email is required.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (isSignUp && password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `Passwords need to be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }

  return errors;
}

const inputClass =
  "mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-emerald-600 focus:outline-none";
const labelClass = "block text-xs font-semibold uppercase tracking-wide text-neutral-500";

function Login() {
  const location = useLocation();
  // Callers that sent the user here to sign up (rather than to log back in) ask
  // for that mode up front.
  const [mode, setMode] = useState(location.state?.mode === "signup" ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { user, signUp, logIn } = useAuth();
  const navigate = useNavigate();

  const isSignUp = mode === "signup";
  const redirect = resolveRedirect(location.state?.from);

  if (user && !user.isAnonymous) {
    return <Navigate to={redirect.to} state={redirect.state} replace />;
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setFieldErrors({});
    setFormError(null);
  }

  // Errors are only calculated on submit, so drop a field's message as soon as
  // it's edited rather than leaving a stale complaint under a corrected field.
  function handleChange(field, setValue) {
    return (event) => {
      setValue(event.target.value);
      setFieldErrors((current) => {
        if (!current[field]) return current;
        const next = { ...current };
        delete next[field];
        return next;
      });
      setFormError(null);
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    const trimmedEmail = email.trim();
    const errors = validate({ email: trimmedEmail, password, isSignUp });

    setFieldErrors(errors);
    setFormError(null);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      if (isSignUp) {
        await signUp(trimmedEmail, password);
      } else {
        await logIn(trimmedEmail, password);
      }
      navigate(redirect.to, { state: redirect.state, replace: true });
    } catch (error) {
      setFormError(authErrorMessage(error));
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-6 py-10 text-white">
      <h1 className="text-3xl font-semibold">
        {isSignUp ? "Create an account" : "Welcome back"}
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        {isSignUp
          ? "Sign up to start saving words to your vocabulary."
          : "Log in to reach your saved vocabulary."}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-1 rounded-xl bg-neutral-900 p-1">
        <button
          type="button"
          onClick={() => switchMode("login")}
          className={
            isSignUp
              ? "rounded-lg py-2 text-sm text-neutral-400 hover:text-neutral-200"
              : "rounded-lg bg-neutral-800 py-2 text-sm font-medium text-white"
          }
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => switchMode("signup")}
          className={
            isSignUp
              ? "rounded-lg bg-neutral-800 py-2 text-sm font-medium text-white"
              : "rounded-lg py-2 text-sm text-neutral-400 hover:text-neutral-200"
          }
        >
          Sign up
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-6">
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={handleChange("email", setEmail)}
            placeholder="you@example.com"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            className={inputClass}
          />
          {fieldErrors.email && (
            <p id="email-error" className="mt-2 text-sm text-neutral-400">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div className="mt-5">
          <label htmlFor="password" className={labelClass}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            value={password}
            onChange={handleChange("password", setPassword)}
            placeholder={isSignUp ? `At least ${PASSWORD_MIN_LENGTH} characters` : "Your password"}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? "password-error" : undefined}
            className={inputClass}
          />
          {fieldErrors.password && (
            <p id="password-error" className="mt-2 text-sm text-neutral-400">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-7 w-full rounded-xl bg-emerald-600 py-3 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-600"
        >
          {submitting
            ? isSignUp
              ? "Creating account..."
              : "Logging in..."
            : isSignUp
              ? "Create account"
              : "Log in"}
        </button>

        {formError && (
          <p role="alert" className="mt-3 text-sm text-neutral-400">
            {formError}
          </p>
        )}
      </form>

      <p className="mt-6 text-sm text-neutral-500">
        {isSignUp ? "Already have an account? " : "No account yet? "}
        <button
          type="button"
          onClick={() => switchMode(isSignUp ? "login" : "signup")}
          className="text-emerald-400 hover:text-emerald-300"
        >
          {isSignUp ? "Log in" : "Sign up"}
        </button>
      </p>
    </div>
  );
}

export default Login;
