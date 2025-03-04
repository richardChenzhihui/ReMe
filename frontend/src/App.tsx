import { ConfigProvider, theme } from "antd";
import { createRef, lazy, ReactNode, Suspense, useEffect, useRef } from "react";
import cookie from "react-cookies";
import {
  createBrowserRouter,
  Location,
  Navigate,
  RouterProvider,
  useLocation,
  useOutlet,
} from "react-router-dom";
import { CSSTransition, SwitchTransition } from "react-transition-group";

import Chat from "@/pages/Chat";
import Draw from "@/pages/Draw";
import Feeback from "@/pages/Feedback";
import Game from "@/pages/Game";
import Home from "@/pages/Home";

import blueTheme from "./blueTheme.ts";

import "./App.less";

const { getDesignToken } = theme;

const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const Introduction = lazy(() => import("@/pages/Introduction"));

const Lifelog = lazy(() => import("@/pages/Lifelog"));
const LifelogDetail = lazy(() => import("@/pages/LifelogDeatil.tsx"));
const UploadLife = lazy(() => import("@/pages/UploadLife"));

const isAuthenticated = () => {
  return !!cookie.load("userId");
};

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/intro" replace />;
  }

  return children;
};

const routes = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
    nodeRef: createRef<HTMLDivElement>(),
  },
  {
    path: "/intro",
    element: <Introduction />,
    nodeRef: createRef<HTMLDivElement>(),
  },
  {
    path: "/login",
    element: <Login />,
    nodeRef: createRef<HTMLDivElement>(),
  },
  {
    path: "/register",
    element: <Register />,
    nodeRef: createRef<HTMLDivElement>(),
  },
  {
    path: "/chat",
    element: (
      <ProtectedRoute>
        <Chat />
      </ProtectedRoute>
    ),
    nodeRef: createRef<HTMLDivElement>(),
  },
  {
    path: "/chat/:pid",
    element: (
      <ProtectedRoute>
        <Chat />
      </ProtectedRoute>
    ),
    nodeRef: createRef<HTMLDivElement>(),
  },
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
    nodeRef: createRef<HTMLDivElement>(),
  },
  {
    path: "/feedback",
    element: (
      <ProtectedRoute>
        <Feeback />
      </ProtectedRoute>
    ),
    nodeRef: createRef<HTMLDivElement>(),
  },
  {
    path: "/game",
    element: (
      <ProtectedRoute>
        <Game />
      </ProtectedRoute>
    ),
    nodeRef: createRef<HTMLDivElement>(),
  },
  {
    path: "/draw/:id",
    element: (
      <ProtectedRoute>
        <Draw />
      </ProtectedRoute>
    ),
    nodeRef: createRef<HTMLDivElement>(),
  },
  {
    path: "/upload",
    element: (
      <ProtectedRoute>
        <UploadLife />
      </ProtectedRoute>
    ),
    nodeRef: createRef<HTMLDivElement>(),
  },
  {
    path: "/lifelog",
    element: (
      <ProtectedRoute>
        <Lifelog />
      </ProtectedRoute>
    ),
    nodeRef: createRef<HTMLDivElement>(),
  },
  {
    path: "/lifelog/detail",
    element: (
      <ProtectedRoute>
        <LifelogDetail />
      </ProtectedRoute>
    ),
    nodeRef: createRef<HTMLDivElement>(),
  },
];

const AnimatedRoutes = () => {
  const location = useLocation();
  const previousLocationRef = useRef<Location | null>(null);

  const currentOutlet = useOutlet();
  const { nodeRef } =
    routes.find((route) => route.path === location.pathname) ?? {};
  const animatedPaths = ["/draw", "/chat"];
  const isAnimated =
    animatedPaths.findIndex((path) => location.pathname.includes(path)) > -1 &&
    !previousLocationRef.current?.pathname.includes("/draw/");

  useEffect(() => {
    previousLocationRef.current = location;
  }, [location]);

  return (
    <SwitchTransition mode={"in-out"} component={null}>
      <CSSTransition
        key={location.pathname}
        nodeRef={nodeRef}
        timeout={{
          appear: 0,
          enter: isAnimated ? 500 : 0,
          exit: 0,
        }}
        classNames="slide"
        unmountOnExit
      >
        {() => {
          return (
            <div
              ref={nodeRef}
              style={
                {
                  width: "100%",
                  height: "100%",
                  background: "white",
                  "--primary-color": blueTheme.colorPrimary,
                  "--secondary-color": blueTheme.colorSecondary,
                  "--third-color": blueTheme.colorThird,
                  "--white": "#FFFFFF",
                } as React.CSSProperties
              }
              className="slide"
            >
              {currentOutlet}
            </div>
          );
        }}
      </CSSTransition>
    </SwitchTransition>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <AnimatedRoutes />,
    children: routes.map((route) => ({
      index: route.path === "/",
      path: route.path === "/" ? undefined : route.path,
      element: route.element,
    })),
  },
]);

const config = {
  token: blueTheme,
};

function App() {
  useEffect(() => {
    getDesignToken(config);
  }, []);
  return (
    <ConfigProvider theme={config}>
      <Suspense fallback={<div>Loading...</div>}>
        <RouterProvider router={router} />
      </Suspense>
    </ConfigProvider>
  );
}

export default App;
