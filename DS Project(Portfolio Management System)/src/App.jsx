import React,{useEffect,useState} from 'react';
import {Routes,Route,Navigate,useLocation} from 'react-router-dom';
import Layout from './layouts/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Imports from './pages/Imports';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import DataStructures from './pages/DataStructures';
import Settings from './pages/Settings';
import {holdings as initialHoldings,transactions as initialTransactions} from './data/mockData';

function Protected({children}){const auth=localStorage.getItem('portfoliox_auth'); return auth?children:<Navigate to="/login" replace/>}
export default function App(){
 const [theme,setTheme]=useState(localStorage.getItem('portfoliox_theme')||'light');
 const [holdings,setHoldings]=useState(initialHoldings); const [transactions,setTransactions]=useState(initialTransactions);
 useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem('portfoliox_theme',theme)},[theme]);
 const appProps={holdings,setHoldings,transactions,setTransactions,theme,setTheme};
 return <Routes>
  <Route path="/login" element={<Login/>}/><Route path="/signup" element={<Signup/>}/>
  <Route path="/*" element={<Protected><Layout {...appProps}/></Protected>}>
   <Route index element={<Dashboard {...appProps}/>}/><Route path="portfolio" element={<Portfolio {...appProps}/>}/><Route path="imports" element={<Imports {...appProps}/>}/><Route path="transactions" element={<Transactions {...appProps}/>}/><Route path="analytics" element={<Analytics {...appProps}/>}/><Route path="data-structures" element={<DataStructures/>}/><Route path="settings" element={<Settings {...appProps}/>}/>
  </Route>
 </Routes>
}
