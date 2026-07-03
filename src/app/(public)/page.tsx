'use client';
import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useMotionValue, useTransform, useSpring } from 'framer-motion';

// ── Types ────────────────────────────────────────────────
type Hero    = { headline:string; subheadline:string; cta_text:string; cta_url:string; bg_image_url:string|null };
type Profile = { full_name:string; tagline:string; bio:string; avatar_url:string|null; location:string; years_experience:number };
type Contact = { key:string; label:string; value:string };
type Resume  = { title:string; description:string; file_url:string|null; thumbnail_url:string|null };
type Service = { id:number; title:string; description:string; icon:string };
type Skill   = { id:number; name:string; logo_url:string|null; category:string };
type Project = { id:number; title:string; description:string; cover_url:string|null; client:string|null; url:string|null; status:string };
type GalleryItem = { id:number; image_url:string; title:string|null; description:string|null; category_name:string|null };
type Testimonial  = { id:number; client_name:string; client_title:string|null; client_avatar_url:string|null; message:string; rating:number; is_published:boolean };
type Certification = { id:number; title:string; issuer:string|null; issue_date:string|null; expiry_date:string|null; image_url:string|null; credential_url:string|null };
type LightboxState = { open:boolean; image:string; title:string; desc:string };

function fmtDate(d:string|null) {
  if (!d) return null;
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return null;
  return dt.toLocaleDateString('en-US', { year:'numeric', month:'short' });
}
function isExpired(d:string|null) {
  if (!d) return false;
  const dt = new Date(d);
  return !isNaN(dt.getTime()) && dt < new Date();
}

const socialIconMap: Record<string,string> = {
  email:'bi-envelope-fill', phone:'bi-telephone-fill',
  instagram:'bi-instagram', facebook:'bi-facebook',
  linkedin:'bi-linkedin', twitter:'bi-twitter-x', website:'bi-globe',
};

// ── Dot Canvas ───────────────────────────────────────────
function DotCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    if (window.innerWidth < 768) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const SPACING=28, R=1.8, REPEL=120, LERP=0.08;
    type Dot={rx:number;ry:number;cx:number;cy:number;vx:number;vy:number};
    let dots:Dot[]=[], mouse={x:-9999,y:-9999}, raf:number;
    const resize=()=>{
      canvas.width=window.innerWidth; canvas.height=window.innerHeight; dots=[];
      for(let x=0;x<canvas.width;x+=SPACING) for(let y=0;y<canvas.height;y+=SPACING)
        dots.push({rx:x,ry:y,cx:x,cy:y,vx:0,vy:0});
    };
    const draw=()=>{
      const isDark=document.documentElement.getAttribute('data-theme')!=='light';
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle=isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.06)';
      dots.forEach(d=>{
        const dx=d.cx-mouse.x,dy=d.cy-mouse.y,dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<REPEL){const f=(REPEL-dist)/REPEL;d.vx+=(dx/dist)*f*3;d.vy+=(dy/dist)*f*3;}
        d.cx+=(d.rx-d.cx)*LERP+d.vx; d.cy+=(d.ry-d.cy)*LERP+d.vy; d.vx*=0.85; d.vy*=0.85;
        ctx.beginPath(); ctx.arc(d.cx,d.cy,R,0,Math.PI*2); ctx.fill();
      });
      raf=requestAnimationFrame(draw);
    };
    const onMouse=(e:MouseEvent)=>{mouse={x:e.clientX,y:e.clientY};};
    resize(); draw();
    window.addEventListener('resize',resize); window.addEventListener('mousemove',onMouse);
    return()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',resize); window.removeEventListener('mousemove',onMouse); };
  },[]);
  return <canvas ref={ref} style={{position:'fixed',inset:0,width:'100%',height:'100%',zIndex:0,pointerEvents:'none'}}/>;
}

// ── Navbar ───────────────────────────────────────────────
const NAV = ['about','services','skills','tools','projects','gallery','resume','certifications','contact'];

