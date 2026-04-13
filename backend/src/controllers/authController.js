import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "Email já cadastrado." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    
    return res.status(200).json({ message: "Usuário registrado com sucesso", userId: user._id });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao registrar usuário" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, keepConnected } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }
    
    const tempoExpiracao = keepConnected ? '30d' : '24h';
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: tempoExpiracao });
    return res.status(200).json({ token, userId: user._id });
  } catch (error) {
    return res.status(500).json({ error: "Erro no login" });
  }
};

export const changePassword = async (req, res) => {
  const { userId, senhaAtual, novaSenha } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Utilizador não encontrado.' });

    const isMatch = await bcrypt.compare(senhaAtual, user.password);
    if (!isMatch) return res.status(400).json({ error: 'A senha atual está incorreta.' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(novaSenha, salt);
    await user.save();

    res.status(200).json({ message: 'Senha atualizada com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};