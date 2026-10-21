import express from 'express';
import cors from 'cors';
import 'dotenv/config';
const app = express()
process.env.NODE_TLS_REJECT_UNAUTHORIZED= '0'

const MODELO='openai/gpt-oss-120b'
const PORT = process.env.PORT || 5500;
const URL_API = "https://api.groq.com/openai/v1/chat/completions";

app.use(express.json());
app.use(express.static('public'));
app.use(cors());

const user = [];


app.post('/cadastro', (req, res)=>{
    const {usuario, email, senha} = req.body;

    if (!usuario || !email || !senha) {
        return res.status(400).json({
            erro: "Preencha todos os campos"
        });
    }

    if (senha.length < 6) {
        return res.status(400).json({
            erro: "A senha deve ter 6 caracteres ou mais"
        });
    }

    const emailUsado = user.find((busca) => busca.email === email);

    if (emailUsado) {
        return res.status(409).json({
            erro: "Email já está em uso"
        });
    }

    console.log(`Recebido, aguarde 5 segundo`);

    user.push({usuario, email, senha});

    setTimeout(()=>{
        console.log(`Cadastrado o ${usuario} com o Email ${email}`);

        res.json({
            mensagem: "Cadastrado com Sucesso!!",
            perfil: `Perfil ${usuario} cadastrado com o email ${email}`
        });
    }, 5000);
});

app.post('/login', (req, res)=>{
    const {email, senha} = req.body;
    
    if (!email || !senha) {
        return res.status(400).json({erro:"Preencha todos os campos"});
    }

    const emailExiste = user.find((busca)=> busca.email.toLowerCase() === email.toLowerCase());

    if (!emailExiste || emailExiste.senha != senha) {
        return res.status(400).json({erro:"Email ou senha incorretos!"});
    }

    return res.json({
        mensagem: "Login realizado com Sucesso!!",
        usuario: emailExiste.email
    });
})

app.post('/chat', async (req, res) => {
    try {
        const API_KEY = process.env.GROQ_API_KEY

        const historico = req.body.historico || []

        const mensagens = [
            {
                role: "system",
                content: "qua qua qua esse cara é um comédia"
            },
            ...historico
        ]

        const respostaBruta = await fetch(URL_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: MODELO,
                messages: mensagens
            })
        })

        const dados = await respostaBruta.json()

        if (!respostaBruta.ok) {
            return res.status(respostaBruta.status).json({
                erro: dados.error?.message || "Erro ao consultar a API"
            })
        }

        const resposta = dados.choices[0].message.content
        return res.json({ resposta })

    } catch (erro) {
        console.error(erro)
        return res.status(500).json({ erro: "Erro interno no servidor" })
    }
})

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
})