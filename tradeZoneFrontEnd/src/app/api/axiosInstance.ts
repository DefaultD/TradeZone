import axios from "axios";

const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost"}:3000`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ======== CONTROLE DE REFRESH ==========
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(newToken: string) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

// ======== FUNÇÕES AUXILIARES ==========
function getAccessToken() {
  return (
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken")
  );
}

function getRefreshToken() {
  return (
    localStorage.getItem("refreshToken") ||
    sessionStorage.getItem("refreshToken")
  );
}

function saveAccessToken(newToken: string) {
  if (localStorage.getItem("accessToken")) {
    localStorage.setItem("accessToken", newToken);
  } else if (sessionStorage.getItem("accessToken")) {
    sessionStorage.setItem("accessToken", newToken);
  } else {
    // fallback: assume persistente
    localStorage.setItem("accessToken", newToken);
  }
}

// ======== INTERCEPTOR DE REQUISIÇÕES ==========
axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ======== INTERCEPTOR DE RESPOSTAS ==========
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for 401 e ainda não tentou refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Se já estiver atualizando token, espera terminar
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        const userId =
          localStorage.getItem("user_id") || sessionStorage.getItem("user_id");

        if (!refreshToken || !userId) {
          console.warn("Nenhum refresh token disponível — redirecionando para login");
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = "/login";
          return Promise.reject(error);
        }

        // Chama o endpoint /auth/refresh
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost"}:3000/auth/refresh`,
          {
            user_id: parseInt(userId, 10),
            refresh_token: refreshToken,
          },
          { withCredentials: true }
        );

        const newAccessToken = data.access_token;

        // Salva novo token no mesmo storage onde estava
        saveAccessToken(newAccessToken);

        // Atualiza header global
        axiosInstance.defaults.headers.Authorization = `Bearer ${newAccessToken}`;

        // Avisa quem estava esperando
        onRefreshed(newAccessToken);

        // Reenvia a requisição original
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Falha ao atualizar token:", refreshError);
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