function Navbar() {
  const {scrollY}=useScroll();
  const [scrolled,setScrolled]=useState(false);
  const [active,setActive]=useState('');
  const [open,setOpen]=useState(false);
  const [dark,setDark]=useState(true);
  useEffect(()=>{
    const t=localStorage.getItem('theme')?? 'dark';
    setDark(t==='dark');
  },[]);
  const toggle=()=>{
    const nd=!dark; setDark(nd);
    const t=nd?'dark':'light';
    localStorage.setItem('theme',t);
    document.documentElement.setAttribute('data-theme',t);
  };
  useEffect(()=>{
    const obs=new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting)setActive(x.target.id);}),{threshold:0.3});
    NAV.forEach(id=>{const el=document.getElementById(id);if(el)obs.observe(el);});
    return()=>obs.disconnect();
  },[]);
  const go=(id:string)=>{document.getElementById(id)?.scrollIntoView({behavior:'smooth'});setOpen(false);};
  return (
    <>
      <motion.nav style={{position:'fixed',top:0,left:0,right:0,height:60,background:'transparent',zIndex:100,display:'flex',alignItems:'center',padding:'0 1.5rem'}}>
        {/* Logo — left */}
        <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
          <img src="/logo.png" alt="MakiSync" style={{width:32,height:32,borderRadius:8,objectFit:'contain'}} onError={e=>{const t=e.target as HTMLImageElement;t.style.display='none';t.insertAdjacentHTML('afterend','<div style="width:32px;height:32px;border-radius:8px;background:var(--admin-accent);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:16px">M</div>');}}/>
          <span style={{fontSize:'0.95rem',fontWeight:700,color:'var(--admin-text-primary)'}}>MakiSync</span>
        </div>
        {/* Nav links — absolutely centered */}
        <div className="nav-links" style={{position:'absolute',left:'50%',transform:'translateX(-50%)',display:'flex',gap:24,alignItems:'center'}}>
          {NAV.map(id=>(
            <button key={id} onClick={()=>go(id)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'0.82rem',fontWeight:600,color:active===id?'var(--admin-accent)':'var(--admin-text-secondary)',textTransform:'capitalize',fontFamily:'inherit',position:'relative',transition:'color 0.2s'}}>
              {id}{active===id&&<motion.div layoutId="ul" style={{position:'absolute',bottom:-4,left:0,right:0,height:2,background:'var(--admin-accent)',borderRadius:1}}/>}
            </button>
          ))}
        </div>
        {/* Theme toggle + Hamburger — right side */}
        <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:10}}>
          <button onClick={toggle} style={{width:48,height:26,borderRadius:99,border:'none',cursor:'pointer',background:dark?'var(--admin-accent)':'#cbd5e1',transition:'background 0.2s',display:'flex',alignItems:'center',padding:'0 3px',flexShrink:0}} title={dark?'Switch to light':'Switch to dark'}>
            <motion.span animate={{x:dark?22:0}} transition={{type:'spring',stiffness:500,damping:30}} style={{width:20,height:20,borderRadius:'50%',background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              {dark
                ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              }
            </motion.span>
          </button>
          <button className="nav-hamburger" onClick={()=>setOpen(o=>!o)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--admin-text-primary)',fontSize:22,display:'none',padding:'4px 6px',alignItems:'center'}}>
            <i className={`bi ${open?'bi-x':'bi-list'}`}/>
          </button>
        </div>
      </motion.nav>
      <style>{`
        @media(max-width:768px){
          .nav-links{display:none!important}
          .nav-hamburger{display:flex!important;align-items:center}
        }
      `}</style>
      {/* Mobile drawer overlay */}
      {open&&<div onClick={()=>setOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(4px)',zIndex:101}}/>}
      {/* Mobile drawer */}
      <motion.div
        initial={{x:'100%'}} animate={{x:open?'0%':'100%'}}
        transition={{type:'spring',stiffness:300,damping:30}}
        style={{position:'fixed',top:0,right:0,bottom:0,width:260,background:'var(--admin-card)',borderLeft:'1px solid var(--admin-border)',zIndex:102,display:'flex',flexDirection:'column',padding:'1.5rem 1.25rem',gap:'0.35rem'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.25rem',paddingBottom:'0.75rem',borderBottom:'1px solid var(--admin-border)'}}>
          <span style={{fontSize:'0.95rem',fontWeight:700,color:'var(--admin-text-primary)'}}>Menu</span>
          <button onClick={()=>setOpen(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--admin-text-muted)',fontSize:18,padding:'2px 4px'}}><i className="bi bi-x-lg"/></button>
        </div>
        {NAV.map(id=>(
          <button key={id} onClick={()=>go(id)} style={{background:active===id?'rgba(59,130,246,0.1)':'none',border:`1px solid ${active===id?'rgba(59,130,246,0.22)':'transparent'}`,borderRadius:10,cursor:'pointer',fontSize:'0.9rem',fontWeight:600,color:active===id?'var(--admin-accent)':'var(--admin-text-secondary)',textAlign:'left',textTransform:'capitalize',fontFamily:'inherit',padding:'0.7rem 0.85rem',transition:'all 0.15s'}}>{id}</button>
        ))}
      </motion.div>
    </>
  );
}

// ── Section Wrapper ──────────────────────────────────────
const fadeUp={initial:{opacity:0,y:40},whileInView:{opacity:1,y:0},viewport:{once:true,amount:0.15},transition:{duration:0.6,ease:'easeOut'}} as const;

function Sec({id,children}:{id:string;children:React.ReactNode}) {
  return (
    <section id={id} style={{position:'relative',zIndex:1,padding:'5rem 2rem',maxWidth:1200,margin:'0 auto'}}>
      {children}
    </section>
  );
}

function SectionTitle({label,title,sub}:{label:string;title:string;sub?:string}) {
  return (
    <motion.div {...fadeUp} style={{marginBottom:'2.5rem'}}>
      <div style={{fontSize:'0.7rem',fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--admin-accent)',marginBottom:6}}>{label}</div>
      <h2 style={{fontSize:'clamp(1.6rem,4vw,2.5rem)',fontWeight:800,color:'var(--admin-text-primary)',letterSpacing:'-0.03em',marginBottom:6}}>{title}</h2>
      {sub&&<p style={{fontSize:'1rem',color:'var(--admin-text-muted)'}}>{sub}</p>}
    </motion.div>
  );
}


// ── Hero ─────────────────────────────────────────────────
function Hero({data,profile}:{data:Hero;profile:Profile}) {
  const go=()=>document.getElementById('contact')?.scrollIntoView({behavior:'smooth'});
  return (
    <section id="hero" style={{position:'relative',zIndex:1,minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'2rem',marginTop:60}}>
      {data.bg_image_url&&<div style={{position:'absolute',inset:0,backgroundImage:`url(${data.bg_image_url})`,backgroundSize:'cover',backgroundPosition:'center',opacity:0.12,zIndex:0}}/>}
      <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:0,duration:0.7}} style={{fontSize:'0.82rem',fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--admin-accent)',marginBottom:20,position:'relative',zIndex:1}}>Welcome</motion.div>
      {profile.avatar_url&&<motion.img initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} transition={{delay:0.1,duration:0.7}} src={profile.avatar_url} alt={profile.full_name} style={{width:80,height:80,borderRadius:'50%',border:'2px solid var(--admin-accent)',objectFit:'cover',marginBottom:24,position:'relative',zIndex:1}}/>}
      <motion.h1 initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:0.2,duration:0.7}} style={{fontSize:'clamp(2rem,6vw,3.5rem)',fontWeight:800,color:'var(--admin-text-primary)',letterSpacing:'-0.03em',marginBottom:16,maxWidth:800,position:'relative',zIndex:1}}>{data.headline||profile.full_name}</motion.h1>
      <motion.p initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:0.3,duration:0.7}} style={{fontSize:'1.1rem',color:'var(--admin-text-secondary)',maxWidth:600,marginBottom:32,lineHeight:1.6,position:'relative',zIndex:1}}>{data.subheadline||profile.tagline}</motion.p>
      <motion.button initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:0.4,duration:0.7}} whileHover={{y:-2,scale:1.02}} onClick={go} style={{padding:'12px 32px',background:'var(--admin-accent)',color:'#fff',border:'none',borderRadius:10,fontSize:'0.95rem',fontWeight:700,cursor:'pointer',boxShadow:'var(--admin-shadow)',fontFamily:'inherit',position:'relative',zIndex:1}}>{data.cta_text||'Get In Touch'}</motion.button>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.6}} style={{position:'absolute',bottom:40,left:'50%',transform:'translateX(-50%)',zIndex:1}}>
        <motion.div animate={{y:[0,10,0]}} transition={{repeat:Infinity,duration:2}} style={{color:'var(--admin-accent)',fontSize:24}}><i className="bi bi-chevron-down"/></motion.div>
      </motion.div>
    </section>
  );
}

