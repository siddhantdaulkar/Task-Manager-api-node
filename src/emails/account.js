const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'siddhantdaulkar4@gmail.com',
        subject: 'Welcome to our community!',
        text: `welcome ${name} to our community`
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'siddhantdaulkar4@gmail.com',
        subject:'sorry to see you leave',
        text: `dear ${name} we are so sorry to see you leave, we hope you can suggest us some improvements 
        in a reply to thuis mail`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}

