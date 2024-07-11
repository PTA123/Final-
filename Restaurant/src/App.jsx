import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast"; 
import Home from './Pages/Home'
import NotFound from "./Pages/NotFound";
import Success from "./Pages/Success";
import Confirm from "./Pages/Confrim/Confrim";
import './App.css'
import Menu_res from "./Pages/Menu_res";
import Menu_all from "./Pages/Menu_res/menu_all";

const App = () => {
  return <Router>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/confirm" element={<Confirm />} />
        <Route path="/success" element={<Success/>}/>
        <Route path="*" element={<NotFound/>}/>
        <Route path="/menu-res" element={<Menu_res/>}/>
        <Route path="/menu-all" element={<Menu_all/>}/>
      </Routes>
      <Toaster/>
    </Router>;
};

export default App