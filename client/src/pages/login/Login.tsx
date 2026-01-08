import {useState} from 'react';
import './Login.css';
import {useNavigate} from 'react-router-dom';

interface LoginResponse{
    token : string;
    user:{
        id : number;
        username : string;
    };
    error?:string;
}

export default function Login(){
    const [message,setMessage] = useState('');
    const [username,setUsername] = useState('');
    const [password,setPassword] = useState('');
    const [loading,setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {

        setLoading(true);
        setMessage('');

        try{
        const res = await fetch("http://localhost:3007/api/login", {
            method : "POST",
            headers : {'Content-Type':'application/json'},
            body: JSON.stringify({username,password}),
            });

            const data: LoginResponse = await res.json();

            if (res.ok){
                setMessage('Login Successfull!');

                localStorage.setItem('token',data.token);
                localStorage.setItem('user',JSON.stringify(data.user));

                navigate('/');

            }else{
                setMessage(`Error : ${data.error}`);
            }
        }catch(err){
            setMessage('Server Error.Try again later...');
        }finally{
            setLoading(false);
        }
    }

    return(
        <div className="modal-wrapper">
            <div className="modal">
                <h2>Login</h2>
                <input 
                type="text"
                placeholder='Username'
                value = {username}
                onChange = {(e : React.ChangeEvent<HTMLInputElement>) =>{
                    setUsername(e.target.value);
                }} 
                />
                <input 
                type="password"
                placeholder='Password'
                value = {password} 
                onChange = {(e : React.ChangeEvent<HTMLInputElement>) => {
                    setPassword(e.target.value);
                }}
                />
                <button onClick={handleLogin} disabled = {loading}>
                    {loading ? "Logging in " : "Login"}
                </button>
                <p>{message}</p>
            </div>
        </div>
    )
}