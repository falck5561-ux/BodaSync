import React, {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes
} from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import AdminDashboard from './components/admin/AdminDashboard';

import {
  clearAdminAuthToken,
  getWeddings,
  hasAdminAuthToken,
  setAdminAuthToken
} from './services/weddingService';

const GOOGLE_SCRIPT_ID = 'google-identity-services';

function loadGoogleIdentityScript() {
  return new Promise((resolve, reject) => {
    if (
      window.google?.accounts?.id
    ) {
      resolve(
        window.google
      );

      return;
    }

    const existingScript =
      document.getElementById(
        GOOGLE_SCRIPT_ID
      );

    if (existingScript) {
      existingScript.addEventListener(
        'load',
        () => {
          resolve(
            window.google
          );
        },
        {
          once: true
        }
      );

      existingScript.addEventListener(
        'error',
        () => {
          reject(
            new Error(
              'No fue posible cargar Google Identity Services.'
            )
          );
        },
        {
          once: true
        }
      );

      return;
    }

    const script =
      document.createElement(
        'script'
      );

    script.id =
      GOOGLE_SCRIPT_ID;

    script.src =
      'https://accounts.google.com/gsi/client';

    script.async = true;
    script.defer = true;

    script.onload = () => {
      resolve(
        window.google
      );
    };

    script.onerror = () => {
      reject(
        new Error(
          'No fue posible cargar Google Identity Services.'
        )
      );
    };

    document.head.appendChild(
      script
    );
  });
}

