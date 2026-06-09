import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import ExplorePage from './pages/Explore';
import Home from './pages/Home';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import FloatingActionButton from './components/FloatingActionButton';
import SellPage from './pages/Sell';
import AccountPage from './pages/Account';
import AdminDashboard from './pages/AdminDashboard';
import Exchanges from './pages/Exchanges';
import BookDetails from './pages/BookDetails';


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-background font-sans antialiased text-foreground selection:bg-primary/20 pb-16 md:pb-0">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/sell" element={<SellPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/exchanges" element={<Exchanges />} />
              <Route path="/books/:id" element={<BookDetails />} />
            </Routes>
          </main>
          <BottomNav />
          <FloatingActionButton />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
