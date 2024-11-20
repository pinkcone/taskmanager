import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import styles from '../styles/Login.module.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const { state } = useLocation();
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (state && state.message) {
            setMessage(state.message);
        }
    }, [state]);

    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();

        const user = {
            email,
            password
        };

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            const body = JSON.stringify(user);

            const res = await axios.post('/api/auth/login', body, config);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('username', res.data.username);
            navigate('/', { state: { username: res.data.username } });
        } catch (err) {
            console.error(err.response.data);
            setMessage('Logowanie nie powiodło się :(');
        }
    };

    useEffect(() => {
        var c = document.getElementById("c");
        var ctx = c.getContext("2d");

        c.height = window.innerHeight;
        c.width = window.innerWidth;

        var matrix = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";
 
        matrix = matrix.split("");

        var font_size = 8;
        var columns = c.width / font_size;

        var drops = [];

        for (var x = 0; x < columns; x++)
            drops[x] = 1;


        function draw() {
            
            ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
            ctx.fillRect(0, 0, c.width, c.height);

            ctx.fillStyle = "#f4427d";//green text
            ctx.font = font_size + "px arial";
            
            for (var i = 0; i < drops.length; i++) {
                
                var text = matrix[Math.floor(Math.random() * matrix.length)];
                
                ctx.fillText(text, i * font_size, drops[i] * font_size);

                if (drops[i] * font_size > c.height && Math.random() > 0.975)
                    drops[i] = 0;

                
                drops[i]++;
            }
        }

        const intervalId = setInterval(draw, 35);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className='matrix'>
            <canvas id="c"></canvas>
            <div className={styles.container}>
                <div className={styles.login}>
                    <h1>Logowanie</h1>
                    {message && (
                        <div className="alert alert">
                            {message}
                            <div>
                                Nie masz konta? <Link to="/register" className={styles.link}>Zarejestruj się tutaj!</Link>
                            </div>
                        </div>
                    )}
                    <form onSubmit={onSubmit}>
                        <div className={styles['form-group']}>
                            <input
                                type="email"
                                placeholder="Email"
                                name="email"
                                value={email}
                                onChange={onChange}
                                required
                            />
                        </div>
                        <div className={styles['form-group']}>
                            <input
                                type="password"
                                placeholder="Hasło"
                                name="password"
                                value={password}
                                onChange={onChange}
                                required
                            />
                        </div>
                        <input type="submit" className={styles['btn']} value="Zaloguj się" />
                    </form>
                    <div className={styles.mt3}>
                        Nie masz konta? <Link to="/register" className={styles.link}>Zarejestruj się tutaj!</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