// ── About ────────────────────────────────────────────────
function About({profile,contacts,resume}:{profile:Profile;contacts:Contact[];resume:Resume|null}) {
  return (
    <Sec id="about">
      <SectionTitle label="About Me" title={profile.full_name} sub={profile.tagline}/>
      <motion.div {...fadeUp} className="about-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:48}}>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
          <div style={{width:160,height:160,borderRadius:'50%',overflow:'hidden',border:'3px solid var(--admin-accent)',marginBottom:24,background:'rgba(59,130,246,0.1)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            {profile.avatar_url?<img src={profile.avatar_url} alt={profile.full_name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<i className="bi bi-person-fill" style={{fontSize:'4rem',color:'var(--admin-accent)'}}/>}
          </div>
          <div style={{display:'flex',gap:10,marginBottom:20,flexWrap:'wrap',justifyContent:'center'}}>
            {contacts.filter(c=>socialIconMap[c.key]&&c.value).map(c=>(
              <motion.a key={c.key} href={c.key==='email'?`mailto:${c.value}`:c.value} target="_blank" rel="noreferrer" whileHover={{scale:1.15,y:-2}} style={{width:40,height:40,borderRadius:'50%',border:'1px solid var(--admin-border)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--admin-text-primary)',fontSize:17,textDecoration:'none'}}>
                <i className={`bi ${socialIconMap[c.key]}`}/>
              </motion.a>
            ))}
          </div>
          {resume?.file_url&&<motion.a href={resume.file_url} target="_blank" rel="noreferrer" download whileHover={{scale:1.02}} style={{padding:'10px 24px',background:'var(--admin-accent)',color:'#fff',borderRadius:10,textDecoration:'none',fontSize:'0.9rem',fontWeight:700}}>Download Resume</motion.a>}
        </div>
        <div>
          <p style={{fontSize:'1rem',color:'var(--admin-text-secondary)',lineHeight:1.7,marginBottom:24}}>{profile.bio}</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            {profile.location&&<div style={{padding:16,background:'var(--admin-card)',border:'1px solid var(--admin-border)',borderRadius:10}}><div style={{fontSize:'0.7rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--admin-accent)',marginBottom:6}}>Location</div><div style={{fontWeight:600,color:'var(--admin-text-primary)'}}>{profile.location}</div></div>}
            {profile.years_experience&&<div style={{padding:16,background:'var(--admin-card)',border:'1px solid var(--admin-border)',borderRadius:10}}><div style={{fontSize:'0.7rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--admin-accent)',marginBottom:6}}>Experience</div><div style={{fontWeight:600,color:'var(--admin-text-primary)'}}>{profile.years_experience}+ Years</div></div>}
          </div>
        </div>
      </motion.div>
      <style>{`@media(max-width:768px){.about-grid{grid-template-columns:1fr!important}}`}</style>
    </Sec>
  );
}

// ── Services ─────────────────────────────────────────────
function Services({items}:{items:Service[]}) {
  return (
    <Sec id="services">
      <SectionTitle label="Services" title="What I Offer" sub="Comprehensive social media and virtual assistance solutions"/>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:24}}>
        {items.map((s,i)=>(
          <motion.div key={s.id} {...fadeUp} transition={{...fadeUp.transition,delay:i*0.08}} whileHover={{y:-4,borderColor:'var(--admin-accent)'}} style={{padding:24,background:'var(--admin-card)',border:'1px solid var(--admin-border)',borderRadius:14,transition:'border-color 0.2s'}}>
            <div style={{width:48,height:48,background:'rgba(59,130,246,0.12)',border:'1px solid rgba(59,130,246,0.25)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--admin-accent)',fontSize:22,marginBottom:16}}><i className={`bi ${s.icon||'bi-box-seam-fill'}`}/></div>
            <h3 style={{fontSize:'1rem',fontWeight:700,color:'var(--admin-text-primary)',marginBottom:8}}>{s.title}</h3>
            <p style={{fontSize:'0.87rem',color:'var(--admin-text-secondary)',lineHeight:1.6}}>{s.description}</p>
          </motion.div>
        ))}
      </div>
    </Sec>
  );
}


// ── Hero ─────────────────────────────────────────────────
function HeroSec({data,profile}:{data:Hero;profile:Profile}) {
  const go=()=>document.getElementById('contact')?.scrollIntoView({behavior:'smooth'});
  return (
    <section id="hero" style={{position:'relative',zIndex:1,minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'2rem',marginTop:60}}>
      <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:0,duration:0.7}} style={{fontSize:'0.78rem',fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--admin-accent)',marginBottom:20}}>Welcome</motion.div>
      {profile.avatar_url&&<motion.img initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} transition={{delay:0.1,duration:0.7}} src={profile.avatar_url} alt={profile.full_name} style={{width:80,height:80,borderRadius:'50%',border:'2px solid var(--admin-accent)',objectFit:'cover',marginBottom:24}}/>}
      <motion.h1 initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:0.2,duration:0.7}} style={{fontSize:'clamp(2rem,6vw,3.5rem)',fontWeight:800,color:'var(--admin-text-primary)',letterSpacing:'-0.03em',marginBottom:16,maxWidth:800}}>{data.headline||profile.full_name}</motion.h1>
      <motion.p initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:0.3,duration:0.7}} style={{fontSize:'1.1rem',color:'var(--admin-text-secondary)',maxWidth:600,marginBottom:32,lineHeight:1.6}}>{data.subheadline||profile.tagline}</motion.p>
      <motion.button initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:0.4,duration:0.7}} whileHover={{y:-2,scale:1.02}} onClick={go} style={{padding:'12px 32px',background:'var(--admin-accent)',color:'#fff',border:'none',borderRadius:10,fontSize:'0.95rem',fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>{data.cta_text||'Get In Touch'}</motion.button>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.6}} style={{position:'absolute',bottom:40}}>
        <motion.div animate={{y:[0,10,0]}} transition={{repeat:Infinity,duration:2}} style={{color:'var(--admin-accent)',fontSize:24}}><i className="bi bi-chevron-down"/></motion.div>
      </motion.div>
    </section>
  );
}

