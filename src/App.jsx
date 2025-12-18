import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import AppRouter from "./Routerfile/Router";
// import Example from "./pages/main/example";
// import { BrowserRouter } from "react-router-dom";

function App() {

  return (
    <>
    <div>
    <AppRouter/>
     {/* <BrowserRouter>
    <Example/>
     </BrowserRouter> */}
    </div>
    </>
  );
}

export default App;
