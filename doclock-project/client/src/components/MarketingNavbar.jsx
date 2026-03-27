import logo from '../assets/doc2.png';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <>
     {/* NAV */}
           <nav>
             <div className="logo"><img src={logo} alt="" /></div>
             <ul className="nav-links">
               <li><a href="#">Home</a></li>
               <li><a href="#">Our Blog</a></li>
               <li><a href="#">Services</a></li>
               <li><a href="#">Contact Us</a></li>
             </ul>
             <Link to="/login" className="btn-book" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
               Book Now
             </Link>
           </nav>
    </>
  )
}

export default Navbar