// ── Profile Card (tilt + float) ───────────────────────────
function ProfileCard({avatar_url,full_name,resume}:{avatar_url:string|null;full_name:string;resume:Resume|null}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5,0.5], [12,-12]), {stiffness:200,damping:20});
  const rotateY = useSpring(useTransform(x, [-0.5,0.5], [-12,12]), {stiffness:200,damping:20});
  const shadow = useTransform(y, [-0.5,0.5], [
    '0 40px 80px rgba(59,130,246,0.45), 0 8px 24px rgba(0,0,0,0.3)',
    '0 10px 30px rgba(59,130,246,0.2), 0 4px 12px rgba(0,0,0,0.15)'
  ]);

  function onMove(e:React.MouseEvent<HTMLDivElement>) {
    const r = ref.current!.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top)  / r.height - 0.5);
  }
  function onLeave() { x.set(0); y.set(0); }

  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:20,paddingTop:90}}>
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        animate={{y:[0,-10,0]}}
        transition={{duration:4,repeat:Infinity,ease:'easeInOut'}}
        style={{rotateX,rotateY,boxShadow:shadow,borderRadius:20,overflow:'hidden',transformStyle:'preserve-3d',cursor:'pointer',width:'100%',maxWidth:320,aspectRatio:'3/4'}}
      >
        {avatar_url
          ? <img src={avatar_url} alt={full_name} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
          : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(59,130,246,0.08)'}}><i className="bi bi-person-fill" style={{fontSize:'6rem',color:'var(--admin-accent)'}}/></div>
        }
      </motion.div>
      {resume?.file_url&&<motion.a href={resume.file_url} target="_blank" rel="noreferrer" whileHover={{scale:1.02}} style={{padding:'10px 24px',background:'var(--admin-accent)',color:'#fff',borderRadius:10,textDecoration:'none',fontSize:'0.9rem',fontWeight:700}}>Download Resume</motion.a>}
    </div>
  );
}

// ── About ────────────────────────────────────────────────
function AboutSec({profile,contacts,resume}:{profile:Profile;contacts:Contact[];resume:Resume|null}) {
  return (
    <Sec id="about">
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:48,alignItems:'start'}} className="about-grid">
        <div>
          <SectionTitle label="About Me" title={profile.full_name} sub={profile.tagline}/>
          <motion.div {...fadeUp}>
            <p style={{fontSize:'1rem',color:'var(--admin-text-secondary)',lineHeight:1.7,marginBottom:24}}>{profile.bio}</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:24}}>
              {profile.location&&<div style={{padding:16,background:'var(--admin-card)',border:'1px solid var(--admin-border)',borderRadius:10}}><div style={{fontSize:'0.7rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--admin-accent)',marginBottom:6}}>Location</div><div style={{fontWeight:600,color:'var(--admin-text-primary)'}}>{profile.location}</div></div>}
              {!!profile.years_experience&&<div style={{padding:16,background:'var(--admin-card)',border:'1px solid var(--admin-border)',borderRadius:10}}><div style={{fontSize:'0.7rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--admin-accent)',marginBottom:6}}>Experience</div><div style={{fontWeight:600,color:'var(--admin-text-primary)'}}>{profile.years_experience}+ Years</div></div>}
            </div>
            <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
              {contacts.filter(c=>socialIconMap[c.key]&&c.value).map(c=>(
                <motion.a key={c.key} href={c.key==='email'?`mailto:${c.value}`:c.value} target="_blank" rel="noreferrer" whileHover={{scale:1.15,y:-2}} style={{width:40,height:40,borderRadius:'50%',border:'1px solid var(--admin-border)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--admin-text-primary)',fontSize:17,textDecoration:'none'}}>
                  <i className={`bi ${socialIconMap[c.key]}`}/>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
        <div className="about-profile-card">
          <ProfileCard avatar_url={profile.avatar_url} full_name={profile.full_name} resume={resume}/>
        </div>
      </div>
      <style>{`@media(max-width:768px){.about-grid{grid-template-columns:1fr!important}.about-profile-card{display:none!important}}`}</style>
    </Sec>
  );
}

// ── Services ─────────────────────────────────────────────
function ServicesSec({items}:{items:Service[]}) {
  return (
    <Sec id="services">
      <SectionTitle label="Services" title="What I Offer" sub="Comprehensive social media and virtual assistance solutions"/>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:24}}>
        {items.map((s,i)=>(
          <motion.div key={s.id} {...fadeUp} transition={{...fadeUp.transition,delay:i*0.08}} whileHover={{y:-4,borderColor:'var(--admin-accent)'}} style={{padding:24,background:'var(--admin-card)',border:'1px solid var(--admin-border)',borderRadius:14,transition:'border-color 0.2s'}}>
            <div style={{width:48,height:48,background:'rgba(59,130,246,0.1)',border:'1px solid rgba(59,130,246,0.2)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--admin-accent)',fontSize:22,marginBottom:16}}><i className={`bi ${s.icon||'bi-box-seam-fill'}`}/></div>
            <h3 style={{fontSize:'1rem',fontWeight:700,color:'var(--admin-text-primary)',marginBottom:8}}>{s.title}</h3>
            <p style={{fontSize:'0.87rem',color:'var(--admin-text-secondary)',lineHeight:1.6}}>{s.description}</p>
          </motion.div>
        ))}
      </div>
    </Sec>
  );
}

