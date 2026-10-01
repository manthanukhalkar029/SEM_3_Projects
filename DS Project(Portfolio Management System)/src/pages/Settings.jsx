import React from 'react';
import {Sun,Moon,Palette,UserRound,ShieldCheck,Bell,Droplets,Leaf,Heart} from 'lucide-react';

const themes=[
 {id:'light',label:'Light',icon:Sun},
 {id:'dark',label:'Dark',icon:Moon},
 {id:'ocean',label:'Ocean',icon:Droplets},
 {id:'emerald',label:'Emerald',icon:Leaf},
 {id:'rose',label:'Rose',icon:Heart}
];

export default function Settings({theme,setTheme}){
 return <><div className="section-header"><div><div className="eyebrow">PREFERENCES</div><h1>Settings</h1><p className="muted">Customize your PortfolioX experience.</p></div></div>
 <div className="settings-grid">
  <div className="card setting-card"><div className="setting-icon"><UserRound size={18}/></div><div><h3>Profile</h3><p className="muted">Manthan Ukhalkar · manthan@example.com</p></div><button className="secondary">Edit</button></div>
  <div className="card setting-card appearance-card"><div className="setting-icon"><Palette size={18}/></div><div><h3>Appearance</h3><p className="muted">Choose one of the PortfolioX themes. Your choice is saved automatically.</p><div className="theme-options theme-grid">{themes.map(({id,label,icon:Icon})=><button key={id} className={theme===id?'selected':''} onClick={()=>setTheme(id)} title={`Use ${label} theme`}><Icon size={16}/><span>{label}</span></button>)}</div></div></div>
  <div className="card setting-card"><div className="setting-icon"><Bell size={18}/></div><div><h3>Notifications</h3><p className="muted">Price-change and import reminders.</p></div><label className="switch"><input type="checkbox" defaultChecked/><span/></label></div>
  <div className="card setting-card"><div className="setting-icon"><ShieldCheck size={18}/></div><div><h3>Monitoring & privacy</h3><p className="muted">PortfolioX stores imported data for monitoring. Broker credentials are not required for statement imports.</p></div></div>
 </div></>
}
