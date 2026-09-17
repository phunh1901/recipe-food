const isAuthEndpoint = (url = "") => /\/auth\/(login|register|forgot-password)$/.test(url);

export const configureAuthInterceptors = (client, auth) => {
  let refreshPromise;
  client.interceptors.request.use(async config => {
    if (!isAuthEndpoint(config.url)) {
      const { data: { session }, error } = await auth.getSession();
      if (error) throw error;
      if (session) config.headers.Authorization = "Bearer " + session.access_token;
      else delete config.headers.Authorization;
    }
    return config;
  });
  client.interceptors.response.use(
    response => response.data,
    async error => {
      const config = error.config;
      if (error.response?.status === 401 && config && !isAuthEndpoint(config.url)) {
        if (!config._retried) {
          config._retried = true;
          refreshPromise ||= auth.refreshSession().finally(() => { refreshPromise = null; });
          const { data, error: refreshError } = await refreshPromise;
          if (!refreshError && data.session) {
            config.headers.Authorization = "Bearer " + data.session.access_token;
            return client(config);
          }
          // A transient outage must not discard a recoverable session.
          if (refreshError && (!refreshError.status || refreshError.status >= 500)) {
            throw refreshError;
          }
        }
        await auth.signOut({ scope: "local" });
      }
      return Promise.reject(error.response?.data || error);
    }
  );
};