// ── Skill/Tool Grid ──────────────────────────────────────
function SkillGrid({id,label,title,items}:{id:string;label:string;title:string;items:Skill[]}) {
  const cats=['all',...Array.from(new Set(items.map(s=>s.category).filter(Boolean)))];
  const [cat,setCat]=useState('all');
  const filtered=cat==='all'?items:items.filter(s=>s.category===cat);
  return (
    <Sec id={id}>
      <SectionTitle label={label} title={title}/>
      <div style={{display:'flex',gap:8,marginBottom:28,flexWrap:'wrap'}}>
        {cats.map(c=><button key={c} onClick={()=>setCat(c)} style={{padding:'6px 16px',borderRadius:99,border:`1px solid ${cat===c?'var(--admin-accent)':'var(--admin-border)'}`,background:cat===c?'rgba(59,130,246,0.12)':'transparent',color:cat===c?'var(--admin-accent)':'var(--admin-text-muted)',fontSize:'0.8rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit',textTransform:'capitalize'}}>{c==='all'?`All (${items.length})`:c}</button>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(110px,1fr))',gap:14}}>
        {filtered.map((s,i)=>(
          <motion.div key={s.id} initial={{opacity:0,scale:0.85}} whileInView={{opacity:1,scale:1}} viewport={{once:true}} transition={{delay:i*0.04,duration:0.4}} whileHover={{scale:1.06,borderColor:'var(--admin-accent)'}} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,padding:14,background:'var(--admin-card)',border:'1px solid var(--admin-border)',borderRadius:12,textAlign:'center',transition:'border-color 0.2s'}}>
            {s.logo_url?<img src={s.logo_url} alt={s.name} style={{width:44,height:44,objectFit:'contain'}}/>:<div style={{width:44,height:44,borderRadius:10,background:'rgba(59,130,246,0.1)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--admin-accent)',fontWeight:800,fontSize:18}}>{s.name.charAt(0)}</div>}
            <span style={{fontSize:'0.75rem',color:'var(--admin-text-secondary)',fontWeight:600,lineHeight:1.3}}>{s.name}</span>
          </motion.div>
        ))}
      </div>
    </Sec>
  );
}


// ── Projects ─────────────────────────────────────────────
function ProjectsSec({items,lb}:{items:Project[];lb:(s:LightboxState)=>void}) {
  const pub=items.filter(p=>p.status==='published');
  return (
    <Sec id="projects">
      <SectionTitle label="Portfolio" title="Recent Projects" sub="Showcase of completed work"/>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:24}}>
        {pub.map((p,i)=>(
          <motion.div key={p.id} {...fadeUp} transition={{...fadeUp.transition,delay:i*0.08}} whileHover={{y:-4}} onClick={()=>p.cover_url&&lb({open:true,image:p.cover_url,title:p.title,desc:p.description||''})} style={{borderRadius:14,overflow:'hidden',border:'1px solid var(--admin-border)',background:'var(--admin-card)',cursor:p.cover_url?'zoom-in':'default'}}>
            <div style={{width:'100%',paddingBottom:'56.25%',position:'relative',background:'var(--admin-bg-secondary)'}}>
              {p.cover_url&&<img src={p.cover_url} alt={p.title} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}} loading="lazy"/>}
            </div>
            <div style={{padding:16}}>
              <h3 style={{fontSize:'0.95rem',fontWeight:700,color:'var(--admin-text-primary)',marginBottom:6}}>{p.title}</h3>
              {p.description&&<p style={{fontSize:'0.82rem',color:'var(--admin-text-secondary)',lineHeight:1.5,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{p.description}</p>}
              {p.url&&<a href={p.url} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{fontSize:'0.75rem',color:'var(--admin-accent)',display:'inline-flex',alignItems:'center',gap:4,marginTop:8,textDecoration:'none'}}><i className="bi bi-box-arrow-up-right"/> View</a>}
            </div>
          </motion.div>
        ))}
      </div>
    </Sec>
  );
}

// ── Gallery ──────────────────────────────────────────────
function GallerySec({items,lb}:{items:GalleryItem[];lb:(s:LightboxState)=>void}) {
  const cats=Array.from(new Set(items.map(g=>g.category_name).filter(Boolean))) as string[];
  const [cat,setCat]=useState('');
  const filtered=cat?items.filter(g=>g.category_name===cat):items;
  return (
    <Sec id="gallery">
      <SectionTitle label="Gallery" title="Photos of Me" sub="A glimpse into my life and moments"/>
      {cats.length>0&&<div style={{display:'flex',gap:8,marginBottom:28,flexWrap:'wrap'}}>
        <button onClick={()=>setCat('')} style={{padding:'6px 16px',borderRadius:99,border:`1px solid ${cat===''?'var(--admin-accent)':'var(--admin-border)'}`,background:cat===''?'rgba(59,130,246,0.12)':'transparent',color:cat===''?'var(--admin-accent)':'var(--admin-text-muted)',fontSize:'0.8rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>All</button>
        {cats.map(c=><button key={c} onClick={()=>setCat(c===cat?'':c)} style={{padding:'6px 16px',borderRadius:99,border:`1px solid ${cat===c?'var(--admin-accent)':'var(--admin-border)'}`,background:cat===c?'rgba(59,130,246,0.12)':'transparent',color:cat===c?'var(--admin-accent)':'var(--admin-text-muted)',fontSize:'0.8rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit',textTransform:'capitalize'}}>{c}</button>)}
      </div>}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:14}}>
        {filtered.map((g,i)=>(
          <motion.div key={g.id} initial={{opacity:0,scale:0.95}} whileInView={{opacity:1,scale:1}} viewport={{once:true}} transition={{delay:i*0.04,duration:0.4}} whileHover={{scale:1.02}} onClick={()=>lb({open:true,image:g.image_url,title:g.title||'',desc:g.description||''})} style={{position:'relative',aspectRatio:'1/1',overflow:'hidden',borderRadius:12,cursor:'zoom-in',border:'1px solid var(--admin-border)'}}>
            <img src={g.image_url} alt={g.title||''} style={{width:'100%',height:'100%',objectFit:'cover'}} loading="lazy"/>
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.72) 0%,rgba(0,0,0,0.2) 50%,transparent 100%)',padding:'0.75rem',display:'flex',flexDirection:'column',justifyContent:'flex-end'}}>
              {g.title&&<div style={{fontSize:'0.85rem',fontWeight:700,color:'#fff'}}>{g.title}</div>}
              {g.description&&<div style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.75)',marginTop:2}}>{g.description}</div>}
            </div>
          </motion.div>
        ))}
      </div>
    </Sec>
  );
}

