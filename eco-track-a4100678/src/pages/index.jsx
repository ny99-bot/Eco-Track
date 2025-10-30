import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Track from "./Track";

import Compete from "./Compete";

import Learn from "./Learn";

import Local from "./Local";

import Profile from "./Profile";

import EcoBot from "./EcoBot";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Track: Track,
    
    Compete: Compete,
    
    Learn: Learn,
    
    Local: Local,
    
    Profile: Profile,
    
    EcoBot: EcoBot,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Track" element={<Track />} />
                
                <Route path="/Compete" element={<Compete />} />
                
                <Route path="/Learn" element={<Learn />} />
                
                <Route path="/Local" element={<Local />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/EcoBot" element={<EcoBot />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}