import {createRoot} from 'react-dom/client'
import './index.css'
import App from './components/App/App.jsx'
import {BrowserRouter} from "react-router-dom";
import {AuthProvider} from "./context/AuthProvide.jsx";

createRoot(document.getElementById('root')).render(
    <AuthProvider>
        <BrowserRouter>
            <App/>
        </BrowserRouter>
    </AuthProvider>,
)