// ── Resume ───────────────────────────────────────────────
function ResumeSec({resume}:{resume:Resume|null}) {
  if(!resume) return null;
  return (
    <Sec id="resume">
      <SectionTitle label="Resume" title={resume.title||'My Resume'} sub={resume.description||undefined}/>
      <motion.div {...fadeUp} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:28}}>
        {resume.thumbnail_url&&(
          <motion.div
            whileHover={{scale:1.02,y:-4}}
            transition={{type:'spring',stiffness:300,damping:20}}
            style={{borderRadius:16,overflow:'hidden',border:'1px solid var(--admin-border)',boxShadow:'var(--admin-shadow)',maxWidth:480,width:'100%'}}
          >
            <img src={resume.thumbnail_url} alt={resume.title||'Resume'} style={{width:'100%',display:'block',objectFit:'cover'}}/>
          </motion.div>
        )}
        {!resume.thumbnail_url&&(
          <div style={{width:200,height:260,borderRadius:16,border:'1px solid var(--admin-border)',background:'var(--admin-card)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12,color:'var(--admin-text-muted)'}}>
            <i className="bi bi-file-earmark-text" style={{fontSize:'3rem',color:'var(--admin-accent)',opacity:0.5}}/>
            <span style={{fontSize:'0.82rem'}}>No thumbnail yet</span>
          </div>
        )}
        {resume.file_url&&(
          <motion.a
            href={resume.file_url}
            target="_blank"
            rel="noreferrer"
            download
            whileHover={{scale:1.03,y:-2}}
            whileTap={{scale:0.98}}
            style={{display:'inline-flex',alignItems:'center',gap:10,padding:'13px 32px',background:'var(--admin-accent)',color:'#fff',borderRadius:12,textDecoration:'none',fontSize:'0.95rem',fontWeight:700,boxShadow:'var(--admin-shadow)'}}
          >
            <i className="bi bi-download"/>
            Download Resume
          </motion.a>
        )}
      </motion.div>
    </Sec>
  );
}

// ── Certifications ───────────────────────────────────────
function CertsSec({items,lb}:{items:Certification[];lb:(s:LightboxState)=>void}) {
  return (
    <Sec id="certifications">
      <SectionTitle label="Credentials" title="Certifications" sub="Professional qualifications and achievements"/>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:24}}>
        {items.map((c,i)=>{
          const exp=isExpired(c.expiry_date);
          return (
            <motion.div key={c.id} {...fadeUp} transition={{...fadeUp.transition,delay:i*0.08}} style={{background:'var(--admin-card)',border:`1px solid ${exp?'rgba(248,113,113,0.25)':'var(--admin-border)'}`,borderRadius:14,overflow:'hidden'}}>
              <div onClick={()=>c.image_url&&lb({open:true,image:c.image_url,title:c.title,desc:c.issuer||''})} style={{width:'100%',paddingBottom:'56.25%',position:'relative',background:'var(--admin-bg-secondary)',cursor:c.image_url?'zoom-in':'default'}}>
                {c.image_url&&<img src={c.image_url} alt={c.title} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}} loading="lazy"/>}
                {!c.image_url&&<div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}><i className="bi bi-award-fill" style={{fontSize:'2.5rem',color:'rgba(59,130,246,0.2)'}}/></div>}
                {exp&&<div style={{position:'absolute',top:8,right:8,background:'rgba(239,68,68,0.9)',color:'#fff',padding:'3px 10px',borderRadius:99,fontSize:'0.65rem',fontWeight:700}}>EXPIRED</div>}
              </div>
              <div style={{padding:'1rem'}}>
                <h3 style={{fontSize:'0.92rem',fontWeight:700,color:'var(--admin-text-primary)',marginBottom:4}}>{c.title}</h3>
                {c.issuer&&<div style={{fontSize:'0.78rem',color:'var(--admin-text-muted)',marginBottom:6,display:'flex',alignItems:'center',gap:4}}><i className="bi bi-building"/>{c.issuer}</div>}
                <div style={{fontSize:'0.72rem',color:'var(--admin-text-muted)',marginBottom:10,display:'flex',gap:12,flexWrap:'wrap'}}>
                  {fmtDate(c.issue_date)&&<span><i className="bi bi-calendar-check" style={{marginRight:3}}/>Issued {fmtDate(c.issue_date)}</span>}
                  {fmtDate(c.expiry_date)&&<span style={{color:exp?'#f87171':undefined}}><i className="bi bi-calendar-x" style={{marginRight:3}}/>Expires {fmtDate(c.expiry_date)}</span>}
                </div>
                {c.credential_url&&<a href={c.credential_url} target="_blank" rel="noreferrer" style={{fontSize:'0.75rem',color:'var(--admin-accent)',display:'inline-flex',alignItems:'center',gap:4,textDecoration:'none'}}><i className="bi bi-patch-check-fill"/>View Credential</a>}
              </div>
            </motion.div>
          );
        })}
      </div>
    </Sec>
  );
}