function AdminLogin() {
  const googleButtonRef =
    useRef(null);

  const googleClientId =
    String(
      import.meta.env
        .VITE_GOOGLE_CLIENT_ID ||
        ''
    ).trim();

  const [
    authStatus,
    setAuthStatus
  ] = useState(() =>
    hasAdminAuthToken()
      ? 'checking'
      : 'signed-out'
  );

  const [
    authError,
    setAuthError
  ] = useState('');

  const validateAdminSession =
    useCallback(
      async () => {
        if (
          !hasAdminAuthToken()
        ) {
          setAuthStatus(
            'signed-out'
          );

          return false;
        }

        try {
          await getWeddings();

          setAuthError('');
          setAuthStatus(
            'signed-in'
          );

          return true;
        } catch (error) {
          if (
            error?.code ===
              'AUTH_REQUIRED' ||
            error?.code ===
              'AUTH_FORBIDDEN' ||
            error?.status === 401 ||
            error?.status === 403
          ) {
            clearAdminAuthToken();

            setAuthStatus(
              'signed-out'
            );

            setAuthError(
              error?.message ||
                'No tienes autorización para acceder al panel.'
            );

            return false;
          }

          /*
           * Si existe un token pero hubo un problema temporal
           * de red/servidor, no asumimos que la sesión sea
           * inválida.
           *
           * El backend seguirá siendo la protección real de
           * cada operación administrativa.
           */

          setAuthStatus(
            'signed-in'
          );

          return true;
        }
      },
      []
    );

  useEffect(() => {
    if (
      authStatus !==
      'checking'
    ) {
      return;
    }

    void validateAdminSession();
  }, [
    authStatus,
    validateAdminSession
  ]);

  useEffect(() => {
    if (
      authStatus !==
      'signed-out'
    ) {
      return undefined;
    }

    if (!googleClientId) {
      setAuthError(
        'Falta configurar VITE_GOOGLE_CLIENT_ID.'
      );

      return undefined;
    }

    let cancelled = false;

    async function initializeGoogle() {
      try {
        const google =
          await loadGoogleIdentityScript();

        if (
          cancelled ||
          !google?.accounts?.id ||
          !googleButtonRef.current
        ) {
          return;
        }

        google.accounts.id.initialize({
          client_id:
            googleClientId,

          callback:
            async (response) => {
              const credential =
                String(
                  response?.credential ||
                    ''
                ).trim();

              if (!credential) {
                setAuthError(
                  'Google no devolvió una credencial válida.'
                );

                return;
              }

              setAuthError('');

              setAdminAuthToken(
                credential
              );

              setAuthStatus(
                'checking'
              );
            },

          auto_select: false,

          cancel_on_tap_outside:
            true
        });

        googleButtonRef.current.innerHTML =
          '';

        google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            shape: 'pill',
            text: 'continue_with',
            logo_alignment: 'left',
            width: 320
          }
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        setAuthError(
          error?.message ||
            'No fue posible iniciar Google.'
        );
      }
    }

    void initializeGoogle();

    return () => {
      cancelled = true;
    };
  }, [
    authStatus,
    googleClientId
  ]);

  function handleLogout() {
    clearAdminAuthToken();

    try {
      window.google?.accounts?.id?.disableAutoSelect();
    } catch {
      // No necesitamos hacer nada.
    }

    setAuthError('');
    setAuthStatus(
      'signed-out'
    );
  }

  if (
    authStatus ===
    'signed-in'
  ) {
    return (
      <div
        style={{
          minHeight: '100vh',
          position: 'relative'
        }}
      >
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Cerrar sesión de administrador"
          style={{
            position: 'fixed',
            top: 18,
            right: 18,
            zIndex: 9999,
            minHeight: 38,
            padding:
              '0 16px',
            border:
              '1px solid rgba(201, 169, 110, 0.4)',
            borderRadius: 999,
            background:
              'rgba(8, 20, 36, 0.92)',
            color:
              '#f6ead2',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing:
              '0.04em',
            cursor: 'pointer',
            boxShadow:
              '0 10px 30px rgba(0, 0, 0, 0.16)',
            backdropFilter:
              'blur(12px)'
          }}
        >
          Cerrar sesión
        </button>

        <AdminDashboard />
      </div>
    );
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '32px 20px',
        background:
          'radial-gradient(circle at top, #18283c 0%, #0a1625 42%, #06101d 100%)',
        color: '#f8f3e8'
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: 470,
          padding:
            '42px 38px',
          border:
            '1px solid rgba(211, 181, 124, 0.24)',
          borderRadius: 28,
          background:
            'rgba(8, 21, 37, 0.88)',
          boxShadow:
            '0 30px 80px rgba(0, 0, 0, 0.35)',
          textAlign: 'center',
          backdropFilter:
            'blur(16px)'
        }}
      >
        <div
          style={{
            width: 58,
            height: 58,
            display: 'grid',
            placeItems: 'center',
            margin:
              '0 auto 22px',
            border:
              '1px solid rgba(220, 187, 125, 0.35)',
            borderRadius: '50%',
            color: '#dfc18b',
            fontFamily: 'Georgia, serif',
            fontSize: 25
          }}
        >
          B
        </div>

        <p
          style={{
            margin:
              '0 0 8px',
            color:
              '#d9bc87',
            fontSize: 11,
            fontWeight: 800,
            letterSpacing:
              '0.18em',
            textTransform:
              'uppercase'
          }}
        >
          BodaSync Studio
        </p>

        <h1
          style={{
            margin:
              '0 0 12px',
            fontFamily:
              'Georgia, serif',
            fontSize:
              'clamp(30px, 7vw, 42px)',
            fontWeight: 400,
            lineHeight: 1.05
          }}
        >
          Panel administrativo
        </h1>

        <p
          style={{
            maxWidth: 340,
            margin:
              '0 auto 30px',
            color:
              'rgba(248, 243, 232, 0.66)',
            fontSize: 14,
            lineHeight: 1.65
          }}
        >
          Inicia sesión con la cuenta de Google autorizada para crear y administrar invitaciones.
        </p>

        {authStatus ===
        'checking' ? (
          <div
            style={{
              minHeight: 46,
              display: 'grid',
              placeItems:
                'center',
              color:
                '#dcc18d',
              fontSize: 13,
              fontWeight: 700
            }}
          >
            Verificando acceso...
          </div>
        ) : (
          <div
            ref={
              googleButtonRef
            }
            style={{
              minHeight: 44,
              display: 'flex',
              justifyContent:
                'center'
            }}
          />
        )}

        {authError ? (
          <div
            role="alert"
            style={{
              marginTop: 22,
              padding:
                '12px 14px',
              border:
                '1px solid rgba(231, 159, 159, 0.25)',
              borderRadius: 14,
              background:
                'rgba(127, 29, 29, 0.15)',
              color:
                '#f1c7c7',
              fontSize: 13,
              lineHeight: 1.5
            }}
          >
            {authError}
          </div>
        ) : null}

        <div
          style={{
            height: 1,
            margin:
              '32px 0 20px',
            background:
              'linear-gradient(90deg, transparent, rgba(216, 184, 124, 0.28), transparent)'
          }}
        />

        <p
          style={{
            margin: 0,
            color:
              'rgba(248, 243, 232, 0.42)',
            fontSize: 11,
            lineHeight: 1.6
          }}
        >
          Acceso exclusivo para administración de BodaSync.
        </p>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*
         * Invitaciones públicas.
         * Nunca requieren iniciar sesión.
         */}
        <Route
          path="/boda/:slug"
          element={
            <LandingPage />
          }
        />

        {/*
         * Administración protegida.
         */}
        <Route
          path="/admin"
          element={
            <AdminLogin />
          }
        />

        <Route
          path="/"
          element={
            <Navigate
              to="/admin"
              replace
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/admin"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}