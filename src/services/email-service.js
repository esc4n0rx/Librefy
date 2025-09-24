const { Resend } = require('resend');
const env = require('../config/env');

const resend = new Resend(env.RESEND_API_KEY);

const sendPasswordResetCode = async (email, code, userName) => {
  try {
    const { data, error } = await resend.emails.send({
      from: env.FROM_EMAIL,
      to: [email],
      subject: 'Código de Recuperação - Librefy',
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recuperação de Senha - Librefy</title>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Montserrat:wght@400;600&display=swap" rel="stylesheet">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; background-color: #F5F5F5; color: #333333;">
          
          <!-- Container Principal -->
          <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            
            <!-- Header com Logo -->
            <div style="background: linear-gradient(135deg, #6C63FF 0%, #4FC3F7 100%); padding: 30px 20px; text-align: center; border-radius: 0;">
              <img src="cid:logo" alt="Librefy" style="max-width: 120px; height: auto; margin-bottom: 10px;" />
              <h1 style="color: #FFFFFF; font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 28px; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                Librefy
              </h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 5px 0 0 0; font-weight: 400;">
                Sua biblioteca digital
              </p>
            </div>
            
            <!-- Conteúdo Principal -->
            <div style="padding: 40px 30px;">
              
              <h2 style="color: #6C63FF; font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 24px; margin: 0 0 20px 0; text-align: center;">
                Recuperação de Senha
              </h2>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                Olá, <strong style="color: #6C63FF;">${userName}</strong>! 👋
              </p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Recebemos uma solicitação para redefinir a senha da sua conta no Librefy. 
                Use o código de verificação abaixo para criar uma nova senha:
              </p>
              
              <!-- Código de Verificação -->
              <div style="background: linear-gradient(135deg, #F5F5F5 0%, #E8E8FF 100%); padding: 25px; text-align: center; margin: 30px 0; border-radius: 12px; border: 2px solid #6C63FF;">
                <p style="color: #6C63FF; font-size: 14px; font-weight: 600; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">
                  Seu Código de Verificação
                </p>
                <div style="font-family: 'Poppins', monospace; font-size: 36px; font-weight: 700; color: #FF7043; letter-spacing: 8px; text-shadow: 0 2px 4px rgba(0,0,0,0.1); margin: 10px 0;">
                  ${code}
                </div>
                <p style="color: #666666; font-size: 12px; margin: 10px 0 0 0;">
                  Digite este código no aplicativo para continuar
                </p>
              </div>
              
              <!-- Informações Importantes -->
              <div style="background: #FFF3E0; border-left: 4px solid #FF7043; padding: 15px 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <p style="color: #E65100; font-weight: 600; font-size: 14px; margin: 0 0 5px 0;">
                  ⏰ Informações Importantes:
                </p>
                <ul style="color: #BF360C; font-size: 14px; margin: 5px 0 0 0; padding-left: 20px; line-height: 1.5;">
                  <li>Este código expira em <strong>15 minutos</strong></li>
                  <li>Use apenas uma vez - será invalidado após o uso</li>
                  <li>Não compartilhe este código com ninguém</li>
                </ul>
              </div>
              
              <!-- Botão de Ação -->
              <div style="text-align: center; margin: 30px 0;">
                <p style="color: #666666; font-size: 14px; margin: 0 0 15px 0;">
                  Você também pode acessar diretamente:
                </p>
                <a href="#" style="display: inline-block; background: linear-gradient(135deg, #FF7043 0%, #FF5722 100%); color: #FFFFFF; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(255, 112, 67, 0.3); transition: all 0.3s ease;">
                  Abrir Librefy
                </a>
              </div>
              
              <!-- Aviso de Segurança -->
              <div style="background: #E3F2FD; border: 1px solid #4FC3F7; padding: 15px; border-radius: 8px; margin: 25px 0;">
                <p style="color: #01579B; font-size: 14px; margin: 0; line-height: 1.5;">
                  <strong>🔒 Não solicitou esta recuperação?</strong><br>
                  Se você não fez esta solicitação, pode ignorar este email com segurança. 
                  Sua conta permanece protegida e nenhuma alteração será feita.
                </p>
              </div>
              
            </div>
            
            <!-- Footer -->
            <div style="background: #333333; color: #FFFFFF; padding: 25px 30px; text-align: center;">
              
              <div style="margin-bottom: 15px;">
                <span style="color: #4FC3F7; font-size: 18px; margin: 0 8px;">📚</span>
                <span style="color: #FF7043; font-size: 18px; margin: 0 8px;">✨</span>
                <span style="color: #6C63FF; font-size: 18px; margin: 0 8px;">📖</span>
              </div>
              
              <p style="color: #CCCCCC; font-size: 14px; margin: 0 0 10px 0; line-height: 1.5;">
                Continue sua jornada literária com o <strong style="color: #6C63FF;">Librefy</strong><br>
                Leia, escreva e compartilhe suas histórias favoritas
              </p>
              
              <div style="border-top: 1px solid #555555; padding-top: 15px; margin-top: 15px;">
                <p style="color: #999999; font-size: 12px; margin: 0; line-height: 1.4;">
                  Este é um email automático, não responda.<br>
                  © ${new Date().getFullYear()} Librefy. Todos os direitos reservados.<br>
                  <span style="color: #4FC3F7;">Sua biblioteca digital pessoal</span>
                </p>
              </div>
              
            </div>
            
          </div>
          
          <!-- Espaçamento final -->
          <div style="height: 30px;"></div>
          
        </body>
        </html>
      `,
      attachments: [
        {
          filename: 'logo.png',
          path: 'https://res.cloudinary.com/detsfo3ls/image/upload/v1758722236/epttsyowhemvsbxnwx7a.png',
          cid: 'logo'
        }
      ]
    });

    if (error) {
      throw new Error(`Erro ao enviar email: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Erro no serviço de email:', error);
    throw error;
  }
};

module.exports = {
  sendPasswordResetCode
};