// ── Contact ──────────────────────────────────────────────
function ContactSec({contacts}:{contacts:Contact[]}) {
  const [form,setForm]=useState({name:'',email:'',subject:'',message:''});
  const [sending,setSending]=useState(false);
  const [fb,setFb]=useState<{ok:boolean;msg:string}|null>(null);
  const inpStyle:React.CSSProperties={width:'100%',padding:'11px 14px',background:'var(--admin-card)',border:'1px solid var(--admin-border)',borderRadius:8,color:'var(--admin-text-primary)',fontSize:'0.9rem',fontFamily:'inherit',outline:'none'};
  const submit=async(e:React.FormEvent)=>{
    e.preventDefault(); setSending(true);
    try{
      const r=await fetch('/api/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sender_name:form.name,sender_email:form.email,subject:form.subject,body:form.message})});
      setFb(r.ok?{ok:true,msg:'Message sent!'}:{ok:false,msg:'Failed to send. Please try again.'});
      if(r.ok)setForm({name:'',email:'',subject:'',message:''});
    }catch{setFb({ok:false,msg:'An error occurred.'});}
    setSending(false); setTimeout(()=>setFb(null),3000);
  };
  return (
    <Sec id="contact">
      <SectionTitle label="Get In Touch" title="Contact Me" sub="Let's discuss your next project"/>
      <motion.div {...fadeUp} className="contact-grid" style={{display:'grid',gridTemplateColumns:'1fr 1.4fr',gap:48}}>
        <div>
          <h3 style={{fontSize:'1rem',fontWeight:700,color:'var(--admin-text-primary)',marginBottom:20}}>Contact Information</h3>
          {contacts.filter(c=>c.value).map(c=>(
            <motion.a key={c.key} href={c.key==='email'?`mailto:${c.value}`:c.value} target="_blank" rel="noreferrer" whileHover={{x:6}} style={{display:'flex',alignItems:'center',gap:12,marginBottom:12,padding:'10px 14px',background:'var(--admin-card)',border:'1px solid var(--admin-border)',borderRadius:10,textDecoration:'none',color:'var(--admin-text-primary)',transition:'all 0.2s'}}>
              <i className={`bi ${socialIconMap[c.key]||'bi-link-45deg'}`} style={{fontSize:18,color:'var(--admin-accent)',flexShrink:0}}/>
              <div><div style={{fontSize:'0.7rem',fontWeight:700,textTransform:'uppercase',color:'var(--admin-text-muted)'}}>{c.label}</div><div style={{fontSize:'0.88rem',fontWeight:600}}>{c.value}</div></div>
            </motion.a>
          ))}
        </div>
        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:14}}>
          <input type="text" placeholder="Your Name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required style={inpStyle}/>
          <input type="email" placeholder="Your Email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required style={inpStyle}/>
          <input type="text" placeholder="Subject" value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))} style={inpStyle}/>
          <textarea placeholder="Your Message" value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} required rows={5} style={{...inpStyle,resize:'vertical' as const}}/>
          {fb&&<div style={{padding:'10px 14px',borderRadius:8,fontSize:'0.85rem',fontWeight:600,background:fb.ok?'rgba(74,222,128,0.1)':'rgba(248,113,113,0.1)',color:fb.ok?'#4ade80':'#f87171',border:`1px solid ${fb.ok?'#4ade80':'#f87171'}`}}>{fb.msg}</div>}
          <motion.button type="submit" disabled={sending} whileHover={{scale:1.02}} whileTap={{scale:0.98}} style={{padding:'12px',background:'var(--admin-accent)',color:'#fff',border:'none',borderRadius:10,fontSize:'0.95rem',fontWeight:700,cursor:sending?'not-allowed':'pointer',opacity:sending?0.7:1,fontFamily:'inherit'}}>{sending?'Sending…':'Send Message'}</motion.button>
        </form>
      </motion.div>
      <style>{`@media(max-width:768px){.contact-grid{grid-template-columns:1fr!important}}`}</style>
    </Sec>
  );
}

// ── Footer ───────────────────────────────────────────────
function Footer({siteName,contacts}:{siteName:string;contacts:Contact[]}) {
  const go=(id:string)=>document.getElementById(id)?.scrollIntoView({behavior:'smooth'});
  return (
    <footer style={{position:'relative',zIndex:1,borderTop:'1px solid var(--admin-border)',padding:'3rem 2rem',marginTop:'3rem'}}>
      <div style={{maxWidth:1200,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:32}}>
        <div>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
            <img src="/logo.png" alt="MakiSync" style={{width:32,height:32,borderRadius:8,objectFit:'contain'}} onError={e=>{const t=e.target as HTMLImageElement;t.style.display='none';}}/>
            <span style={{fontSize:'0.95rem',fontWeight:700,color:'var(--admin-text-primary)'}}>{siteName}</span>
          </div>
          <p style={{fontSize:'0.82rem',color:'var(--admin-text-muted)',lineHeight:1.5}}>Social Media Manager & Virtual Assistant</p>
        </div>
        <div>
          <h4 style={{fontSize:'0.8rem',fontWeight:700,textTransform:'uppercase',color:'var(--admin-text-primary)',marginBottom:12,letterSpacing:'0.08em'}}>Quick Links</h4>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {['about','services','projects','gallery','contact'].map(id=><button key={id} onClick={()=>go(id)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'0.82rem',color:'var(--admin-text-secondary)',textAlign:'left',textTransform:'capitalize',fontFamily:'inherit',padding:0,transition:'color 0.15s'}}>{id}</button>)}
          </div>
        </div>
        <div>
          <h4 style={{fontSize:'0.8rem',fontWeight:700,textTransform:'uppercase',color:'var(--admin-text-primary)',marginBottom:12,letterSpacing:'0.08em'}}>Connect</h4>
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            {contacts.filter(c=>socialIconMap[c.key]&&c.value).map(c=>(
              <a key={c.key} href={c.key==='email'?`mailto:${c.value}`:c.value} target="_blank" rel="noreferrer" style={{width:36,height:36,borderRadius:'50%',border:'1px solid var(--admin-border)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--admin-text-primary)',fontSize:15,textDecoration:'none',transition:'all 0.2s'}}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='var(--admin-accent)';(e.currentTarget as HTMLElement).style.color='#fff';}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent';(e.currentTarget as HTMLElement).style.color='var(--admin-text-primary)';}}>
                <i className={`bi ${socialIconMap[c.key]}`}/>
              </a>
            ))}
          </div>
        </div>
      </div>
      <div style={{maxWidth:1200,margin:'2rem auto 0',paddingTop:'1.5rem',borderTop:'1px solid var(--admin-border)',textAlign:'center',fontSize:'0.8rem',color:'var(--admin-text-muted)'}}>
        © 2026 {siteName}. All rights reserved.
      </div>
    </footer>
  );
}

