import React, { createContext, useContext, useState, useEffect } from 'react';

const RouterContext = createContext(null);

export const useNavigate = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useNavigate must be used within Router');
  }
  return context.navigate;
};

export const useLocation = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useLocation must be used within Router');
  }
  return context.currentPath;
};

export const Router = ({ children }) => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const Route = ({ path, element }) => {
  const location = useLocation();
  return location === path ? element : null;
};