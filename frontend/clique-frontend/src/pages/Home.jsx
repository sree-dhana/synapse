import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className='card'>
      <h1>Welcome to the App</h1>
      <div className='nav-links'>
        <Link to='/register'>Register</Link>
        <Link to='/login'>Login</Link>
      </div>
    </div>
  );
}

export default Home;