// ── Lightbox ─────────────────────────────────────────────
function Lightbox({state,onClose}:{state:LightboxState;onClose:()=>void}) {
  useEffect(()=>{
    const h=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();};
    document.addEventListener('keydown',h); return()=>document.removeEventListener('keydown',h);
  },[onClose]);
  if(!state.open) return null;
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.9)',backdropFilter:'blur(8px)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:'1.5rem',cursor:'zoom-out'}}>
      <motion.div initial={{scale:0.85}} animate={{scale:1}} onClick={e=>e.stopPropagation()} style={{position:'relative',maxWidth:'90vw',maxHeight:'90vh'}}>
        <img src={state.image} alt={state.title} style={{maxWidth:'100%',maxHeight:'90vh',borderRadius:12,objectFit:'contain'}}/>
        <button onClick={onClose} style={{position:'absolute',top:12,right:12,width:36,height:36,borderRadius:'50%',background:'rgba(255,255,255,0.12)',border:'none',color:'#fff',fontSize:'1rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><i className="bi bi-x-lg"/></button>
        {state.title&&<div style={{marginTop:12,textAlign:'center'}}><h3 style={{fontSize:'1rem',fontWeight:700,color:'#fff',marginBottom:4}}>{state.title}</h3>{state.desc&&<p style={{fontSize:'0.85rem',color:'rgba(255,255,255,0.75)'}}>{state.desc}</p>}</div>}
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ────────────────────────────────────────────
export default function Page() {
  const [data,setData]=useState<{hero:Hero;profile:Profile;contacts:Contact[];resume:Resume|null;services:Service[];skills:Skill[];tools:Skill[];projects:Project[];gallery:GalleryItem[];certs:Certification[]}|null>(null);
  const [lb,setLb]=useState<LightboxState>({open:false,image:'',title:'',desc:''});

  useEffect(()=>{
    const safe = (p: Promise<Response>) => p.then(r=>r.ok?r.json():null).catch(()=>null);
    Promise.all([
      safe(fetch('/api/content/hero')),
      safe(fetch('/api/profile')),
      safe(fetch('/api/profile/contacts')),
      safe(fetch('/api/profile/resume')),
      safe(fetch('/api/services')),
      safe(fetch('/api/skills')),
      safe(fetch('/api/tools')),
      safe(fetch('/api/projects')),
      safe(fetch('/api/gallery')),
      safe(fetch('/api/certifications')),
    ]).then(([hero,profile,contacts,resume,services,skills,tools,projects,gallery,certs])=>{
      setData({
        hero: hero ?? {headline:'',subheadline:'',cta_text:'',cta_url:'',bg_image_url:null},
        profile: profile ?? {full_name:'',tagline:'',bio:'',avatar_url:null,location:'',years_experience:0},
        contacts: contacts ?? [],
        resume: resume ?? null,
        services: services ?? [],
        skills: skills ?? [],
        tools: tools ?? [],
        projects: projects ?? [],
        gallery: gallery ?? [],
        certs: certs ?? [],
      });
    });
  },[]);

  if(!data) return (
    <>
      <style>{`
        @keyframes plsPop{from{opacity:0;transform:scale(0.92) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes plsSlide{0%{transform:translateX(-100%)}50%{transform:translateX(200%)}100%{transform:translateX(200%)}}
      `}</style>
      <div style={{position:'fixed',inset:0,zIndex:9999,background:'var(--admin-bg-primary)',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{background:'var(--admin-card)',border:'1px solid var(--admin-border)',borderRadius:20,padding:'2rem 2.5rem',display:'flex',flexDirection:'column',alignItems:'center',gap:'0.75rem',boxShadow:'var(--admin-shadow)',animation:'plsPop 0.3s ease',minWidth:220}}>
          <img src="/logo.png" alt="MakiSync" style={{width:64,height:64,objectFit:'contain',borderRadius:14}} onError={e=>{(e.target as HTMLImageElement).style.display='none';}}/>
          <div style={{fontSize:'1.4rem',fontWeight:800,color:'var(--admin-text-primary)',letterSpacing:'-0.02em'}}>MakiSync</div>
          <div style={{fontSize:'0.82rem',color:'var(--admin-text-muted)'}}>Loading portfolio…</div>
          <div style={{width:180,height:4,borderRadius:99,background:'var(--admin-border)',overflow:'hidden',marginTop:'0.25rem'}}>
            <div style={{width:'45%',height:'100%',borderRadius:99,background:'linear-gradient(90deg,#3b82f6,#6366f1)',animation:'plsSlide 1.2s infinite ease-in-out'}}/>
          </div>
        </div>
      </div>
    </>
  );

  const {hero,profile,contacts,resume,services,skills,tools,projects,gallery,certs}=data;

  return (
    <main style={{position:'relative',overflow:'hidden'}}>
      <DotCanvas/>
      <Navbar/>
      <HeroSec data={hero} profile={profile}/>
      <AboutSec profile={profile} contacts={contacts} resume={resume}/>
      {services.length>0&&<ServicesSec items={services}/>}
      {skills.length>0&&<SkillGrid id="skills" label="Skills" title="Technical Skills" items={skills}/>}
      {tools.length>0&&<SkillGrid id="tools" label="Tools" title="Tools I Use" items={tools}/>}
      {projects.length>0&&<ProjectsSec items={projects} lb={setLb}/>}
      {gallery.length>0&&<GallerySec items={gallery} lb={setLb}/>}
      <ResumeSec resume={resume}/>
      {certs.length>0&&<CertsSec items={certs} lb={setLb}/>}
      <ContactSec contacts={contacts}/>
      <Footer siteName={hero.headline?'MakiSync':profile.full_name||'MakiSync'} contacts={contacts}/>
      <Lightbox state={lb} onClose={()=>setLb(s=>({...s,open:false}))}/>
    </main>
  );
}
