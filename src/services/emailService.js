import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import hbs from 'nodemailer-express-handlebars';

const {
    NODEMAILER_EMAIL,
    NODEMAILER_PASSWORD
} = process.env;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: NODEMAILER_EMAIL,
        pass: NODEMAILER_PASSWORD
    }
});

transporter.use('compile', hbs({
    viewEngine: {
        extname: '.hbs',
        layoutsDir: '',
        defaultLayout: false,
        partialsDir: path.join(__dirname, '../templates')
    },
    viewPath: path.join(__dirname, '../templates'),
    extName: '.hbs'
}));

const sendEmail = async (req, res) => {
    const { to, subject, userName, idClaim, statusClaim, dateUpdate } = req.body;

    if (!to || !subject || !userName || !idClaim || !statusClaim || !dateUpdate) {
        return res.status(400).json({ message: 'Faltan datos para enviar el correo' });
    }

    const mailOptions = {
        from: NODEMAILER_EMAIL,
        to,
        subject,
        template: 'claimStatusNotification',
        context: {
            userName,
            idClaim,
            statusClaim,
            dateUpdate
        }
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email enviado: ', info.response);
        res.status(200).json({ message: 'Correo enviado exitosamente', info });
    } catch (error) {
        console.error('Error al enviar email:', error);
        res.status(500).json({ error: 'Error al enviar email' });
    }
};

export { sendEmail };
