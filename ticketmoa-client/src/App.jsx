import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PerformanceListPage from './pages/PerformanceListPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/performances" element={<PerformanceListPage />} />
          </Routes>
        </main>
        <BottomNav />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
