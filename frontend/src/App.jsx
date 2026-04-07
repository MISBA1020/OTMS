import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Scheduling from './pages/Scheduling';
import Sterilization from './pages/Sterilization';

function App() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/scheduling" element={<Scheduling />} />
                <Route path="/sterilization" element={<Sterilization />} />
            </Routes>
        </Layout>
    );
}

export default App;
