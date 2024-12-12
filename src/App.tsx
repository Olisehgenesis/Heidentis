import Footer from './components/Footer';


import { AllWalletsProvider } from './services/wallets/AllWalletsProvider';
import AppRouter from './AppRouter';
import "./index.css";

function App() {
  return (
      <AllWalletsProvider>
         
          {/* div tghat covers 90% of the screen height tailwind */}
          <div className="min-h-screen">
            <AppRouter />
          </div>
 
        
          <Footer />
       
      </AllWalletsProvider>

  );
}

export default App;